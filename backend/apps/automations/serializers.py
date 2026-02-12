from rest_framework import serializers

from .models import AutomationLog, AutomationRule


class AutomationRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = AutomationRule
        fields = [
            "id", "name", "description",
            "trigger", "conditions", "actions",
            "priority", "is_active", "is_system",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "is_system", "created_at", "updated_at"]


class AutomationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AutomationLog
        fields = [
            "id", "rule", "rule_name", "trigger",
            "event_data", "conditions_met",
            "actions_executed", "success", "error_message",
            "created_at",
        ]
        read_only_fields = fields
