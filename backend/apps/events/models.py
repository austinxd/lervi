import uuid

from django.db import models


class EventLog(models.Model):
    VALID_EVENTS = {
        "page_view",
        "search_dates",
        "room_view",
        "start_booking",
        "guest_lookup_started",
        "guest_lookup_result",
        "guest_login_success",
        "otp_requested",
        "otp_verified",
        "booking_confirmed",
        "booking_abandoned",
    }

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        "organizations.Organization",
        on_delete=models.CASCADE,
        related_name="event_logs",
    )
    guest = models.ForeignKey(
        "guests.Guest",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="event_logs",
    )
    session_id = models.CharField(max_length=64, db_index=True)
    event_name = models.CharField(max_length=50, db_index=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(db_index=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["organization", "event_name"]),
            models.Index(fields=["organization", "created_at"]),
            models.Index(fields=["organization", "session_id"]),
        ]

    def __str__(self):
        return f"{self.event_name} | {self.session_id[:8]} | {self.created_at}"
