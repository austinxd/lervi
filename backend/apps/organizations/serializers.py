from rest_framework import serializers

from .models import BankAccount, Organization, Property, PropertyPhoto


class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = [
            "id", "name", "legal_name", "tax_id",
            "timezone", "currency", "language",
            "logo", "primary_color", "secondary_color", "font",
            "subdomain", "custom_domain",
            "theme_template",
            "social_links",
            "plan", "is_active",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "plan", "subdomain"]


class PropertySerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        fields = [
            "id", "organization", "name", "slug",
            "address", "city", "country",
            "latitude", "longitude",
            "check_in_time", "check_out_time",
            "policies",
            "contact_phone", "contact_email",
            "is_active",
            "description", "tagline", "whatsapp",
            "amenities", "payment_methods", "languages",
            "stars", "hero_image", "logo",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "organization", "created_at", "updated_at"]


class PropertyPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyPhoto
        fields = ["id", "image", "caption", "sort_order"]


class BankAccountSerializer(serializers.ModelSerializer):
    level = serializers.SerializerMethodField()

    class Meta:
        model = BankAccount
        fields = [
            "id", "property", "bank_name", "account_holder",
            "account_number", "cci", "currency",
            "is_active", "sort_order", "level",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "property", "created_at", "updated_at"]

    def get_level(self, obj):
        return "property" if obj.property_id else "organization"
