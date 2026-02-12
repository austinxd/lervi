from django.contrib import admin

from .models import DayOfWeekPricing, Promotion, RatePlan, Season


@admin.register(Season)
class SeasonAdmin(admin.ModelAdmin):
    list_display = ["name", "property", "start_month", "start_day", "end_month", "end_day", "price_modifier", "is_active"]
    list_filter = ["property__organization", "is_active"]


@admin.register(DayOfWeekPricing)
class DayOfWeekPricingAdmin(admin.ModelAdmin):
    list_display = ["property", "day_of_week", "price_modifier"]
    list_filter = ["property__organization"]


@admin.register(RatePlan)
class RatePlanAdmin(admin.ModelAdmin):
    list_display = ["name", "room_type", "plan_type", "price_modifier", "is_active"]
    list_filter = ["property__organization", "plan_type", "is_active"]


@admin.register(Promotion)
class PromotionAdmin(admin.ModelAdmin):
    list_display = ["name", "code", "discount_percent", "discount_fixed", "is_active"]
    list_filter = ["property__organization", "is_active"]
