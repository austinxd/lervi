from django.contrib import admin

from .models import Payment, Reservation


class PaymentInline(admin.TabularInline):
    model = Payment
    extra = 0
    readonly_fields = ["created_by", "processed_at"]


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = [
        "confirmation_code", "guest", "property",
        "check_in_date", "check_out_date",
        "operational_status", "financial_status",
    ]
    list_filter = ["operational_status", "financial_status", "property__organization"]
    search_fields = ["confirmation_code", "guest__first_name", "guest__last_name"]
    inlines = [PaymentInline]


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ["reservation", "amount", "currency", "method", "status", "processed_at"]
    list_filter = ["status", "method"]
