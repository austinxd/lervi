from django.contrib import admin

from .models import Guest, GuestNote


class GuestNoteInline(admin.TabularInline):
    model = GuestNote
    extra = 0
    readonly_fields = ["created_by", "created_at"]


@admin.register(Guest)
class GuestAdmin(admin.ModelAdmin):
    list_display = ["first_name", "last_name", "email", "document_number", "is_vip", "organization"]
    list_filter = ["organization", "is_vip"]
    search_fields = ["first_name", "last_name", "email", "document_number"]
    inlines = [GuestNoteInline]
