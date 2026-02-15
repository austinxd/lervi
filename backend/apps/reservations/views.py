from decimal import Decimal

from django.core.exceptions import ValidationError as DjangoValidationError
from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.automations.dispatcher import dispatch_event
from apps.common.mixins import TenantQuerySetMixin
from apps.common.permissions import HasRolePermission
from apps.rooms.constants import room_state_machine
from apps.rooms.models import Room
from apps.rooms.serializers import RoomSerializer

from .constants import financial_state_machine, operational_state_machine
from .models import Payment, Reservation
from .serializers import (
    CheckInSerializer,
    ConfirmPaymentSerializer,
    PaymentSerializer,
    RefundSerializer,
    ReservationCreateSerializer,
    ReservationDetailSerializer,
    ReservationListSerializer,
)


class ReservationViewSet(TenantQuerySetMixin, viewsets.ModelViewSet):
    queryset = Reservation.objects.select_related(
        "guest", "property", "room_type", "room",
    )
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]
    search_fields = ["confirmation_code", "guest__first_name", "guest__last_name"]
    filterset_fields = ["operational_status", "financial_status", "property", "origin_type"]

    def get_serializer_class(self):
        if self.action == "list":
            return ReservationListSerializer
        if self.action == "create":
            return ReservationCreateSerializer
        return ReservationDetailSerializer

    def get_permissions(self):
        if self.action in ("create", "partial_update", "destroy"):
            self.required_role = "reception"
            self.permission_classes = [HasRolePermission]
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save(
            organization=self.request.organization,
            created_by=self.request.user,
            operational_status=Reservation.OperationalStatus.CONFIRMED,
        )

    def _build_context(self, request, reservation):
        return {
            "reservation": reservation,
            "room": reservation.room,
            "guest": reservation.guest,
            "property": reservation.property,
            "user": request.user,
        }

    # ---------- Available rooms for a reservation ----------
    def _get_available_rooms(self, reservation):
        """Return rooms available for this reservation (correct type, available status, no date overlap)."""
        rooms = Room.objects.filter(
            property=reservation.property,
            room_types=reservation.room_type,
            status="available",
        )

        # Exclude rooms occupied by other active reservations with overlapping dates
        overlapping_reservations = Reservation.objects.filter(
            property=reservation.property,
            operational_status__in=["confirmed", "check_in"],
            check_in_date__lt=reservation.check_out_date,
            check_out_date__gt=reservation.check_in_date,
            room__isnull=False,
        ).exclude(pk=reservation.pk)

        occupied_room_ids = overlapping_reservations.values_list("room_id", flat=True)
        rooms = rooms.exclude(pk__in=occupied_room_ids)

        # Prefer rooms matching requested bed configuration
        if reservation.requested_bed_configuration:
            preferred = rooms.filter(
                active_bed_configuration=reservation.requested_bed_configuration,
            )
            others = rooms.exclude(
                active_bed_configuration=reservation.requested_bed_configuration,
            )
            return list(preferred.order_by("number")) + list(others.order_by("number"))

        return list(rooms.order_by("number"))

    def _auto_assign_room(self, reservation):
        """Return the best available room for this reservation, or None."""
        rooms = self._get_available_rooms(reservation)
        return rooms[0] if rooms else None

    @action(detail=True, methods=["get"], url_path="available-rooms")
    def available_rooms(self, request, pk=None):
        reservation = self.get_object()
        rooms = self._get_available_rooms(reservation)
        serializer = RoomSerializer(rooms, many=True)
        return Response(serializer.data)

    # ---------- Confirm ----------
    @action(detail=True, methods=["post"], url_path="confirm")
    def confirm(self, request, pk=None):
        reservation = self.get_object()
        try:
            operational_state_machine.transition(
                reservation, "operational_status", "confirmed", user=request.user,
            )
        except DjangoValidationError as e:
            return Response({"detail": e.message}, status=status.HTTP_400_BAD_REQUEST)

        dispatch_event("reservation.confirmed", reservation.organization, self._build_context(request, reservation))
        return Response(ReservationDetailSerializer(reservation).data)

    # ---------- Check-in ----------
    @action(detail=True, methods=["post"], url_path="check-in")
    def check_in(self, request, pk=None):
        reservation = self.get_object()
        serializer = CheckInSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Assign room if provided, otherwise auto-assign
        room_id = serializer.validated_data.get("room_id")
        if room_id:
            room = get_object_or_404(
                Room,
                pk=room_id,
                property=reservation.property,
            )
            reservation.room = room
            reservation.save(update_fields=["room", "updated_at"])
        elif not reservation.room:
            room = self._auto_assign_room(reservation)
            if not room:
                return Response(
                    {"detail": "No hay habitaciones disponibles del tipo solicitado."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            reservation.room = room
            reservation.save(update_fields=["room", "updated_at"])

        # Validate room is available
        if reservation.room.status != "available":
            return Response(
                {"detail": f"La habitación {reservation.room.number} no está disponible (estado: {reservation.room.status})."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Transition reservation: confirmed → check_in
        try:
            operational_state_machine.transition(
                reservation, "operational_status", "check_in", user=request.user,
            )
        except DjangoValidationError as e:
            return Response({"detail": e.message}, status=status.HTTP_400_BAD_REQUEST)

        # Transition room: available → occupied
        try:
            room_state_machine.transition(
                reservation.room, "status", "occupied", user=request.user,
            )
        except DjangoValidationError as e:
            return Response({"detail": e.message}, status=status.HTTP_400_BAD_REQUEST)

        dispatch_event("reservation.check_in", reservation.organization, self._build_context(request, reservation))
        return Response(ReservationDetailSerializer(reservation).data)

    # ---------- Check-out ----------
    @action(detail=True, methods=["post"], url_path="check-out")
    def check_out(self, request, pk=None):
        reservation = self.get_object()

        # Transition reservation: check_in → check_out
        try:
            operational_state_machine.transition(
                reservation, "operational_status", "check_out", user=request.user,
            )
        except DjangoValidationError as e:
            return Response({"detail": e.message}, status=status.HTTP_400_BAD_REQUEST)

        # Automation rules handle: room → dirty + create cleaning task
        dispatch_event("reservation.check_out", reservation.organization, self._build_context(request, reservation))
        return Response(ReservationDetailSerializer(reservation).data)

    # ---------- Cancel ----------
    @action(detail=True, methods=["post"], url_path="cancel")
    def cancel(self, request, pk=None):
        reservation = self.get_object()
        try:
            operational_state_machine.transition(
                reservation, "operational_status", "cancelled", user=request.user,
            )
        except DjangoValidationError as e:
            return Response({"detail": e.message}, status=status.HTTP_400_BAD_REQUEST)

        dispatch_event("reservation.cancelled", reservation.organization, self._build_context(request, reservation))
        return Response(ReservationDetailSerializer(reservation).data)

    # ---------- No-show ----------
    @action(detail=True, methods=["post"], url_path="no-show")
    def no_show(self, request, pk=None):
        reservation = self.get_object()
        try:
            operational_state_machine.transition(
                reservation, "operational_status", "no_show", user=request.user,
            )
        except DjangoValidationError as e:
            return Response({"detail": e.message}, status=status.HTTP_400_BAD_REQUEST)

        # Automation rules handle: free room if assigned
        dispatch_event("reservation.no_show", reservation.organization, self._build_context(request, reservation))
        return Response(ReservationDetailSerializer(reservation).data)

    # ---------- Upload voucher ----------
    @action(detail=True, methods=["post"], url_path="upload-voucher")
    def upload_voucher(self, request, pk=None):
        reservation = self.get_object()
        file = request.FILES.get("voucher")
        if not file:
            return Response(
                {"detail": "Debe adjuntar un archivo de comprobante."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        reservation.voucher_image = file
        reservation.save(update_fields=["voucher_image", "updated_at"])
        # Si esta incomplete, transicionar a pending
        if reservation.operational_status == "incomplete":
            try:
                operational_state_machine.transition(
                    reservation, "operational_status", "pending", user=request.user,
                )
            except DjangoValidationError as e:
                return Response({"detail": e.message}, status=status.HTTP_400_BAD_REQUEST)
        return Response(ReservationDetailSerializer(reservation).data)

    # ---------- Delete ----------
    def destroy(self, request, *args, **kwargs):
        reservation = self.get_object()
        if reservation.operational_status not in ("incomplete", "cancelled"):
            return Response(
                {"detail": "Solo se pueden eliminar reservas incompletas o canceladas."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        reservation.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    # ---------- Payments (nested) ----------
    @action(detail=True, methods=["get", "post"], url_path="payments")
    def payments(self, request, pk=None):
        reservation = self.get_object()

        if request.method == "GET":
            payments = reservation.payments.all()
            serializer = PaymentSerializer(payments, many=True)
            return Response(serializer.data)

        serializer = PaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payment = serializer.save(
            reservation=reservation,
            organization=request.organization,
            created_by=request.user,
        )

        # Recalculate financial status
        if payment.status == "completed":
            self._update_financial_status(reservation, request.user)

        return Response(PaymentSerializer(payment).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="payments/(?P<payment_id>[^/.]+)/refund")
    def refund_payment(self, request, pk=None, payment_id=None):
        reservation = self.get_object()
        payment = get_object_or_404(reservation.payments, pk=payment_id)

        if payment.status != "completed":
            return Response(
                {"detail": "Solo se pueden reembolsar pagos completados."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = RefundSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        refund_amount = serializer.validated_data["amount"]
        if refund_amount > payment.amount:
            return Response(
                {"detail": "El monto del reembolso no puede exceder el pago original."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        payment.status = "refunded"
        payment.save(update_fields=["status", "updated_at"])

        # Create refund record
        Payment.objects.create(
            reservation=reservation,
            organization=request.organization,
            created_by=request.user,
            amount=-refund_amount,
            currency=payment.currency,
            method=payment.method,
            status="completed",
            notes=serializer.validated_data.get("notes", ""),
        )

        self._update_financial_status(reservation, request.user)
        return Response(ReservationDetailSerializer(reservation).data)

    @action(detail=True, methods=["post"], url_path="payments/(?P<payment_id>[^/.]+)/confirm")
    def confirm_payment(self, request, pk=None, payment_id=None):
        reservation = self.get_object()
        payment = get_object_or_404(reservation.payments, pk=payment_id)

        if payment.status != "pending":
            return Response(
                {"detail": "Solo se pueden confirmar pagos pendientes."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ConfirmPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        payment.amount = serializer.validated_data["amount"]
        payment.status = "completed"
        notes = serializer.validated_data.get("notes", "")
        if notes:
            payment.notes = f"{payment.notes}\n{notes}".strip() if payment.notes else notes
        payment.save(update_fields=["amount", "status", "notes", "updated_at"])

        self._update_financial_status(reservation, request.user)
        return Response(ReservationDetailSerializer(reservation).data)

    def _update_financial_status(self, reservation, user):
        """Recalculate financial status based on completed payments."""
        total_paid = sum(
            p.amount for p in reservation.payments.filter(status="completed")
        )
        total_required = reservation.total_amount

        if total_paid <= Decimal("0"):
            new_status = "pending_payment"
        elif total_paid < total_required:
            new_status = "partial"
        elif total_paid >= total_required:
            new_status = "paid"
        else:
            return

        current = reservation.financial_status
        if current == new_status:
            return

        # Handle refund states
        if total_paid < Decimal("0"):
            new_status = "refunded"
        elif current in ("paid",) and total_paid < total_required:
            new_status = "partial_refund"

        if current != new_status:
            try:
                financial_state_machine.transition(
                    reservation, "financial_status", new_status, user=user,
                )
            except DjangoValidationError:
                # Force update if state machine doesn't allow (edge cases)
                reservation.financial_status = new_status
                reservation.save(update_fields=["financial_status", "updated_at"])
