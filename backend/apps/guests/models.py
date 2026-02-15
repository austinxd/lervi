from django.conf import settings
from django.contrib.auth.hashers import check_password, make_password
from django.db import models

from apps.common.models import TenantModel


class Guest(TenantModel):
    class DocumentType(models.TextChoices):
        DNI = "dni", "DNI"
        PASSPORT = "passport", "Pasaporte"
        CE = "ce", "Carnet de Extranjería"
        OTHER = "other", "Otro"

    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.EmailField(blank=True, default="", db_index=True)
    phone = models.CharField(max_length=30, blank=True, default="")
    document_type = models.CharField(
        max_length=20,
        choices=DocumentType.choices,
        blank=True,
        default="",
    )
    document_number = models.CharField(max_length=50, blank=True, default="", db_index=True)
    nationality = models.CharField(max_length=100, blank=True, default="")
    country_of_residence = models.CharField(max_length=100, blank=True, default="")
    password_hash = models.CharField(max_length=128, blank=True, default="")
    is_vip = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    last_login = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["last_name", "first_name"]
        indexes = [
            models.Index(
                fields=["organization", "document_type", "document_number"],
                name="guest_doc_lookup",
            ),
        ]

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    def set_password(self, raw_password):
        self.password_hash = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password_hash)

    @property
    def has_password(self):
        return bool(self.password_hash)


class GuestNote(TenantModel):
    guest = models.ForeignKey(
        Guest,
        on_delete=models.CASCADE,
        related_name="notes",
    )
    content = models.TextField()

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Nota para {self.guest.full_name}"
