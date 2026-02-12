import uuid
from datetime import date, timedelta

import jwt
from django.conf import settings
from django.db import transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.guests.models import Guest
from apps.organizations.models import BankAccount, Organization, Property
from apps.pricing.engine import calculate_nightly_prices, calculate_total
from apps.reservations.models import Reservation
from apps.rooms.models import Room, RoomType

from .permissions import IsAuthenticatedGuest
from .combinations import find_group_combinations
from .serializers import (
    AvailabilityResultSerializer,
    CombinationResultSerializer,
    GroupReservationConfirmationSerializer,
    GuestLoginSerializer,
    GuestReservationListSerializer,
    OrganizationInfoSerializer,
    PublicBankAccountSerializer,
    PublicGroupReservationSerializer,
    PublicReservationSerializer,
    ReservationConfirmationSerializer,
    RoomTypeDetailSerializer,
    RoomTypeListSerializer,
)


def get_organization(org_slug):
    return get_object_or_404(
        Organization, subdomain=org_slug, is_active=True
    )


def get_org_properties(org):
    return Property.objects.filter(organization=org, is_active=True)


class ResolveDomainView(APIView):
    """Resolve a hostname to an organization slug."""
    permission_classes = [AllowAny]

    def get(self, request):
        host = request.query_params.get("host", "").lower().strip()
        if not host:
            return Response(
                {"detail": "Se requiere el parámetro 'host'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Try custom_domain on Organization first
        org = Organization.objects.filter(
            custom_domain__iexact=host, is_active=True
        ).first()
        if not org:
            # Try subdomain (e.g., "hotel-arena-blanca" from "hotel-arena-blanca.lervi.com")
            subdomain = host.split(".")[0]
            org = Organization.objects.filter(
                subdomain=subdomain, is_active=True
            ).first()
        if not org:
            return Response(
                {"detail": "Organización no encontrada para este dominio."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response({"slug": org.subdomain, "name": org.name})


class OrganizationInfoView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, org_slug):
        org = get_organization(org_slug)
        serializer = OrganizationInfoSerializer(org)
        return Response(serializer.data)


class RoomTypeListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, org_slug):
        org = get_organization(org_slug)
        properties = get_org_properties(org)

        # Optional property filter
        property_slug = request.query_params.get("property")
        if property_slug:
            properties = properties.filter(slug=property_slug)

        room_types = (
            RoomType.objects.filter(property__in=properties, is_active=True)
            .select_related("property")
            .prefetch_related("photos")
        )
        serializer = RoomTypeListSerializer(room_types, many=True)
        return Response(serializer.data)


class RoomTypeDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, org_slug, room_type_id):
        org = get_organization(org_slug)
        properties = get_org_properties(org)
        room_type = get_object_or_404(
            RoomType.objects.select_related("property").prefetch_related(
                "photos", "bed_configurations__details"
            ),
            id=room_type_id,
            property__in=properties,
            is_active=True,
        )
        serializer = RoomTypeDetailSerializer(room_type)
        return Response(serializer.data)


class AvailabilityView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, org_slug):
        org = get_organization(org_slug)
        properties = get_org_properties(org)

        # Optional property filter
        property_slug = request.query_params.get("property")
        if property_slug:
            properties = properties.filter(slug=property_slug)

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

        # Active reservation statuses
        active_statuses = [
            Reservation.OperationalStatus.INCOMPLETE,
            Reservation.OperationalStatus.PENDING,
            Reservation.OperationalStatus.CONFIRMED,
            Reservation.OperationalStatus.CHECK_IN,
        ]

        results = []
        all_available = []  # Para combinaciones: todos los tipos disponibles

        for prop in properties:
            # Buscar TODOS los tipos activos (sin filtro max_adults) para disponibilidad
            all_room_types = RoomType.objects.filter(
                property=prop,
                is_active=True,
            ).select_related("property").prefetch_related("photos")

            for rt in all_room_types:
                eligible_room_ids = set(
                    Room.objects.filter(property=prop, room_types=rt).values_list("id", flat=True)
                )
                total_rooms = len(eligible_room_ids)

                busy_room_ids = set(
                    Reservation.objects.filter(
                        property=prop,
                        room_id__in=eligible_room_ids,
                        operational_status__in=active_statuses,
                        check_in_date__lt=check_out_date,
                        check_out_date__gt=check_in_date,
                    ).values_list("room_id", flat=True)
                )

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
                    all_available.append({
                        "room_type": rt,
                        "available_rooms": available,
                        "property": prop,
                    })

                    # Solo incluir en results individuales si cabe el grupo
                    if rt.max_adults >= adults:
                        nightly_prices = calculate_nightly_prices(
                            property_obj=prop,
                            room_type=rt,
                            check_in=check_in_date,
                            check_out=check_out_date,
                            adults=adults,
                            children=children,
                        )
                        total = calculate_total(nightly_prices)

                        results.append({
                            "room_type": rt,
                            "available_rooms": available,
                            "nightly_prices": nightly_prices,
                            "total": total,
                            "property_name": prop.name,
                            "property_slug": prop.slug,
                        })

        # Generar combinaciones agrupadas por property
        combinations = []
        if adults + children > 1:
            props_available = {}
            for item in all_available:
                p = item["property"]
                props_available.setdefault(p.id, {"property": p, "types": []})
                props_available[p.id]["types"].append(item)

            for prop_data in props_available.values():
                prop_combos = find_group_combinations(
                    available_room_types=prop_data["types"],
                    total_adults=adults,
                    total_children=children,
                    property_obj=prop_data["property"],
                    check_in=check_in_date,
                    check_out=check_out_date,
                )
                combinations.extend(prop_combos)

        results_serializer = AvailabilityResultSerializer(results, many=True)
        combinations_serializer = CombinationResultSerializer(combinations, many=True)

        return Response({
            "results": results_serializer.data,
            "combinations": combinations_serializer.data,
        })


class CreateReservationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, org_slug):
        org = get_organization(org_slug)
        serializer = PublicReservationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # Resolve room type within org's properties
        properties = get_org_properties(org)
        room_type = get_object_or_404(
            RoomType,
            id=data["room_type_id"],
            property__in=properties,
            is_active=True,
        )
        prop = room_type.property

        # Validate capacity
        if data["adults"] > room_type.max_adults:
            return Response(
                {"detail": f"Este tipo de habitación permite máximo {room_type.max_adults} adultos."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check availability
        active_statuses = [
            Reservation.OperationalStatus.INCOMPLETE,
            Reservation.OperationalStatus.PENDING,
            Reservation.OperationalStatus.CONFIRMED,
            Reservation.OperationalStatus.CHECK_IN,
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
            adults=data["adults"],
            children=data.get("children", 0),
        )
        total = calculate_total(nightly_prices)

        # Get or create guest
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
            Q(organization=org, property__isnull=True) | Q(property=prop),
            is_active=True,
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
            operational_status=Reservation.OperationalStatus.INCOMPLETE,
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


class CreateGroupReservationView(APIView):
    """Crear reservas grupales vinculadas por group_code."""
    permission_classes = [AllowAny]

    def post(self, request, org_slug):
        org = get_organization(org_slug)
        serializer = PublicGroupReservationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        properties = get_org_properties(org)
        group_code = uuid.uuid4().hex[:8].upper()

        # Get or create guest (una sola vez)
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

        active_statuses = [
            Reservation.OperationalStatus.INCOMPLETE,
            Reservation.OperationalStatus.PENDING,
            Reservation.OperationalStatus.CONFIRMED,
            Reservation.OperationalStatus.CHECK_IN,
        ]

        reservations = []
        total_group = 0

        with transaction.atomic():
            for room_item in data["rooms"]:
                room_type = get_object_or_404(
                    RoomType,
                    id=room_item["room_type_id"],
                    property__in=properties,
                    is_active=True,
                )
                prop = room_type.property

                # Validate capacity
                if room_item["adults"] > room_type.max_adults:
                    return Response(
                        {"detail": f"{room_type.name} permite máximo {room_type.max_adults} adultos."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # Check availability
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
                available = len(eligible_room_ids) - len(busy_room_ids) - unassigned_count
                if available <= 0:
                    return Response(
                        {"detail": f"No hay disponibilidad para {room_type.name}."},
                        status=status.HTTP_409_CONFLICT,
                    )

                # Calculate price
                nightly_prices = calculate_nightly_prices(
                    property_obj=prop,
                    room_type=room_type,
                    check_in=data["check_in_date"],
                    check_out=data["check_out_date"],
                    adults=room_item["adults"],
                    children=room_item.get("children", 0),
                )
                total = calculate_total(nightly_prices)

                # Check if property has active bank accounts
                has_bank_accounts = BankAccount.objects.filter(
                    property=prop, is_active=True,
                ).exists()

                payment_deadline = None
                if has_bank_accounts:
                    payment_deadline = timezone.now() + timedelta(hours=1)

                reservation = Reservation.objects.create(
                    organization=org,
                    property=prop,
                    guest=guest,
                    room_type=room_type,
                    check_in_date=data["check_in_date"],
                    check_out_date=data["check_out_date"],
                    adults=room_item["adults"],
                    children=room_item.get("children", 0),
                    total_amount=total,
                    currency=org.currency,
                    origin_type=Reservation.OriginType.WEBSITE,
                    origin_metadata={"source": "front-pagina", "group": True},
                    special_requests=data.get("special_requests", ""),
                    operational_status=Reservation.OperationalStatus.INCOMPLETE,
                    financial_status=Reservation.FinancialStatus.PENDING_PAYMENT,
                    payment_deadline=payment_deadline,
                    group_code=group_code,
                )

                total_group += total
                reservations.append({
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

        result = GroupReservationConfirmationSerializer({
            "group_code": group_code,
            "reservations": reservations,
            "total_amount": total_group,
            "currency": org.currency,
        })
        return Response(result.data, status=status.HTTP_201_CREATED)


class ReservationLookupView(APIView):
    """Consultar reserva por código de confirmación."""
    permission_classes = [AllowAny]

    def get(self, request, org_slug, confirmation_code):
        org = get_organization(org_slug)
        reservation = get_object_or_404(
            Reservation.objects.select_related("room_type", "guest", "property"),
            organization=org,
            confirmation_code=confirmation_code.upper(),
        )
        prop = reservation.property
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
                Q(organization=org, property__isnull=True) | Q(property=prop),
                is_active=True,
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
    """Lista de cuentas bancarias activas (público)."""
    permission_classes = [AllowAny]

    def get(self, request, org_slug):
        org = get_organization(org_slug)
        properties = get_org_properties(org)

        # Optional property filter
        property_slug = request.query_params.get("property")
        if property_slug:
            properties = properties.filter(slug=property_slug)

        # Organization-level + property-level accounts
        accounts = BankAccount.objects.filter(
            Q(organization=org, property__isnull=True) |
            Q(property__in=properties),
            is_active=True,
        )
        serializer = PublicBankAccountSerializer(accounts, many=True)
        return Response(serializer.data)


class VoucherUploadView(APIView):
    """Subir comprobante de pago para una reserva."""
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser]

    def post(self, request, org_slug, confirmation_code):
        org = get_organization(org_slug)
        reservation = get_object_or_404(
            Reservation,
            organization=org,
            confirmation_code=confirmation_code.upper(),
        )

        # Validate status
        if reservation.operational_status != Reservation.OperationalStatus.INCOMPLETE:
            return Response(
                {"detail": "Solo se puede subir voucher para reservas incompletas."},
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
        reservation.operational_status = Reservation.OperationalStatus.PENDING
        reservation.save(update_fields=["voucher_image", "operational_status", "updated_at"])

        return Response(
            {"detail": "Comprobante subido exitosamente. Pendiente de confirmacion."},
            status=status.HTTP_200_OK,
        )


class GuestLoginView(APIView):
    """Login de huésped con tipo y número de documento."""
    permission_classes = [AllowAny]

    def post(self, request, org_slug):
        org = get_organization(org_slug)
        serializer = GuestLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        guest = Guest.objects.filter(
            organization=org,
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
    """Lista de reservas de un huésped autenticado (todas las properties de la org)."""
    permission_classes = [IsAuthenticatedGuest]

    def get(self, request, org_slug):
        org = get_organization(org_slug)
        reservations = Reservation.objects.filter(
            organization=org,
            guest=request.guest,
        ).select_related("room_type", "property").order_by("-check_in_date")

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
                "property_name": r.property.name,
            })

        serializer = GuestReservationListSerializer(results, many=True)
        return Response(serializer.data)


class GuestCancelReservationView(APIView):
    """Cancelar una reserva pendiente del huésped."""
    permission_classes = [IsAuthenticatedGuest]

    def post(self, request, org_slug, confirmation_code):
        org = get_organization(org_slug)
        reservation = get_object_or_404(
            Reservation,
            organization=org,
            confirmation_code=confirmation_code.upper(),
            guest=request.guest,
        )

        if reservation.operational_status not in (
            Reservation.OperationalStatus.INCOMPLETE,
            Reservation.OperationalStatus.PENDING,
        ):
            return Response(
                {"detail": "Solo se pueden cancelar reservas incompletas o pendientes."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        reservation.operational_status = Reservation.OperationalStatus.CANCELLED
        reservation.save(update_fields=["operational_status", "updated_at"])

        return Response({"detail": "Reserva cancelada exitosamente."})
