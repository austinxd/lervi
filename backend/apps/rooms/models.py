from django.db import models

from apps.common.models import BaseModel

from .constants import BED_TYPES


class RoomType(BaseModel):
    property = models.ForeignKey(
        "organizations.Property",
        on_delete=models.CASCADE,
        related_name="room_types",
    )
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100)
    description = models.TextField(blank=True, default="")
    max_adults = models.PositiveSmallIntegerField(default=2)
    max_children = models.PositiveSmallIntegerField(default=0)
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    extra_adult_fee = models.DecimalField(
        max_digits=10, decimal_places=2, default=0,
        help_text="Cargo adicional por noche por cada adulto despues del primero",
    )
    extra_child_fee = models.DecimalField(
        max_digits=10, decimal_places=2, default=0,
        help_text="Cargo adicional por noche por cada nino",
    )
    amenities = models.JSONField(default=list, blank=True)
    size_sqm = models.DecimalField(
        max_digits=6, decimal_places=1, null=True, blank=True
    )
    view_type = models.CharField(
        max_length=50,
        blank=True,
        default="",
        choices=[
            ("garden", "Jardín"),
            ("ocean", "Mar"),
            ("city", "Ciudad"),
            ("mountain", "Montaña"),
            ("pool", "Piscina"),
            ("interior", "Interior"),
        ],
    )
    bathroom_type = models.CharField(
        max_length=50,
        blank=True,
        default="",
        choices=[
            ("private_shower", "Baño privado con ducha"),
            ("private_tub", "Baño privado con tina"),
            ("private_jacuzzi", "Baño privado con jacuzzi"),
            ("shared", "Baño compartido"),
        ],
    )
    highlights = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]
        unique_together = [("property", "slug")]

    def __str__(self):
        return f"{self.name} ({self.property.name})"


class RoomTypePhoto(BaseModel):
    room_type = models.ForeignKey(
        RoomType,
        on_delete=models.CASCADE,
        related_name="photos",
    )
    image = models.ImageField(upload_to="room_types/")
    caption = models.CharField(max_length=255, blank=True, default="")
    sort_order = models.PositiveSmallIntegerField(default=0)
    is_cover = models.BooleanField(default=False)

    class Meta:
        ordering = ["sort_order"]


class BedConfiguration(BaseModel):
    room_type = models.ForeignKey(
        RoomType,
        on_delete=models.CASCADE,
        related_name="bed_configurations",
    )
    name = models.CharField(max_length=100)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} — {self.room_type.name}"


class BedConfigurationDetail(BaseModel):
    bed_configuration = models.ForeignKey(
        BedConfiguration,
        on_delete=models.CASCADE,
        related_name="details",
    )
    bed_type = models.CharField(max_length=20, choices=BED_TYPES)
    quantity = models.PositiveSmallIntegerField(default=1)

    class Meta:
        ordering = ["bed_type"]


class Room(BaseModel):
    class Status(models.TextChoices):
        AVAILABLE = "available", "Disponible"
        OCCUPIED = "occupied", "Ocupada"
        DIRTY = "dirty", "Sucia"
        CLEANING = "cleaning", "En limpieza"
        INSPECTION = "inspection", "En inspección"
        BLOCKED = "blocked", "Bloqueada"
        MAINTENANCE = "maintenance", "Mantenimiento"

    property = models.ForeignKey(
        "organizations.Property",
        on_delete=models.CASCADE,
        related_name="rooms",
    )
    room_types = models.ManyToManyField(
        RoomType,
        related_name="rooms",
        blank=True,
    )
    number = models.CharField(max_length=20)
    floor = models.CharField(max_length=10, blank=True, default="")
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.AVAILABLE,
    )
    active_bed_configuration = models.ForeignKey(
        BedConfiguration,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="active_rooms",
    )

    class Meta:
        ordering = ["number"]
        unique_together = [("property", "number")]

    def __str__(self):
        return f"Room {self.number} ({self.property.name})"
