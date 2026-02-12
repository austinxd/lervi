from django.db import models

from apps.common.models import BaseModel


class Season(BaseModel):
    """A recurring date range (month/day) with a price modifier for a property."""
    property = models.ForeignKey(
        "organizations.Property",
        on_delete=models.CASCADE,
        related_name="seasons",
    )
    name = models.CharField(max_length=100)
    start_month = models.PositiveSmallIntegerField(help_text="1-12", default=1)
    start_day = models.PositiveSmallIntegerField(help_text="1-31", default=1)
    end_month = models.PositiveSmallIntegerField(help_text="1-12", default=12)
    end_day = models.PositiveSmallIntegerField(help_text="1-31", default=31)
    # Multiplier: 1.0 = no change, 1.3 = +30%, 0.8 = -20%
    price_modifier = models.DecimalField(max_digits=5, decimal_places=2, default=1.00)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["start_month", "start_day"]

    def __str__(self):
        return f"{self.name} ({self.start_day}/{self.start_month} → {self.end_day}/{self.end_month})"

    def contains_date(self, d):
        """Check if a date (any year) falls within this season. Handles year-wrap (e.g. Dec-Jan)."""
        md = (d.month, d.day)
        start = (self.start_month, self.start_day)
        end = (self.end_month, self.end_day)
        if start <= end:
            return start <= md <= end
        else:
            # Wraps around year boundary (e.g. Dec 20 → Jan 5)
            return md >= start or md <= end


class DayOfWeekPricing(BaseModel):
    """Per-day-of-week price modifier for a property."""
    property = models.ForeignKey(
        "organizations.Property",
        on_delete=models.CASCADE,
        related_name="day_of_week_pricing",
    )
    # 0=Monday, 6=Sunday (Python weekday convention)
    day_of_week = models.PositiveSmallIntegerField()
    price_modifier = models.DecimalField(max_digits=5, decimal_places=2, default=1.00)

    class Meta:
        unique_together = [("property", "day_of_week")]
        ordering = ["day_of_week"]

    DAY_NAMES = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

    def __str__(self):
        return f"{self.DAY_NAMES[self.day_of_week]}: x{self.price_modifier}"


class RatePlan(BaseModel):
    """A pricing plan that applies to a room type (e.g. standard, non-refundable, early bird)."""
    class PlanType(models.TextChoices):
        STANDARD = "standard", "Estándar"
        NON_REFUNDABLE = "non_refundable", "No reembolsable"
        EARLY_BIRD = "early_bird", "Reserva anticipada"
        LAST_MINUTE = "last_minute", "Último minuto"

    property = models.ForeignKey(
        "organizations.Property",
        on_delete=models.CASCADE,
        related_name="rate_plans",
    )
    room_type = models.ForeignKey(
        "rooms.RoomType",
        on_delete=models.CASCADE,
        related_name="rate_plans",
    )
    name = models.CharField(max_length=100)
    plan_type = models.CharField(max_length=20, choices=PlanType.choices, default=PlanType.STANDARD)
    price_modifier = models.DecimalField(max_digits=5, decimal_places=2, default=1.00)
    min_nights = models.PositiveSmallIntegerField(default=1)
    min_advance_days = models.PositiveSmallIntegerField(
        default=0,
        help_text="Días mínimos de anticipación para aplicar este plan",
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} — {self.room_type.name}"


class Promotion(BaseModel):
    """A discount code or automatic promotion."""
    property = models.ForeignKey(
        "organizations.Property",
        on_delete=models.CASCADE,
        related_name="promotions",
    )
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=50, blank=True, default="")
    discount_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    discount_fixed = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    min_nights = models.PositiveSmallIntegerField(default=1)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name
