from rest_framework import serializers

from .models import Payment, Reservation


class PaymentSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(
        source="created_by.full_name", read_only=True, default=None,
    )

    class Meta:
        model = Payment
        fields = [
            "id", "amount", "currency", "method", "status",
            "gateway_reference", "notes",
            "created_by", "created_by_name",
            "processed_at",
        ]
        read_only_fields = ["id", "created_by", "created_by_name", "processed_at", "status"]


class ReservationListSerializer(serializers.ModelSerializer):
    guest_name = serializers.SerializerMethodField()
    room_type_name = serializers.CharField(source="room_type.name", read_only=True)
    room_number = serializers.CharField(source="room.number", read_only=True, default=None)
    property_name = serializers.CharField(source="property.name", read_only=True)

    class Meta:
        model = Reservation
        fields = [
            "id", "confirmation_code",
            "guest", "guest_name",
            "property", "property_name",
            "room_type", "room_type_name",
            "room", "room_number",
            "check_in_date", "check_out_date",
            "adults", "children",
            "total_amount", "currency",
            "operational_status", "financial_status",
            "origin_type",
            "created_at",
        ]
        read_only_fields = fields

    def get_guest_name(self, obj):
        return obj.guest.full_name


class ReservationDetailSerializer(serializers.ModelSerializer):
    guest_name = serializers.SerializerMethodField()
    room_type_name = serializers.CharField(source="room_type.name", read_only=True)
    room_number = serializers.CharField(source="room.number", read_only=True, default=None)
    property_name = serializers.CharField(source="property.name", read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)

    class Meta:
        model = Reservation
        fields = [
            "id", "confirmation_code",
            "guest", "guest_name",
            "property", "property_name",
            "room_type", "room_type_name",
            "room", "room_number",
            "requested_bed_configuration",
            "check_in_date", "check_out_date",
            "adults", "children",
            "total_amount", "currency",
            "operational_status", "financial_status",
            "origin_type", "origin_metadata",
            "special_requests",
            "voucher_image", "payment_deadline",
            "payments",
            "created_by", "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "confirmation_code",
            "operational_status", "financial_status",
            "created_by", "created_at", "updated_at",
        ]

    def get_guest_name(self, obj):
        return obj.guest.full_name


class ReservationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        fields = [
            "id", "confirmation_code",
            "guest", "property", "room_type",
            "room", "requested_bed_configuration",
            "check_in_date", "check_out_date",
            "adults", "children",
            "total_amount", "currency",
            "origin_type", "origin_metadata",
            "special_requests",
        ]
        read_only_fields = ["id", "confirmation_code"]

    def validate(self, data):
        if data["check_in_date"] >= data["check_out_date"]:
            raise serializers.ValidationError(
                {"check_out_date": "La fecha de salida debe ser posterior a la de entrada."}
            )
        return data


# --- Action serializers ---

class CheckInSerializer(serializers.Serializer):
    room_id = serializers.UUIDField(
        required=False,
        help_text="ID de la habitación a asignar. Requerido si la reserva no tiene room asignada.",
    )


class RefundSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    notes = serializers.CharField(required=False, default="")
