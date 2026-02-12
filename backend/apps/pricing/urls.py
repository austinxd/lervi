from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    CalculatePriceView,
    DayOfWeekPricingViewSet,
    PromotionViewSet,
    RatePlanViewSet,
    SeasonViewSet,
)

router = DefaultRouter()
router.register("seasons", SeasonViewSet, basename="season")
router.register("day-of-week", DayOfWeekPricingViewSet, basename="day-of-week-pricing")
router.register("rate-plans", RatePlanViewSet, basename="rate-plan")
router.register("promotions", PromotionViewSet, basename="promotion")

urlpatterns = [
    path("calculate/", CalculatePriceView.as_view(), name="calculate-price"),
] + router.urls
