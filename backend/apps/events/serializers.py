from rest_framework import serializers

from .models import EventLog


class EventItemSerializer(serializers.Serializer):
    event = serializers.CharField(max_length=50)
    timestamp = serializers.FloatField()
    session_id = serializers.CharField(max_length=64)
    guest_id = serializers.CharField(max_length=64, required=False, allow_blank=True, default="")
    metadata = serializers.DictField(required=False, default=dict)

    def validate_event(self, value):
        if value not in EventLog.VALID_EVENTS:
            raise serializers.ValidationError(f"Evento no soportado: {value}")
        return value


class EventBatchSerializer(serializers.Serializer):
    events = EventItemSerializer(many=True)

    def validate_events(self, value):
        if len(value) > 50:
            raise serializers.ValidationError("Maximo 50 eventos por batch.")
        return value
