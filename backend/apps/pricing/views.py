from datetime import date

from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.permissions import IsOwner, IsOwnerOrManager
from apps.organizations.models import Property
from apps.rooms.models import RoomType

from .engine import calculate_nightly_prices, calculate_total
from .models import DayOfWeekPricing, Promotion, RatePlan, Season
from .serializers import (
    DayOfWeekPricingSerializer,
    PriceCalculationRequestSerializer,
    PromotionSerializer,
    RatePlanSerializer,
    SeasonSerializer,
)


class SeasonViewSet(viewsets.ModelViewSet):
    serializer_class = SeasonSerializer
    queryset = Season.objects.all()
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]
    permission_classes = [IsOwner]

    def get_queryset(self):
        qs = super().get_queryset()
        org = getattr(self.request, "organization", None)
        if org:
            qs = qs.filter(property__organization=org)
        property_id = self.request.query_params.get("property")
        if property_id:
            qs = qs.filter(property_id=property_id)
        return qs


class DayOfWeekPricingViewSet(viewsets.ModelViewSet):
    serializer_class = DayOfWeekPricingSerializer
    queryset = DayOfWeekPricing.objects.all()
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]
    permission_classes = [IsOwner]

    def get_queryset(self):
        qs = super().get_queryset()
        org = getattr(self.request, "organization", None)
        if org:
            qs = qs.filter(property__organization=org)
        property_id = self.request.query_params.get("property")
        if property_id:
            qs = qs.filter(property_id=property_id)
        return qs


class RatePlanViewSet(viewsets.ModelViewSet):
    serializer_class = RatePlanSerializer
    queryset = RatePlan.objects.select_related("room_type")
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]
    permission_classes = [IsOwner]

    def get_queryset(self):
        qs = super().get_queryset()
        org = getattr(self.request, "organization", None)
        if org:
            qs = qs.filter(property__organization=org)
        property_id = self.request.query_params.get("property")
        if property_id:
            qs = qs.filter(property_id=property_id)
        return qs


class PromotionViewSet(viewsets.ModelViewSet):
    serializer_class = PromotionSerializer
    queryset = Promotion.objects.all()
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]
    permission_classes = [IsOwnerOrManager]

    def get_queryset(self):
        qs = super().get_queryset()
        org = getattr(self.request, "organization", None)
        if org:
            qs = qs.filter(property__organization=org)
        property_id = self.request.query_params.get("property")
        if property_id:
            qs = qs.filter(property_id=property_id)
        return qs


class CalculatePriceView(APIView):
    """
    POST /api/v1/pricing/calculate/
    Calculate the price for a stay based on the pricing pipeline.
    """

    def post(self, request):
        serializer = PriceCalculationRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        property_obj = get_object_or_404(Property, pk=data["property_id"])
        room_type = get_object_or_404(RoomType, pk=data["room_type_id"], property=property_obj)

        rate_plan = None
        if data.get("rate_plan_id"):
            rate_plan = get_object_or_404(
                RatePlan, pk=data["rate_plan_id"], property=property_obj, room_type=room_type,
            )

        advance_days = (data["check_in"] - date.today()).days

        nightly_prices = calculate_nightly_prices(
            property_obj=property_obj,
            room_type=room_type,
            check_in=data["check_in"],
            check_out=data["check_out"],
            rate_plan=rate_plan,
            promotion_code=data.get("promotion_code", ""),
            advance_days=max(0, advance_days),
        )

        total = calculate_total(nightly_prices)

        return Response({
            "room_type": str(room_type.id),
            "room_type_name": room_type.name,
            "check_in": data["check_in"].isoformat(),
            "check_out": data["check_out"].isoformat(),
            "nights": len(nightly_prices),
            "nightly_prices": nightly_prices,
            "total": str(total),
            "currency": property_obj.organization.currency,
        })
