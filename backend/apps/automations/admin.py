from django.contrib import admin

from .models import AutomationLog, AutomationRule


@admin.register(AutomationRule)
class AutomationRuleAdmin(admin.ModelAdmin):
    list_display = ["name", "trigger", "priority", "is_active", "is_system", "organization"]
    list_filter = ["trigger", "is_active", "is_system", "organization"]


@admin.register(AutomationLog)
class AutomationLogAdmin(admin.ModelAdmin):
    list_display = ["rule_name", "trigger", "conditions_met", "success", "created_at"]
    list_filter = ["success", "trigger"]
    readonly_fields = ["event_data", "actions_executed"]
