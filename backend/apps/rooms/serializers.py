from rest_framework import serializers

from .models import BedConfiguration, BedConfigurationDetail, Room, RoomType, RoomTypePhoto


# --- Bed Configuration ---

class BedConfigurationDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = BedConfigurationDetail
        fields = ["id", "bed_type", "quantity"]
        read_only_fields = ["id"]


class BedConfigurationSerializer(serializers.ModelSerializer):
    details = BedConfigurationDetailSerializer(many=True)

    class Meta:
        model = BedConfiguration
        fields = ["id", "name", "details"]
        read_only_fields = ["id"]

    def create(self, validated_data):
        details_data = validated_data.pop("details", [])
        bed_config = BedConfiguration.objects.create(**validated_data)
        for detail in details_data:
            BedConfigurationDetail.objects.create(bed_configuration=bed_config, **detail)
        return bed_config

    def update(self, instance, validated_data):
        details_data = validated_data.pop("details", None)
        instance.name = validated_data.get("name", instance.name)
        instance.save()
        if details_data is not None:
            instance.details.all().delete()
            for detail in details_data:
                BedConfigurationDetail.objects.create(bed_configuration=instance, **detail)
        return instance


# --- Room Type Photos ---

class RoomTypePhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomTypePhoto
        fields = ["id", "image", "caption", "sort_order", "is_cover"]
        read_only_fields = ["id"]


# --- Room Type ---

class RoomTypeSerializer(serializers.ModelSerializer):
    bed_configurations = BedConfigurationSerializer(many=True, read_only=True)
    photos = RoomTypePhotoSerializer(many=True, read_only=True)

    class Meta:
        model = RoomType
        fields = [
            "id", "property", "name", "slug", "description",
            "max_adults", "max_children", "base_price",
            "base_occupancy", "extra_adult_fee", "extra_child_fee",
            "amenities", "is_active",
            "bed_configurations", "photos",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "property", "created_at", "updated_at"]


class RoomTypeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomType
        fields = [
            "id", "property", "name", "slug", "description",
            "max_adults", "max_children", "base_price",
            "base_occupancy", "extra_adult_fee", "extra_child_fee",
            "amenities", "is_active",
        ]
        read_only_fields = ["id"]


# --- Room ---

class RoomSerializer(serializers.ModelSerializer):
    room_type_names = serializers.SerializerMethodField()
    active_bed_configuration_name = serializers.CharField(
        source="active_bed_configuration.name", read_only=True, default=None,
    )

    class Meta:
        model = Room
        fields = [
            "id", "property", "room_types", "room_type_names",
            "number", "floor", "status",
            "active_bed_configuration", "active_bed_configuration_name",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "status", "created_at", "updated_at"]

    def get_room_type_names(self, obj):
        return [rt.name for rt in obj.room_types.all()]


class ChangeStatusSerializer(serializers.Serializer):
    new_status = serializers.ChoiceField(choices=Room.Status.choices)


class ChangeBedConfigSerializer(serializers.Serializer):
    bed_configuration_id = serializers.UUIDField()
