from django.contrib import admin

from .models import Task


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ["task_type", "property", "room", "assigned_to", "priority", "status", "due_date"]
    list_filter = ["status", "task_type", "priority", "property__organization"]
    search_fields = ["notes"]
