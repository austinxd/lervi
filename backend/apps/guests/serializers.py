from rest_framework import serializers

from .models import Guest, GuestNote


class GuestNoteSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source="created_by.full_name", read_only=True, default=None)

    class Meta:
        model = GuestNote
        fields = ["id", "content", "created_by", "created_by_name", "created_at"]
        read_only_fields = ["id", "created_by", "created_by_name", "created_at"]


class GuestSerializer(serializers.ModelSerializer):
    notes = GuestNoteSerializer(many=True, read_only=True)

    class Meta:
        model = Guest
        fields = [
            "id", "first_name", "last_name", "email", "phone",
            "document_type", "document_number",
            "nationality", "country_of_residence",
            "is_vip", "notes",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class GuestListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Guest
        fields = [
            "id", "first_name", "last_name", "email", "phone",
            "document_type", "document_number",
            "is_vip", "created_at",
        ]
        read_only_fields = ["id", "created_at"]
