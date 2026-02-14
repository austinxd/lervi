from django.contrib import admin

from .models import EventLog


@admin.register(EventLog)
class EventLogAdmin(admin.ModelAdmin):
    list_display = ["event_name", "session_id", "organization", "created_at"]
    list_filter = ["event_name", "organization", "created_at"]
    search_fields = ["session_id", "event_name"]
    readonly_fields = ["id", "organization", "guest", "session_id", "event_name", "metadata", "created_at"]
    date_hierarchy = "created_at"
