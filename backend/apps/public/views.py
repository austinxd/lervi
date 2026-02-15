import logging
import uuid
from datetime import date, timedelta

import jwt
import requests as http_requests
from django.conf import settings
from django.db import transaction
from django.db.models import Min, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.text import slugify
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
from apps.identity.services import (
    create_identity_link,
    get_identity_data,
    get_or_create_identity,
    get_guest_for_identity,
    has_link_in_org,
    lookup_identity,
    request_otp,
    verify_otp,
)
from apps.identity.models import IdentityLink
from apps.identity.utils import encrypt_value, normalize_document

from .serializers import (
    AvailabilityResultSerializer,
    CombinationResultSerializer,
    ContactSerializer,
    GroupReservationConfirmationSerializer,
    GuestActivateSerializer,
    GuestLoginSerializer,
    GuestLookupSerializer,
    GuestVerifyEmailSerializer,
    GuestProfileSerializer,
    GuestRegisterSerializer,
    GuestRequestOTPSerializer,
    GuestReservationListSerializer,
    OrganizationInfoSerializer,
    PublicBankAccountSerializer,
    PublicGroupReservationSerializer,
    PublicHotelListSerializer,
    PublicReservationSerializer,
    RegisterHotelSerializer,
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
    throttle_scope = "reservation_create"

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

        active_statuses = [
            Reservation.OperationalStatus.INCOMPLETE,
            Reservation.OperationalStatus.PENDING,
            Reservation.OperationalStatus.CONFIRMED,
            Reservation.OperationalStatus.CHECK_IN,
        ]

        with transaction.atomic():
            # Lock overlapping reservations to prevent race conditions
            Reservation.objects.select_for_update().filter(
                property=prop,
                operational_status__in=active_statuses,
                check_in_date__lt=data["check_out_date"],
                check_out_date__gt=data["check_in_date"],
            ).exists()

            # Check availability inside the lock
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

            # Get or create guest — prefer document lookup (consistent with
            # registration/login) and fall back to email for legacy callers.
            doc_type = data.get("document_type", "")
            doc_number = data.get("document_number", "")
            if doc_type and doc_number:
                guest, _ = Guest.objects.get_or_create(
                    organization=org,
                    document_type=doc_type,
                    document_number=doc_number,
                    defaults={
                        "first_name": data["first_name"],
                        "last_name": data["last_name"],
                        "email": data["email"],
                        "phone": data.get("phone", ""),
                        "nationality": data.get("nationality", ""),
                    },
                )
            else:
                guest, _ = Guest.objects.get_or_create(
                    organization=org,
                    email=data["email"],
                    defaults={
                        "first_name": data["first_name"],
                        "last_name": data["last_name"],
                        "phone": data.get("phone", ""),
                        "document_type": doc_type,
                        "document_number": doc_number,
                        "nationality": data.get("nationality", ""),
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

        # Get or create guest (una sola vez) — prefer document lookup
        doc_type = data.get("document_type", "")
        doc_number = data.get("document_number", "")
        if doc_type and doc_number:
            guest, _ = Guest.objects.get_or_create(
                organization=org,
                document_type=doc_type,
                document_number=doc_number,
                defaults={
                    "first_name": data["first_name"],
                    "last_name": data["last_name"],
                    "email": data["email"],
                    "phone": data.get("phone", ""),
                    "nationality": data.get("nationality", ""),
                },
            )
        else:
            guest, _ = Guest.objects.get_or_create(
                organization=org,
                email=data["email"],
                defaults={
                    "first_name": data["first_name"],
                    "last_name": data["last_name"],
                    "phone": data.get("phone", ""),
                    "document_type": doc_type,
                    "document_number": doc_number,
                    "nationality": data.get("nationality", ""),
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
        response_data["financial_status"] = reservation.financial_status

        total_paid = sum(
            p.amount for p in reservation.payments.filter(status="completed")
        )
        response_data["total_paid"] = str(total_paid)
        response_data["amount_due"] = str(max(reservation.total_amount - total_paid, 0))

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

        # Validate status: allow incomplete (first voucher) or partial payment (additional voucher)
        is_incomplete = reservation.operational_status == Reservation.OperationalStatus.INCOMPLETE
        is_partial = reservation.financial_status in ("pending_payment", "partial")
        if not is_incomplete and not is_partial:
            return Response(
                {"detail": "No se puede subir comprobante en el estado actual."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate deadline only for first voucher (incomplete)
        if is_incomplete and reservation.payment_deadline and timezone.now() > reservation.payment_deadline:
            return Response(
                {"detail": "El plazo para subir el comprobante ha expirado."},
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
        update_fields = ["voucher_image", "updated_at"]
        if is_incomplete:
            reservation.operational_status = Reservation.OperationalStatus.PENDING
            update_fields.append("operational_status")
        reservation.save(update_fields=update_fields)

        return Response(
            {"detail": "Comprobante subido exitosamente. Pendiente de confirmacion."},
            status=status.HTTP_200_OK,
        )


def _generate_guest_token(guest):
    """Generate a JWT token for an authenticated guest."""
    payload = {
        "type": "guest",
        "guest_id": str(guest.id),
        "organization_id": str(guest.organization_id),
        "guest_name": guest.full_name,
        "exp": timezone.now() + timedelta(hours=2),
        "iat": timezone.now(),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")


class GuestRegisterView(APIView):
    """Registro de huésped con contraseña."""
    permission_classes = [AllowAny]
    throttle_scope = "guest_register"

    def post(self, request, org_slug):
        org = get_organization(org_slug)
        serializer = GuestRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        doc_number = normalize_document(data["document_number"])

        # 1. Check if a guest with the same document already exists
        existing_by_doc = Guest.objects.filter(
            organization=org,
            document_type=data["document_type"],
            document_number=doc_number,
        ).first()

        if existing_by_doc:
            if existing_by_doc.has_password:
                return Response(
                    {"detail": "Ya existe una cuenta con este documento. Inicie sesión."},
                    status=status.HTTP_409_CONFLICT,
                )
            # Guest exists from a prior reservation but no password — claim it
            existing_by_doc.first_name = data["first_name"]
            existing_by_doc.last_name = data["last_name"]
            existing_by_doc.email = data["email"]
            existing_by_doc.phone = data.get("phone", "")
            existing_by_doc.nationality = data.get("nationality", "")
            existing_by_doc.set_password(data["password"])
            existing_by_doc.is_verified = False
            existing_by_doc.last_login = timezone.now()
            existing_by_doc.save()
            guest = existing_by_doc

        else:
            # 2. Check if a guest with the same email exists (from old reservations)
            existing_by_email = Guest.objects.filter(
                organization=org,
                email=data["email"],
            ).first()

            if existing_by_email and not existing_by_email.has_password:
                # Claim existing guest record — update with document info + password
                existing_by_email.first_name = data["first_name"]
                existing_by_email.last_name = data["last_name"]
                existing_by_email.phone = data.get("phone", "")
                existing_by_email.document_type = data["document_type"]
                existing_by_email.document_number = doc_number
                existing_by_email.nationality = data.get("nationality", "")
                existing_by_email.set_password(data["password"])
                existing_by_email.is_verified = False
                existing_by_email.last_login = timezone.now()
                existing_by_email.save()
                guest = existing_by_email
            elif existing_by_email and existing_by_email.has_password:
                return Response(
                    {"detail": "Ya existe una cuenta con este email. Inicie sesión."},
                    status=status.HTTP_409_CONFLICT,
                )
            else:
                # 3. No existing guest — create new
                guest = Guest.objects.create(
                    organization=org,
                    first_name=data["first_name"],
                    last_name=data["last_name"],
                    email=data["email"],
                    phone=data.get("phone", ""),
                    document_type=data["document_type"],
                    document_number=doc_number,
                    nationality=data.get("nationality", ""),
                    is_verified=False,
                    last_login=timezone.now(),
                )
                guest.set_password(data["password"])
                guest.save(update_fields=["password_hash"])

        # Create GlobalIdentity + Link
        identity = get_or_create_identity(
            document_type=data["document_type"],
            document_number=doc_number,
            email=data["email"],
            full_name=guest.full_name,
            phone=data.get("phone", ""),
            nationality=data.get("nationality", ""),
        )
        create_identity_link(identity, org, guest)

        # Send welcome email with verification code
        from apps.common.email import send_welcome_email
        from apps.identity.utils import generate_otp_code
        from apps.identity.models import OTPCode
        import logging
        _logger = logging.getLogger(__name__)
        if data["email"]:
            code = generate_otp_code()
            otp_lifetime = getattr(settings, "OTP_LIFETIME_MINUTES", 10)
            OTPCode.objects.create(
                identity=identity,
                code=code,
                expires_at=timezone.now() + timedelta(minutes=otp_lifetime),
            )
            try:
                send_welcome_email(data["email"], guest.full_name, code, from_name=org.name)
            except Exception as exc:
                _logger.exception("Welcome email failed: %s", exc)

        return Response({
            "access": _generate_guest_token(guest),
            "guest_name": guest.full_name,
            "guest_id": str(guest.id),
            "is_verified": guest.is_verified,
        }, status=status.HTTP_201_CREATED)


class GuestLoginView(APIView):
    """Login de huésped con documento y contraseña."""
    permission_classes = [AllowAny]
    throttle_scope = "guest_login"

    def post(self, request, org_slug):
        org = get_organization(org_slug)
        serializer = GuestLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        doc_number = normalize_document(data["document_number"])

        guest = Guest.objects.filter(
            organization=org,
            document_type=data["document_type"],
            document_number=doc_number,
        ).first()

        if not guest:
            return Response(
                {"detail": "No se encontró un huésped con ese documento."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not guest.has_password:
            return Response(
                {"detail": "Esta cuenta no tiene contraseña. Regístrese primero."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not guest.check_password(data["password"]):
            return Response(
                {"detail": "Contraseña incorrecta."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        guest.last_login = timezone.now()
        guest.save(update_fields=["last_login"])

        return Response({
            "access": _generate_guest_token(guest),
            "guest_name": guest.full_name,
            "guest_id": str(guest.id),
        })


class GuestVerifyEmailView(APIView):
    """Verify guest email with OTP code sent during registration."""
    permission_classes = [AllowAny]

    def post(self, request, org_slug):
        org = get_organization(org_slug)
        serializer = GuestVerifyEmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        doc_number = normalize_document(data["document_number"])
        identity, exists = lookup_identity(data["document_type"], doc_number)

        if not exists:
            return Response(
                {"detail": "Identidad no encontrada."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not verify_otp(identity, data["code"]):
            return Response(
                {"detail": "Codigo invalido o expirado."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Mark guest as verified
        guest = Guest.objects.filter(
            organization=org,
            document_type=data["document_type"],
            document_number=doc_number,
        ).first()

        if not guest:
            return Response(
                {"detail": "Huesped no encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )

        guest.is_verified = True
        guest.save(update_fields=["is_verified"])

        return Response({
            "detail": "Email verificado exitosamente.",
            "is_verified": True,
        })


class GuestLookupView(APIView):
    """Lookup: check if a document has an existing identity."""
    permission_classes = [AllowAny]

    def post(self, request, org_slug):
        org = get_organization(org_slug)
        serializer = GuestLookupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        doc_number = normalize_document(data["document_number"])
        identity, exists = lookup_identity(data["document_type"], doc_number)

        if not exists:
            # Check local Guest table (pre-identity guests)
            local_guest = Guest.objects.filter(
                organization=org,
                document_type=data["document_type"],
                document_number=doc_number,
            ).first()
            if local_guest:
                # Create GlobalIdentity from this guest so cross-hotel works
                local_identity = get_or_create_identity(
                    document_type=data["document_type"],
                    document_number=doc_number,
                    email=local_guest.email,
                    full_name=local_guest.full_name,
                    phone=local_guest.phone,
                    nationality=local_guest.nationality,
                )
                create_identity_link(local_identity, org, local_guest)
                if local_guest.has_password:
                    return Response({"status": "login"})
                return Response({"status": "register"})

            # No identity and no local guest — check if guest exists in ANY org
            any_guest = Guest.objects.filter(
                document_type=data["document_type"],
                document_number=doc_number,
            ).first()
            if any_guest:
                # Create GlobalIdentity so cross-hotel activation works
                identity = get_or_create_identity(
                    document_type=data["document_type"],
                    document_number=doc_number,
                    email=any_guest.email,
                    full_name=any_guest.full_name,
                    phone=any_guest.phone,
                    nationality=any_guest.nationality,
                )
                create_identity_link(identity, any_guest.organization, any_guest)
                return Response({"status": "recognized"})

            return Response({"status": "new"})

        # Check if there's already a guest linked in this org
        if has_link_in_org(identity, org):
            guest = get_guest_for_identity(identity, org)
            if guest and guest.has_password:
                return Response({"status": "login"})
            # Guest exists but no password — try to copy from another org
            if guest:
                source_link = (
                    IdentityLink.objects.filter(identity=identity)
                    .exclude(organization=org)
                    .select_related("guest")
                    .first()
                )
                if source_link and source_link.guest and source_link.guest.has_password:
                    guest.password_hash = source_link.guest.password_hash
                    guest.save(update_fields=["password_hash"])
                    return Response({"status": "login"})
            return Response({"status": "register"})

        # Identity exists globally but not in this org
        # Check if it has any links at all (guest may have been deleted)
        if not identity.links.exists():
            return Response({"status": "new"})

        # Recognized cross-hotel
        return Response({"status": "recognized"})


class GuestRequestOTPView(APIView):
    """Request an OTP code for identity verification."""
    permission_classes = [AllowAny]
    throttle_scope = "otp_request"

    def post(self, request, org_slug):
        org = get_organization(org_slug)
        serializer = GuestRequestOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        doc_number = normalize_document(data["document_number"])
        identity, exists = lookup_identity(data["document_type"], doc_number)

        if not exists:
            # Check if guest exists locally — create identity with their email
            guest = Guest.objects.filter(
                organization=org,
                document_type=data["document_type"],
                document_number=doc_number,
            ).first()
            if guest and guest.email:
                identity = get_or_create_identity(
                    document_type=data["document_type"],
                    document_number=doc_number,
                    email=guest.email,
                    full_name=guest.full_name,
                )
            else:
                return Response(
                    {"detail": "Identidad no encontrada. Registrese primero."},
                    status=status.HTTP_404_NOT_FOUND,
                )

        # If identity exists but has no email, try to fill it from local guest
        if not identity.encrypted_email:
            guest = Guest.objects.filter(
                organization=org,
                document_type=data["document_type"],
                document_number=doc_number,
            ).first()
            if guest and guest.email:
                identity.encrypted_email = encrypt_value(guest.email)
                identity.save(update_fields=["encrypted_email"])

        result = request_otp(identity, organization_name=org.name)
        if "error" in result:
            return Response(
                {"detail": result["error"], "retry_after": result.get("retry_after")},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        return Response({"detail": "Codigo enviado a su email."})


class GuestIdentityDataView(APIView):
    """Return pre-filled guest data from GlobalIdentity after OTP verification."""
    permission_classes = [AllowAny]

    def post(self, request, org_slug):
        """POST with document_type + document_number → returns stored PII."""
        get_organization(org_slug)  # validate org exists
        doc_type = request.data.get("document_type", "")
        doc_number = normalize_document(request.data.get("document_number", ""))
        identity, exists = lookup_identity(doc_type, doc_number)
        if not exists:
            return Response({})
        return Response(get_identity_data(identity))


class GuestActivateView(APIView):
    """Activate a guest in a new org using OTP verification."""
    permission_classes = [AllowAny]

    def post(self, request, org_slug):
        org = get_organization(org_slug)
        serializer = GuestActivateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        doc_number = normalize_document(data["document_number"])
        identity, exists = lookup_identity(data["document_type"], doc_number)

        if not exists:
            return Response(
                {"detail": "Identidad no encontrada."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Verify OTP
        if not verify_otp(identity, data["code"]):
            return Response(
                {"detail": "Codigo invalido o expirado."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Fill missing fields from GlobalIdentity
        id_data = get_identity_data(identity)
        first_name = data.get("first_name") or id_data.get("first_name", "")
        last_name = data.get("last_name") or id_data.get("last_name", "")
        email = data.get("email") or id_data.get("email", "")
        phone = data.get("phone") or id_data.get("phone", "")
        nationality = data.get("nationality") or id_data.get("nationality", "")

        # Copy password from existing guest in another org
        password_hash = ""
        source_link = (
            IdentityLink.objects.filter(identity=identity)
            .exclude(organization=org)
            .select_related("guest")
            .first()
        )
        if source_link and source_link.guest and source_link.guest.has_password:
            password_hash = source_link.guest.password_hash

        # Get or create Guest in this org
        guest, created = Guest.objects.get_or_create(
            organization=org,
            document_type=data["document_type"],
            document_number=doc_number,
            defaults={
                "first_name": first_name,
                "last_name": last_name,
                "email": email,
                "phone": phone,
                "nationality": nationality,
                "password_hash": password_hash,
                "is_verified": True,
                "last_login": timezone.now(),
            },
        )
        if not created:
            guest.is_verified = True
            guest.last_login = timezone.now()
            update_fields = ["is_verified", "last_login"]
            if not guest.has_password and password_hash:
                guest.password_hash = password_hash
                update_fields.append("password_hash")
            guest.save(update_fields=update_fields)

        # Create link
        create_identity_link(identity, org, guest)

        # Update identity last_seen
        identity.last_seen_at = timezone.now()
        identity.save(update_fields=["last_seen_at"])

        # Send welcome email
        if email:
            from apps.common.email import send_activate_welcome_email
            try:
                send_activate_welcome_email(email, guest.full_name, hotel_name=org.name)
            except Exception as exc:
                _logger.exception("Welcome email on activate failed: %s", exc)

        return Response({
            "access": _generate_guest_token(guest),
            "guest_name": guest.full_name,
            "guest_id": str(guest.id),
        }, status=status.HTTP_201_CREATED)


class GuestProfileView(APIView):
    """Datos del huésped autenticado para pre-llenar formularios."""
    authentication_classes = []
    permission_classes = [IsAuthenticatedGuest]

    def get(self, request, org_slug):
        guest = request.guest
        serializer = GuestProfileSerializer({
            "first_name": guest.first_name,
            "last_name": guest.last_name,
            "email": guest.email,
            "phone": guest.phone,
            "document_type": guest.document_type,
            "document_number": guest.document_number,
            "nationality": guest.nationality,
        })
        return Response(serializer.data)


class GuestReservationsView(APIView):
    """Lista de reservas de un huésped autenticado (todas las properties de la org)."""
    authentication_classes = []
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
                "payment_deadline": r.payment_deadline,
            })

        serializer = GuestReservationListSerializer(results, many=True)
        return Response(serializer.data)


class GuestCancelReservationView(APIView):
    """Cancelar una reserva pendiente del huésped."""
    authentication_classes = []
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


logger = logging.getLogger(__name__)


class PublicHotelSearchView(APIView):
    """Search active hotels/organizations publicly."""
    permission_classes = [AllowAny]

    def get(self, request):
        # Get active orgs that have at least one active property
        orgs = Organization.objects.filter(
            is_active=True,
            properties__is_active=True,
        ).distinct()

        # Search filters
        q = request.query_params.get("q", "").strip()
        city = request.query_params.get("city", "").strip()
        stars = request.query_params.get("stars")

        if q:
            orgs = orgs.filter(
                Q(name__icontains=q) | Q(properties__name__icontains=q)
            ).distinct()

        results = []
        for org in orgs:
            for prop in org.properties.filter(is_active=True):
                if city and prop.city.lower() != city.lower():
                    continue
                if stars:
                    try:
                        if prop.stars != int(stars):
                            continue
                    except (ValueError, TypeError):
                        pass

                min_price = RoomType.objects.filter(
                    property=prop, is_active=True
                ).aggregate(min_price=Min("base_price"))["min_price"]

                results.append({
                    "org_name": org.name,
                    "subdomain": org.subdomain,
                    "logo": org.logo,
                    "theme_template": org.theme_template,
                    "property_name": prop.name,
                    "city": prop.city,
                    "country": prop.country,
                    "stars": prop.stars,
                    "hero_image": prop.hero_image if prop.hero_image else None,
                    "tagline": prop.tagline,
                    "amenities": (prop.amenities or [])[:5],
                    "min_price": min_price,
                })

        # Manual pagination
        page = int(request.query_params.get("page", 1))
        page_size = 12
        start = (page - 1) * page_size
        end = start + page_size
        paginated = results[start:end]

        serializer = PublicHotelListSerializer(paginated, many=True)
        return Response({
            "count": len(results),
            "page": page,
            "page_size": page_size,
            "results": serializer.data,
        })


class RegisterHotelView(APIView):
    """Register a new hotel (organization + property + owner user)."""
    permission_classes = [AllowAny]
    throttle_scope = "hotel_register"

    def post(self, request):
        from apps.users.models import User

        serializer = RegisterHotelSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # Generate unique subdomain from hotel name
        base_slug = slugify(data["hotel_name"])[:50]
        subdomain = base_slug
        counter = 1
        while Organization.objects.filter(subdomain=subdomain).exists():
            subdomain = f"{base_slug}-{counter}"
            counter += 1

        with transaction.atomic():
            # 1. Create Organization
            org_kwargs = dict(
                name=data["hotel_name"],
                subdomain=subdomain,
                currency="PEN",
                plan="starter",
                theme_template=data.get("template", "signature"),
            )
            if data.get("primary_color"):
                org_kwargs["primary_color"] = data["primary_color"]
            org = Organization.objects.create(**org_kwargs)

            # 2. Create Property
            prop_slug = slugify(data["hotel_name"])[:100]
            prop = Property.objects.create(
                organization=org,
                name=data["hotel_name"],
                slug=prop_slug,
                city=data.get("city", ""),
                country=data.get("country", "PE"),
            )

            # 3. Create owner User
            name_parts = data["owner_name"].split(" ", 1)
            first_name = name_parts[0]
            last_name = name_parts[1] if len(name_parts) > 1 else ""

            user = User.objects.create_user(
                email=data["owner_email"],
                password=data["owner_password"],
                first_name=first_name,
                last_name=last_name,
                role=User.Role.OWNER,
                organization=org,
            )
            user.properties.add(prop)

        # 4. Send welcome email (best-effort)
        try:
            import resend
            resend.api_key = settings.RESEND_API_KEY
            if settings.RESEND_API_KEY:
                resend.Emails.send({
                    "from": settings.RESEND_FROM_EMAIL,
                    "to": [data["owner_email"]],
                    "subject": f"Bienvenido a Lervi — {data['hotel_name']}",
                    "html": f"""
                        <h2>¡Bienvenido a Lervi!</h2>
                        <p>Hola {first_name},</p>
                        <p>Tu hotel <strong>{data['hotel_name']}</strong> ya está registrado.</p>
                        <p>Accede a tu panel de administración:</p>
                        <p><a href="https://admin.lervi.io">admin.lervi.io</a></p>
                        <p>Tu subdominio: <strong>{subdomain}.lervi.io</strong></p>
                        <br>
                        <p>— El equipo de Lervi</p>
                    """,
                })
        except Exception as exc:
            logger.warning("Welcome email failed: %s", exc)

        return Response({
            "organization_subdomain": subdomain,
            "admin_url": "https://admin.lervi.io",
            "message": f"Hotel '{data['hotel_name']}' creado exitosamente.",
        }, status=status.HTTP_201_CREATED)


class ContactView(APIView):
    """Public contact form — sends email and logs."""
    permission_classes = [AllowAny]
    throttle_scope = "contact"

    def post(self, request):
        serializer = ContactSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # Send email (best-effort)
        try:
            import resend
            resend.api_key = settings.RESEND_API_KEY
            if settings.RESEND_API_KEY:
                resend.Emails.send({
                    "from": settings.RESEND_FROM_EMAIL,
                    "to": [settings.RESEND_FROM_EMAIL],
                    "subject": f"[Lervi Contact] {data['name']}",
                    "html": f"""
                        <p><strong>Nombre:</strong> {data['name']}</p>
                        <p><strong>Email:</strong> {data['email']}</p>
                        <p><strong>Mensaje:</strong></p>
                        <p>{data['message']}</p>
                    """,
                })
        except Exception as exc:
            logger.warning("Contact email failed: %s", exc)

        logger.info("Contact form: name=%s email=%s", data["name"], data["email"])

        return Response(
            {"message": "Mensaje enviado. Nos pondremos en contacto pronto."},
            status=status.HTTP_200_OK,
        )


class PublicReniecLookupView(APIView):
    """Consulta RENIEC pública para autocompletar registro de huéspedes."""

    permission_classes = [AllowAny]
    throttle_scope = "reniec_lookup"

    def get(self, request, org_slug):
        dni = request.query_params.get("dni", "")
        if not dni.isdigit() or len(dni) != 8:
            return Response(
                {"detail": "El DNI debe tener exactamente 8 dígitos."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        api_key = settings.RENIEC_API_KEY
        if not api_key:
            return Response(
                {"detail": "Servicio RENIEC no configurado."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        try:
            resp = http_requests.post(
                settings.RENIEC_API_URL,
                json={"dni": dni},
                headers={"X-API-Key": api_key, "Content-Type": "application/json"},
                timeout=10,
            )
            resp.raise_for_status()
            data = resp.json().get("data", {})
            return Response({
                "preNombres": data.get("preNombres", ""),
                "apePaterno": data.get("apePaterno", ""),
                "apeMaterno": data.get("apeMaterno", ""),
            })
        except http_requests.RequestException as exc:
            logger.warning("RENIEC lookup failed for DNI %s: %s", dni, exc)
            return Response(
                {"detail": "No se pudo consultar RENIEC."},
                status=status.HTTP_502_BAD_GATEWAY,
            )
