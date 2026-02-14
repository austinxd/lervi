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
from apps.identity.services import (
    create_identity_link,
    get_or_create_identity,
    get_guest_for_identity,
    has_link_in_org,
    lookup_identity,
    request_otp,
    verify_otp,
)
from apps.identity.utils import normalize_document

from .serializers import (
    AvailabilityResultSerializer,
    CombinationResultSerializer,
    GroupReservationConfirmationSerializer,
    GuestActivateSerializer,
    GuestLoginSerializer,
    GuestLookupSerializer,
    GuestProfileSerializer,
    GuestRegisterSerializer,
    GuestRequestOTPSerializer,
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


def _generate_guest_token(guest):
    """Generate a JWT token for an authenticated guest."""
    payload = {
        "type": "guest",
        "guest_id": str(guest.id),
        "organization_id": str(guest.organization_id),
        "guest_name": guest.full_name,
        "exp": timezone.now() + timedelta(hours=24),
        "iat": timezone.now(),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")


class GuestRegisterView(APIView):
    """Registro de huésped con contraseña."""
    permission_classes = [AllowAny]

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
            existing_by_doc.is_verified = True
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
                existing_by_email.is_verified = True
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
                    is_verified=True,
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
        )
        create_identity_link(identity, org, guest)

        return Response({
            "access": _generate_guest_token(guest),
            "guest_name": guest.full_name,
            "guest_id": str(guest.id),
        }, status=status.HTTP_201_CREATED)


class GuestLoginView(APIView):
    """Login de huésped con documento y contraseña."""
    permission_classes = [AllowAny]

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
            return Response({"status": "new"})

        # Check if there's already a guest linked in this org
        if has_link_in_org(identity, org):
            guest = get_guest_for_identity(identity, org)
            if guest and guest.has_password:
                return Response({"status": "login"})
            # Guest exists but no password (e.g. from a reservation)
            return Response({"status": "register"})

        # Identity exists globally but not in this org — recognized cross-hotel
        return Response({"status": "recognized"})


class GuestRequestOTPView(APIView):
    """Request an OTP code for identity verification."""
    permission_classes = [AllowAny]

    def post(self, request, org_slug):
        get_organization(org_slug)  # validate org exists
        serializer = GuestRequestOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        doc_number = normalize_document(data["document_number"])
        identity, exists = lookup_identity(data["document_type"], doc_number)

        if not exists:
            return Response(
                {"detail": "Identidad no encontrada. Registrese primero."},
                status=status.HTTP_404_NOT_FOUND,
            )

        result = request_otp(identity)
        if "error" in result:
            return Response(
                {"detail": result["error"], "retry_after": result.get("retry_after")},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        return Response({"detail": "Codigo enviado a su email."})


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

        # Get or create Guest in this org
        guest, created = Guest.objects.get_or_create(
            organization=org,
            document_type=data["document_type"],
            document_number=doc_number,
            defaults={
                "first_name": data["first_name"],
                "last_name": data["last_name"],
                "email": data["email"],
                "phone": data.get("phone", ""),
                "nationality": data.get("nationality", ""),
                "is_verified": True,
                "last_login": timezone.now(),
            },
        )
        if not created:
            guest.is_verified = True
            guest.last_login = timezone.now()
            guest.save(update_fields=["is_verified", "last_login"])

        # Create link
        create_identity_link(identity, org, guest)

        # Update identity last_seen
        identity.last_seen_at = timezone.now()
        identity.save(update_fields=["last_seen_at"])

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
