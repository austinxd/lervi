from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import PropertyBankAccountViewSet, PropertyViewSet

router = DefaultRouter()
router.register("", PropertyViewSet, basename="property")

bank_account_router = DefaultRouter()
bank_account_router.register("", PropertyBankAccountViewSet, basename="bank-account")

urlpatterns = [
    path(
        "<uuid:property_pk>/bank-accounts/",
        include(bank_account_router.urls),
    ),
] + router.urls
