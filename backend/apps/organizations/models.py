from django.db import models

from apps.common.models import BaseModel


class Organization(BaseModel):
    name = models.CharField(max_length=255)
    legal_name = models.CharField(max_length=255, blank=True, default="")
    tax_id = models.CharField(max_length=50, blank=True, default="")
    timezone = models.CharField(max_length=50, default="America/Lima")
    currency = models.CharField(max_length=3, default="PEN")
    language = models.CharField(max_length=10, default="es")

    # Branding
    logo = models.URLField(blank=True, default="")
    primary_color = models.CharField(max_length=7, default="#1976D2")
    secondary_color = models.CharField(max_length=7, default="#FF9800")
    font = models.CharField(max_length=100, blank=True, default="")

    # Domain
    subdomain = models.CharField(max_length=63, unique=True)
    custom_domain = models.CharField(max_length=255, blank=True, default="")

    # Subscription
    plan = models.CharField(max_length=50, default="basic")
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Property(BaseModel):
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="properties",
    )
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=100)
    address = models.TextField(blank=True, default="")
    city = models.CharField(max_length=100, blank=True, default="")
    country = models.CharField(max_length=100, default="PE")
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    check_in_time = models.TimeField(default="14:00")
    check_out_time = models.TimeField(default="12:00")
    policies = models.JSONField(default=dict, blank=True)
    contact_phone = models.CharField(max_length=30, blank=True, default="")
    contact_email = models.EmailField(blank=True, default="")
    is_active = models.BooleanField(default=True)

    # Rich content for public website
    description = models.TextField(blank=True, default="")
    tagline = models.CharField(max_length=200, blank=True, default="")
    whatsapp = models.CharField(max_length=30, blank=True, default="")
    website_url = models.URLField(blank=True, default="")
    social_links = models.JSONField(default=dict, blank=True)
    amenities = models.JSONField(default=list, blank=True)
    payment_methods = models.JSONField(default=list, blank=True)
    languages = models.JSONField(default=list, blank=True)
    stars = models.PositiveSmallIntegerField(null=True, blank=True)
    hero_image = models.ImageField(upload_to="properties/", blank=True)
    logo = models.ImageField(upload_to="properties/logos/", blank=True)

    # Theming
    theme_template = models.CharField(
        max_length=20,
        default="signature",
        choices=[
            ("essential", "Essential / Boutique"),
            ("signature", "Signature / Experience"),
            ("premium", "Premium / Luxury"),
        ],
    )
    theme_palette = models.CharField(max_length=30, default="navy-gold")
    theme_primary_color = models.CharField(max_length=7, blank=True, default="")
    theme_accent_color = models.CharField(max_length=7, blank=True, default="")

    # Custom domain (e.g. www.myhotel.com)
    custom_domain = models.CharField(
        max_length=255, blank=True, null=True, unique=True,
    )

    class Meta:
        verbose_name_plural = "properties"
        ordering = ["name"]
        unique_together = [("organization", "slug")]

    def __str__(self):
        return self.name


class PropertyPhoto(BaseModel):
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name="photos",
    )
    image = models.ImageField(upload_to="properties/")
    caption = models.CharField(max_length=255, blank=True, default="")
    sort_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["sort_order"]

    def __str__(self):
        return f"Photo {self.sort_order} — {self.property.name}"


class BankAccount(BaseModel):
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name="bank_accounts",
    )
    bank_name = models.CharField(max_length=100)
    account_holder = models.CharField(max_length=200)
    account_number = models.CharField(max_length=50)
    cci = models.CharField(max_length=50, blank=True, default="")
    currency = models.CharField(max_length=3, default="PEN")
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["sort_order"]

    def __str__(self):
        return f"{self.bank_name} — {self.account_number}"
