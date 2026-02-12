from rest_framework import serializers

from .models import DayOfWeekPricing, Promotion, RatePlan, Season


class SeasonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Season
        fields = [
            "id", "property", "name",
            "start_month", "start_day", "end_month", "end_day",
            "price_modifier", "is_active", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class DayOfWeekPricingSerializer(serializers.ModelSerializer):
    day_name = serializers.SerializerMethodField()

    class Meta:
        model = DayOfWeekPricing
        fields = ["id", "property", "day_of_week", "day_name", "price_modifier"]
        read_only_fields = ["id"]

    def get_day_name(self, obj):
        return DayOfWeekPricing.DAY_NAMES[obj.day_of_week]


class RatePlanSerializer(serializers.ModelSerializer):
    room_type_name = serializers.CharField(source="room_type.name", read_only=True)

    class Meta:
        model = RatePlan
        fields = [
            "id", "property", "room_type", "room_type_name",
            "name", "plan_type", "price_modifier",
            "min_nights", "min_advance_days",
            "is_active", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class PromotionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Promotion
        fields = [
            "id", "property", "name", "code",
            "discount_percent", "discount_fixed",
            "start_date", "end_date", "min_nights",
            "is_active", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class PriceCalculationRequestSerializer(serializers.Serializer):
    property_id = serializers.UUIDField()
    room_type_id = serializers.UUIDField()
    check_in = serializers.DateField()
    check_out = serializers.DateField()
    rate_plan_id = serializers.UUIDField(required=False)
    promotion_code = serializers.CharField(required=False, default="")
    adults = serializers.IntegerField(required=False, default=1, min_value=1)
    children = serializers.IntegerField(required=False, default=0, min_value=0)

    def validate(self, data):
        if data["check_in"] >= data["check_out"]:
            raise serializers.ValidationError(
                {"check_out": "La fecha de salida debe ser posterior a la de entrada."}
            )
        return data
