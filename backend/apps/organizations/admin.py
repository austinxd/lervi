from django.contrib import admin

from .models import Organization, Property, PropertyPhoto


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ["name", "subdomain", "plan", "is_active"]
    search_fields = ["name", "subdomain"]


class PropertyPhotoInline(admin.TabularInline):
    model = PropertyPhoto
    extra = 1
    fields = ["image", "caption", "sort_order"]


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ["name", "organization", "city", "stars", "is_active"]
    list_filter = ["organization"]
    search_fields = ["name", "slug"]
    inlines = [PropertyPhotoInline]
    fieldsets = [
        (None, {
            "fields": [
                "organization", "name", "slug", "is_active",
            ],
        }),
        ("Ubicación", {
            "fields": [
                "address", "city", "country", "latitude", "longitude",
            ],
        }),
        ("Contacto", {
            "fields": [
                "contact_phone", "contact_email", "whatsapp",
            ],
        }),
        ("Horarios", {
            "fields": ["check_in_time", "check_out_time"],
        }),
        ("Web pública", {
            "fields": [
                "description", "tagline", "stars", "hero_image", "logo",
                "amenities", "payment_methods", "languages",
                "policies",
            ],
        }),
    ]
