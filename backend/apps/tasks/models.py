from django.conf import settings
from django.db import models

from apps.common.models import TenantModel


class Task(TenantModel):
    class TaskType(models.TextChoices):
        CLEANING = "cleaning", "Limpieza"
        INSPECTION = "inspection", "Inspección"
        MAINTENANCE = "maintenance", "Mantenimiento"
        BED_PREP = "bed_prep", "Preparación de camas"
        OTHER = "other", "Otro"

    class Priority(models.TextChoices):
        NORMAL = "normal", "Normal"
        HIGH = "high", "Alta"
        URGENT = "urgent", "Urgente"

    class Status(models.TextChoices):
        PENDING = "pending", "Pendiente"
        IN_PROGRESS = "in_progress", "En progreso"
        COMPLETED = "completed", "Completada"

    task_type = models.CharField(max_length=20, choices=TaskType.choices)
    property = models.ForeignKey(
        "organizations.Property",
        on_delete=models.CASCADE,
        related_name="tasks",
    )
    room = models.ForeignKey(
        "rooms.Room",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="tasks",
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_tasks",
    )
    assigned_role = models.CharField(max_length=20, blank=True, default="")
    priority = models.CharField(
        max_length=10,
        choices=Priority.choices,
        default=Priority.NORMAL,
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    due_date = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True, default="")
    result = models.TextField(blank=True, default="")
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        room_str = f" — Room {self.room.number}" if self.room else ""
        return f"{self.get_task_type_display()}{room_str} ({self.get_status_display()})"
