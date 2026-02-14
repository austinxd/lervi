from django.contrib import admin

from .models import GlobalIdentity, IdentityLink, OTPCode


@admin.register(GlobalIdentity)
class GlobalIdentityAdmin(admin.ModelAdmin):
    list_display = ("id", "document_type", "document_hash_short", "last_seen_at", "created_at")
    search_fields = ("document_hash",)
    readonly_fields = ("id", "document_hash", "created_at")

    def document_hash_short(self, obj):
        return obj.document_hash[:16] + "..."
    document_hash_short.short_description = "Document Hash"


@admin.register(IdentityLink)
class IdentityLinkAdmin(admin.ModelAdmin):
    list_display = ("id", "identity", "organization", "guest", "created_at")
    list_filter = ("organization",)
    raw_id_fields = ("identity", "guest")


@admin.register(OTPCode)
class OTPCodeAdmin(admin.ModelAdmin):
    list_display = ("id", "identity", "code", "attempts", "is_used", "expires_at", "created_at")
    list_filter = ("is_used",)
    readonly_fields = ("id", "created_at")
