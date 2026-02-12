import uuid

from django.conf import settings
from django.db import models

from apps.common.models import TenantModel


def generate_confirmation_code():
    return uuid.uuid4().hex[:8].upper()


class Reservation(TenantModel):
    # --- Operational status ---
    class OperationalStatus(models.TextChoices):
        INCOMPLETE = "incomplete", "Incompleta"
        PENDING = "pending", "Pendiente"
        CONFIRMED = "confirmed", "Confirmada"
        CHECK_IN = "check_in", "Check-in"
        CHECK_OUT = "check_out", "Check-out"
        CANCELLED = "cancelled", "Cancelada"
        NO_SHOW = "no_show", "No-show"

    # --- Financial status ---
    class FinancialStatus(models.TextChoices):
        PENDING_PAYMENT = "pending_payment", "Pendiente de pago"
        PARTIAL = "partial", "Parcial"
        PAID = "paid", "Pagada"
        PARTIAL_REFUND = "partial_refund", "Reembolso parcial"
        REFUNDED = "refunded", "Reembolsada"

    # --- Origin types ---
    class OriginType(models.TextChoices):
        WEBSITE = "website", "Website"
        WALK_IN = "walk_in", "Walk-in"
        PHONE = "phone", "Teléfono"
        OTA = "ota", "OTA"
        OTHER = "other", "Otro"

    confirmation_code = models.CharField(
        max_length=10,
        unique=True,
        default=generate_confirmation_code,
    )

    # --- Relations ---
    guest = models.ForeignKey(
        "guests.Guest",
        on_delete=models.PROTECT,
        related_name="reservations",
    )
    property = models.ForeignKey(
        "organizations.Property",
        on_delete=models.CASCADE,
        related_name="reservations",
    )
    room_type = models.ForeignKey(
        "rooms.RoomType",
        on_delete=models.PROTECT,
        related_name="reservations",
    )
    room = models.ForeignKey(
        "rooms.Room",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reservations",
    )
    requested_bed_configuration = models.ForeignKey(
        "rooms.BedConfiguration",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reservations",
    )

    # --- Dates ---
    check_in_date = models.DateField()
    check_out_date = models.DateField()

    # --- Guests count ---
    adults = models.PositiveSmallIntegerField(default=1)
    children = models.PositiveSmallIntegerField(default=0)

    # --- Financial ---
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default="PEN")

    # --- States (independent) ---
    operational_status = models.CharField(
        max_length=20,
        choices=OperationalStatus.choices,
        default=OperationalStatus.INCOMPLETE,
    )
    financial_status = models.CharField(
        max_length=20,
        choices=FinancialStatus.choices,
        default=FinancialStatus.PENDING_PAYMENT,
    )

    # --- Origin ---
    origin_type = models.CharField(
        max_length=20,
        choices=OriginType.choices,
        default=OriginType.WALK_IN,
    )
    origin_metadata = models.JSONField(default=dict, blank=True)

    # --- Group ---
    group_code = models.CharField(
        max_length=10, blank=True, default="", db_index=True,
        help_text="Código de grupo para reservas vinculadas",
    )

    # --- Other ---
    special_requests = models.TextField(blank=True, default="")

    # --- Payment voucher ---
    voucher_image = models.ImageField(upload_to="vouchers/", blank=True)
    payment_deadline = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Reserva {self.confirmation_code} — {self.guest}"


class Payment(TenantModel):
    class Method(models.TextChoices):
        CASH = "cash", "Efectivo"
        CARD = "card", "Tarjeta"
        TRANSFER = "transfer", "Transferencia"
        ONLINE = "online", "Pasarela online"

    class Status(models.TextChoices):
        PENDING = "pending", "Pendiente"
        COMPLETED = "completed", "Completado"
        REFUNDED = "refunded", "Reembolsado"
        FAILED = "failed", "Fallido"

    reservation = models.ForeignKey(
        Reservation,
        on_delete=models.CASCADE,
        related_name="payments",
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default="PEN")
    method = models.CharField(
        max_length=20,
        choices=Method.choices,
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.COMPLETED,
    )
    gateway_reference = models.CharField(max_length=255, blank=True, default="")
    processed_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, default="")

    class Meta:
        ordering = ["-processed_at"]

    def __str__(self):
        return f"Pago {self.amount} {self.currency} — {self.reservation.confirmation_code}"
