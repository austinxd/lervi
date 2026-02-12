from rest_framework import serializers

from apps.guests.models import Guest
from apps.organizations.models import BankAccount, Organization, Property, PropertyPhoto
from apps.rooms.models import (
    BedConfiguration,
    BedConfigurationDetail,
    RoomType,
    RoomTypePhoto,
)


class PropertyPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyPhoto
        fields = ["id", "image", "caption", "sort_order"]


class PropertySummarySerializer(serializers.ModelSerializer):
    photos = PropertyPhotoSerializer(many=True, read_only=True)

    class Meta:
        model = Property
        fields = [
            "id",
            "name",
            "slug",
            "address",
            "city",
            "country",
            "latitude",
            "longitude",
            "check_in_time",
            "check_out_time",
            "contact_phone",
            "contact_email",
            "whatsapp",
            "policies",
            "description",
            "tagline",
            "amenities",
            "payment_methods",
            "languages",
            "stars",
            "hero_image",
            "logo",
            "photos",
        ]


class OrganizationInfoSerializer(serializers.ModelSerializer):
    properties = serializers.SerializerMethodField()
    is_multi_property = serializers.SerializerMethodField()

    class Meta:
        model = Organization
        fields = [
            "id",
            "name",
            "subdomain",
            "currency",
            "logo",
            "primary_color",
            "secondary_color",
            "theme_template",
            "social_links",
            "properties",
            "is_multi_property",
        ]

    def get_properties(self, obj):
        props = obj.properties.filter(is_active=True).prefetch_related("photos")
        return PropertySummarySerializer(props, many=True).data

    def get_is_multi_property(self, obj):
        return obj.properties.filter(is_active=True).count() > 1


class RoomTypePhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomTypePhoto
        fields = ["id", "image", "caption", "sort_order", "is_cover"]


class BedConfigurationDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = BedConfigurationDetail
        fields = ["bed_type", "quantity"]


class BedConfigurationSerializer(serializers.ModelSerializer):
    details = BedConfigurationDetailSerializer(many=True, read_only=True)

    class Meta:
        model = BedConfiguration
        fields = ["id", "name", "details"]


class RoomTypeListSerializer(serializers.ModelSerializer):
    photos = RoomTypePhotoSerializer(many=True, read_only=True)
    cover_photo = serializers.SerializerMethodField()
    property_name = serializers.CharField(source="property.name", read_only=True)
    property_slug = serializers.CharField(source="property.slug", read_only=True)

    class Meta:
        model = RoomType
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "max_adults",
            "max_children",
            "base_price",
            "amenities",
            "size_sqm",
            "view_type",
            "bathroom_type",
            "highlights",
            "cover_photo",
            "photos",
            "property_name",
            "property_slug",
        ]

    def get_cover_photo(self, obj):
        cover = obj.photos.filter(is_cover=True).first()
        if cover and cover.image:
            return cover.image.url
        first = obj.photos.first()
        return first.image.url if first and first.image else None


class RoomTypeDetailSerializer(RoomTypeListSerializer):
    bed_configurations = BedConfigurationSerializer(many=True, read_only=True)

    class Meta(RoomTypeListSerializer.Meta):
        fields = RoomTypeListSerializer.Meta.fields + ["bed_configurations"]


class AvailabilityResultSerializer(serializers.Serializer):
    room_type = RoomTypeListSerializer()
    available_rooms = serializers.IntegerField()
    nightly_prices = serializers.ListField()
    total = serializers.DecimalField(max_digits=10, decimal_places=2)
    property_name = serializers.CharField()
    property_slug = serializers.CharField()


class PublicReservationSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=30, required=False, default="")
    document_type = serializers.ChoiceField(choices=Guest.DocumentType.choices)
    document_number = serializers.CharField(max_length=50)

    room_type_id = serializers.UUIDField()
    check_in_date = serializers.DateField()
    check_out_date = serializers.DateField()
    adults = serializers.IntegerField(min_value=1, default=1)
    children = serializers.IntegerField(min_value=0, default=0)
    special_requests = serializers.CharField(required=False, default="")
    promotion_code = serializers.CharField(required=False, default="")

    def validate(self, data):
        if data["check_out_date"] <= data["check_in_date"]:
            raise serializers.ValidationError(
                {"check_out_date": "La fecha de salida debe ser posterior a la de entrada."}
            )
        return data


class PublicBankAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = BankAccount
        fields = [
            "id", "bank_name", "account_holder",
            "account_number", "cci", "currency",
        ]


class ReservationConfirmationSerializer(serializers.Serializer):
    confirmation_code = serializers.CharField()
    check_in_date = serializers.DateField()
    check_out_date = serializers.DateField()
    room_type = serializers.CharField()
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    currency = serializers.CharField()
    guest_name = serializers.CharField()
    payment_deadline = serializers.DateTimeField(required=False, allow_null=True)
    has_bank_accounts = serializers.BooleanField(required=False, default=False)


class GuestLoginSerializer(serializers.Serializer):
    document_type = serializers.ChoiceField(choices=Guest.DocumentType.choices)
    document_number = serializers.CharField(max_length=50)


class GuestReservationListSerializer(serializers.Serializer):
    confirmation_code = serializers.CharField()
    room_type = serializers.CharField()
    check_in_date = serializers.DateField()
    check_out_date = serializers.DateField()
    operational_status = serializers.CharField()
    financial_status = serializers.CharField()
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    currency = serializers.CharField()
    voucher_image = serializers.CharField(allow_null=True)
    property_name = serializers.CharField()
