from rest_framework import serializers

from .models import Task


class TaskListSerializer(serializers.ModelSerializer):
    room_number = serializers.CharField(source="room.number", read_only=True, default=None)
    assigned_to_name = serializers.CharField(
        source="assigned_to.full_name", read_only=True, default=None,
    )
    property_name = serializers.CharField(source="property.name", read_only=True)

    class Meta:
        model = Task
        fields = [
            "id", "task_type", "property", "property_name",
            "room", "room_number",
            "assigned_to", "assigned_to_name", "assigned_role",
            "priority", "status",
            "due_date", "created_at",
        ]
        read_only_fields = fields


class TaskDetailSerializer(serializers.ModelSerializer):
    room_number = serializers.CharField(source="room.number", read_only=True, default=None)
    assigned_to_name = serializers.CharField(
        source="assigned_to.full_name", read_only=True, default=None,
    )
    created_by_name = serializers.CharField(
        source="created_by.full_name", read_only=True, default=None,
    )
    property_name = serializers.CharField(source="property.name", read_only=True)

    class Meta:
        model = Task
        fields = [
            "id", "task_type", "property", "property_name",
            "room", "room_number",
            "assigned_to", "assigned_to_name", "assigned_role",
            "priority", "status",
            "due_date", "notes", "result",
            "completed_at",
            "created_by", "created_by_name",
            "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "status", "completed_at",
            "created_by", "created_by_name",
            "created_at", "updated_at",
        ]


class TaskCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = [
            "id", "task_type", "property", "room",
            "assigned_to", "assigned_role",
            "priority", "due_date", "notes",
        ]
        read_only_fields = ["id"]


class TaskCompleteSerializer(serializers.Serializer):
    result = serializers.CharField(required=False, default="")
