import uuid

from django.db import models
from django.utils import timezone


class GlobalIdentity(models.Model):
    """Cross-hotel identity index. Stores encrypted PII for global lookup."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    document_type = models.CharField(max_length=20)
    document_hash = models.CharField(
        max_length=128,
        unique=True,
        help_text="SHA-256 of normalized document_type:document_number",
    )
    encrypted_email = models.BinaryField(blank=True, null=True)
    encrypted_name = models.BinaryField(blank=True, null=True)
    encryption_version = models.PositiveSmallIntegerField(default=1)
    last_seen_at = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Global Identity"
        verbose_name_plural = "Global Identities"

    def __str__(self):
        return f"Identity {self.document_hash[:12]}..."


class IdentityLink(models.Model):
    """Links a GlobalIdentity to a Guest in a specific organization."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    identity = models.ForeignKey(
        GlobalIdentity,
        on_delete=models.CASCADE,
        related_name="links",
    )
    organization = models.ForeignKey(
        "organizations.Organization",
        on_delete=models.CASCADE,
    )
    guest = models.ForeignKey(
        "guests.Guest",
        on_delete=models.CASCADE,
        related_name="identity_links",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("identity", "organization")

    def __str__(self):
        return f"Link {self.identity_id} -> {self.guest_id} @ {self.organization_id}"


class OTPCode(models.Model):
    """One-time password for guest email verification."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    identity = models.ForeignKey(
        GlobalIdentity,
        on_delete=models.CASCADE,
        related_name="otp_codes",
    )
    code = models.CharField(max_length=6)
    attempts = models.PositiveSmallIntegerField(default=0)
    is_used = models.BooleanField(default=False)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"OTP {self.code} for {self.identity_id}"

    @property
    def is_expired(self):
        return timezone.now() > self.expires_at
