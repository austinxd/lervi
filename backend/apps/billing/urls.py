from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import BillingConfigView, InvoiceViewSet, PropertyBillingConfigViewSet

router = DefaultRouter()
router.register("invoices", InvoiceViewSet, basename="invoice")

property_config = PropertyBillingConfigViewSet.as_view({
    "get": "retrieve",
    "put": "update",
    "patch": "partial_update",
})

urlpatterns = [
    path("config/", BillingConfigView.as_view(), name="billing-config"),
    path(
        "properties/<uuid:property_pk>/config/",
        property_config,
        name="property-billing-config",
    ),
] + router.urls
