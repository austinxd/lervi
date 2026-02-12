from django.db import models

from apps.common.models import TenantModel


class AutomationRule(TenantModel):
    """
    Event-driven rule: WHEN trigger IF conditions THEN actions.

    trigger: event name (e.g. "reservation.check_out", "task.completed")
    conditions: JSON list of condition objects to evaluate
    actions: JSON list of action objects to execute
    """

    class Trigger(models.TextChoices):
        RESERVATION_CREATED = "reservation.created", "Reserva creada"
        RESERVATION_CONFIRMED = "reservation.confirmed", "Reserva confirmada"
        RESERVATION_CHECK_IN = "reservation.check_in", "Check-in"
        RESERVATION_CHECK_OUT = "reservation.check_out", "Check-out"
        RESERVATION_CANCELLED = "reservation.cancelled", "Reserva cancelada"
        RESERVATION_NO_SHOW = "reservation.no_show", "No-show"
        PAYMENT_RECEIVED = "payment.received", "Pago recibido"
        ROOM_STATUS_CHANGED = "room.status_changed", "Cambio estado habitación"
        TASK_COMPLETED = "task.completed", "Tarea completada"
        GUEST_CREATED = "guest.created", "Huésped creado"

    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, default="")
    trigger = models.CharField(max_length=50, choices=Trigger.choices)
    conditions = models.JSONField(default=list, blank=True)
    actions = models.JSONField(default=list)
    priority = models.PositiveSmallIntegerField(default=10)
    is_active = models.BooleanField(default=True)
    is_system = models.BooleanField(
        default=False,
        help_text="Reglas del sistema no pueden ser eliminadas",
    )

    class Meta:
        ordering = ["priority", "name"]

    def __str__(self):
        return self.name


class AutomationLog(TenantModel):
    """Log of every automation rule execution."""

    rule = models.ForeignKey(
        AutomationRule,
        on_delete=models.SET_NULL,
        null=True,
        related_name="logs",
    )
    rule_name = models.CharField(max_length=200)
    trigger = models.CharField(max_length=50)
    event_data = models.JSONField(default=dict)
    conditions_met = models.BooleanField(default=True)
    actions_executed = models.JSONField(default=list)
    success = models.BooleanField(default=True)
    error_message = models.TextField(blank=True, default="")

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        status = "OK" if self.success else "ERROR"
        return f"[{status}] {self.rule_name} — {self.trigger}"
