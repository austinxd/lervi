from datetime import date, timedelta

import jwt
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.guests.models import Guest
from apps.organizations.models import BankAccount, Property
from apps.pricing.engine import calculate_nightly_prices, calculate_total
from apps.reservations.models import Reservation
from apps.rooms.models import Room, RoomType

from .permissions import IsAuthenticatedGuest
from .serializers import (
    AvailabilityResultSerializer,
    GuestLoginSerializer,
    GuestReservationListSerializer,
    PropertyInfoSerializer,
    PublicBankAccountSerializer,
    PublicReservationSerializer,
    ReservationConfirmationSerializer,
    RoomTypeDetailSerializer,
    RoomTypeListSerializer,
)


def get_property(slug):
    return get_object_or_404(
        Property.objects.select_related("organization"),
        slug=slug,
        is_active=True,
    )


class ResolveDomainView(APIView):
    """Resolve a hostname to a property slug."""
    permission_classes = [AllowAny]

    def get(self, request):
        host = request.query_params.get("host", "").lower().strip()
        if not host:
            return Response(
                {"detail": "Se requiere el parámetro 'host'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Try custom_domain first
        prop = Property.objects.filter(custom_domain__iexact=host, is_active=True).first()
        if not prop:
            # Try subdomain (e.g., "hotel-arena-blanca" from "hotel-arena-blanca.lervi.com")
            subdomain = host.split(".")[0]
            prop = Property.objects.filter(slug=subdomain, is_active=True).first()
        if not prop:
            return Response(
                {"detail": "Propiedad no encontrada para este dominio."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response({"slug": prop.slug, "name": prop.name})


class PropertyInfoView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, property_slug):
        prop = get_object_or_404(
            Property.objects.select_related("organization").prefetch_related("photos"),
            slug=property_slug,
            is_active=True,
        )
        serializer = PropertyInfoSerializer(prop)
        return Response(serializer.data)


class RoomTypeListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, property_slug):
        prop = get_property(property_slug)
        room_types = (
            RoomType.objects.filter(property=prop, is_active=True)
            .prefetch_related("photos")
        )
        serializer = RoomTypeListSerializer(room_types, many=True)
        return Response(serializer.data)


class RoomTypeDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, property_slug, room_type_id):
        prop = get_property(property_slug)
        room_type = get_object_or_404(
            RoomType.objects.prefetch_related(
                "photos", "bed_configurations__details"
            ),
            id=room_type_id,
            property=prop,
            is_active=True,
        )
        serializer = RoomTypeDetailSerializer(room_type)
        return Response(serializer.data)


class AvailabilityView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, property_slug):
        prop = get_property(property_slug)

        check_in = request.query_params.get("check_in")
        check_out = request.query_params.get("check_out")
        adults = int(request.query_params.get("adults", 1))
        children = int(request.query_params.get("children", 0))

        if not check_in or not check_out:
            return Response(
                {"detail": "Se requieren los parámetros check_in y check_out."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            check_in_date = date.fromisoformat(check_in)
            check_out_date = date.fromisoformat(check_out)
        except ValueError:
            return Response(
                {"detail": "Formato de fecha inválido. Use YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if check_out_date <= check_in_date:
            return Response(
                {"detail": "La fecha de salida debe ser posterior a la de entrada."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if check_in_date < date.today():
            return Response(
                {"detail": "La fecha de entrada no puede ser en el pasado."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        room_types = RoomType.objects.filter(
            property=prop,
            is_active=True,
            max_adults__gte=adults,
        ).prefetch_related("photos")

        # Active reservation statuses
        active_statuses = [
            Reservation.OperationalStatus.CONFIRMED,
            Reservation.OperationalStatus.CHECK_IN,
            Reservation.OperationalStatus.PENDING,
        ]

        results = []
        for rt in room_types:
            # Rooms that can serve this type
            eligible_room_ids = set(
                Room.objects.filter(property=prop, room_types=rt).values_list("id", flat=True)
            )
            total_rooms = len(eligible_room_ids)

            # Rooms already assigned to overlapping reservations (for ANY type)
            busy_room_ids = set(
                Reservation.objects.filter(
                    property=prop,
                    room_id__in=eligible_room_ids,
                    operational_status__in=active_statuses,
                    check_in_date__lt=check_out_date,
                    check_out_date__gt=check_in_date,
                ).values_list("room_id", flat=True)
            )

            # Unassigned reservations for this specific type
            unassigned_count = Reservation.objects.filter(
                property=prop,
                room_type=rt,
                room__isnull=True,
                operational_status__in=active_statuses,
                check_in_date__lt=check_out_date,
                check_out_date__gt=check_in_date,
            ).count()

            available = max(0, total_rooms - len(busy_room_ids) - unassigned_count)

            if available > 0:
                nightly_prices = calculate_nightly_prices(
                    property_obj=prop,
                    room_type=rt,
                    check_in=check_in_date,
                    check_out=check_out_date,
                )
                total = calculate_total(nightly_prices)

                results.append({
                    "room_type": rt,
                    "available_rooms": available,
                    "nightly_prices": nightly_prices,
                    "total": total,
                })

        serializer = AvailabilityResultSerializer(results, many=True)
        return Response(serializer.data)


class CreateReservationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, property_slug):
        prop = get_property(property_slug)
        serializer = PublicReservationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # Validate room type
        room_type = get_object_or_404(
            RoomType,
            id=data["room_type_id"],
            property=prop,
            is_active=True,
        )

        # Validate capacity
        if data["adults"] > room_type.max_adults:
            return Response(
                {"detail": f"Este tipo de habitación permite máximo {room_type.max_adults} adultos."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check availability
        active_statuses = [
            Reservation.OperationalStatus.CONFIRMED,
            Reservation.OperationalStatus.CHECK_IN,
            Reservation.OperationalStatus.PENDING,
        ]
        eligible_room_ids = set(
            Room.objects.filter(property=prop, room_types=room_type).values_list("id", flat=True)
        )
        busy_room_ids = set(
            Reservation.objects.filter(
                property=prop,
                room_id__in=eligible_room_ids,
                operational_status__in=active_statuses,
                check_in_date__lt=data["check_out_date"],
                check_out_date__gt=data["check_in_date"],
            ).values_list("room_id", flat=True)
        )
        unassigned_count = Reservation.objects.filter(
            property=prop,
            room_type=room_type,
            room__isnull=True,
            operational_status__in=active_statuses,
            check_in_date__lt=data["check_out_date"],
            check_out_date__gt=data["check_in_date"],
        ).count()
        total_rooms = len(eligible_room_ids)
        available = total_rooms - len(busy_room_ids) - unassigned_count
        if available <= 0:
            return Response(
                {"detail": "No hay disponibilidad para las fechas seleccionadas."},
                status=status.HTTP_409_CONFLICT,
            )

        # Calculate price
        nightly_prices = calculate_nightly_prices(
            property_obj=prop,
            room_type=room_type,
            check_in=data["check_in_date"],
            check_out=data["check_out_date"],
            promotion_code=data.get("promotion_code") or None,
        )
        total = calculate_total(nightly_prices)

        # Get or create guest
        org = prop.organization
        guest, _ = Guest.objects.get_or_create(
            organization=org,
            email=data["email"],
            defaults={
                "first_name": data["first_name"],
                "last_name": data["last_name"],
                "phone": data.get("phone", ""),
                "document_type": data.get("document_type", ""),
                "document_number": data.get("document_number", ""),
            },
        )

        # Check if property has active bank accounts
        has_bank_accounts = BankAccount.objects.filter(
            property=prop, is_active=True,
        ).exists()

        # Set payment deadline if bank accounts exist (1 hour)
        payment_deadline = None
        if has_bank_accounts:
            payment_deadline = timezone.now() + timedelta(hours=1)

        # Create reservation
        reservation = Reservation.objects.create(
            organization=org,
            property=prop,
            guest=guest,
            room_type=room_type,
            check_in_date=data["check_in_date"],
            check_out_date=data["check_out_date"],
            adults=data["adults"],
            children=data.get("children", 0),
            total_amount=total,
            currency=org.currency,
            origin_type=Reservation.OriginType.WEBSITE,
            origin_metadata={"source": "front-pagina"},
            special_requests=data.get("special_requests", ""),
            operational_status=Reservation.OperationalStatus.PENDING,
            financial_status=Reservation.FinancialStatus.PENDING_PAYMENT,
            payment_deadline=payment_deadline,
        )

        result = ReservationConfirmationSerializer({
            "confirmation_code": reservation.confirmation_code,
            "check_in_date": reservation.check_in_date,
            "check_out_date": reservation.check_out_date,
            "room_type": room_type.name,
            "total_amount": reservation.total_amount,
            "currency": reservation.currency,
            "guest_name": guest.full_name,
            "payment_deadline": reservation.payment_deadline,
            "has_bank_accounts": has_bank_accounts,
        })
        return Response(result.data, status=status.HTTP_201_CREATED)


class ReservationLookupView(APIView):
    """Consultar reserva por código de confirmación."""
    permission_classes = [AllowAny]

    def get(self, request, property_slug, confirmation_code):
        prop = get_property(property_slug)
        reservation = get_object_or_404(
            Reservation.objects.select_related("room_type", "guest"),
            property=prop,
            confirmation_code=confirmation_code.upper(),
        )
        data = {
            "confirmation_code": reservation.confirmation_code,
            "check_in_date": reservation.check_in_date,
            "check_out_date": reservation.check_out_date,
            "room_type": reservation.room_type.name,
            "total_amount": reservation.total_amount,
            "currency": reservation.currency,
            "guest_name": reservation.guest.full_name,
            "payment_deadline": reservation.payment_deadline,
            "has_bank_accounts": BankAccount.objects.filter(
                property=prop, is_active=True,
            ).exists(),
        }
        result = ReservationConfirmationSerializer(data)
        response_data = result.data
        response_data["voucher_image"] = (
            reservation.voucher_image.url if reservation.voucher_image else None
        )
        response_data["operational_status"] = reservation.operational_status
        return Response(response_data)


class BankAccountListView(APIView):
    """Lista de cuentas bancarias activas de una propiedad (público)."""
    permission_classes = [AllowAny]

    def get(self, request, property_slug):
        prop = get_property(property_slug)
        accounts = BankAccount.objects.filter(property=prop, is_active=True)
        serializer = PublicBankAccountSerializer(accounts, many=True)
        return Response(serializer.data)


class VoucherUploadView(APIView):
    """Subir comprobante de pago para una reserva."""
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser]

    def post(self, request, property_slug, confirmation_code):
        prop = get_property(property_slug)
        reservation = get_object_or_404(
            Reservation,
            property=prop,
            confirmation_code=confirmation_code.upper(),
        )

        # Validate status
        if reservation.operational_status != Reservation.OperationalStatus.PENDING:
            return Response(
                {"detail": "Solo se puede subir voucher para reservas pendientes."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate deadline
        if reservation.payment_deadline and timezone.now() > reservation.payment_deadline:
            return Response(
                {"detail": "El plazo para subir el comprobante ha expirado."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate no previous voucher
        if reservation.voucher_image:
            return Response(
                {"detail": "Ya se ha subido un comprobante para esta reserva."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate file
        voucher = request.FILES.get("voucher")
        if not voucher:
            return Response(
                {"detail": "Debe enviar un archivo con el campo 'voucher'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate type
        allowed_types = ["image/jpeg", "image/png", "image/webp"]
        if voucher.content_type not in allowed_types:
            return Response(
                {"detail": "Solo se permiten imágenes JPEG, PNG o WebP."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate size (5MB)
        if voucher.size > 5 * 1024 * 1024:
            return Response(
                {"detail": "El archivo no debe superar los 5 MB."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        reservation.voucher_image = voucher
        reservation.save(update_fields=["voucher_image", "updated_at"])

        return Response(
            {"detail": "Comprobante subido exitosamente."},
            status=status.HTTP_200_OK,
        )


class GuestLoginView(APIView):
    """Login de huésped con tipo y número de documento."""
    permission_classes = [AllowAny]

    def post(self, request, property_slug):
        prop = get_property(property_slug)
        serializer = GuestLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        guest = Guest.objects.filter(
            organization=prop.organization,
            document_type=data["document_type"],
            document_number=data["document_number"],
        ).first()

        if not guest:
            return Response(
                {"detail": "No se encontró un huésped con ese documento."},
                status=status.HTTP_404_NOT_FOUND,
            )

        payload = {
            "guest_id": str(guest.id),
            "organization_id": str(guest.organization_id),
            "guest_name": guest.full_name,
            "exp": timezone.now() + timedelta(hours=24),
            "iat": timezone.now(),
        }
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

        return Response({
            "access": token,
            "guest_name": guest.full_name,
            "guest_id": str(guest.id),
        })


class GuestReservationsView(APIView):
    """Lista de reservas de un huésped autenticado."""
    permission_classes = [IsAuthenticatedGuest]

    def get(self, request, property_slug):
        prop = get_property(property_slug)
        reservations = Reservation.objects.filter(
            property=prop,
            guest=request.guest,
        ).select_related("room_type").order_by("-check_in_date")

        results = []
        for r in reservations:
            results.append({
                "confirmation_code": r.confirmation_code,
                "room_type": r.room_type.name,
                "check_in_date": r.check_in_date,
                "check_out_date": r.check_out_date,
                "operational_status": r.operational_status,
                "financial_status": r.financial_status,
                "total_amount": r.total_amount,
                "currency": r.currency,
                "voucher_image": r.voucher_image.url if r.voucher_image else None,
            })

        serializer = GuestReservationListSerializer(results, many=True)
        return Response(serializer.data)


class GuestCancelReservationView(APIView):
    """Cancelar una reserva pendiente del huésped."""
    permission_classes = [IsAuthenticatedGuest]

    def post(self, request, property_slug, confirmation_code):
        prop = get_property(property_slug)
        reservation = get_object_or_404(
            Reservation,
            property=prop,
            confirmation_code=confirmation_code.upper(),
            guest=request.guest,
        )

        if reservation.operational_status != Reservation.OperationalStatus.PENDING:
            return Response(
                {"detail": "Solo se pueden cancelar reservas pendientes."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        reservation.operational_status = Reservation.OperationalStatus.CANCELLED
        reservation.save(update_fields=["operational_status", "updated_at"])

        return Response({"detail": "Reserva cancelada exitosamente."})
