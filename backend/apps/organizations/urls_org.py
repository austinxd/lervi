from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import OrgBankAccountViewSet, OrganizationDetailView

bank_router = DefaultRouter()
bank_router.register("", OrgBankAccountViewSet, basename="org-bank-account")

urlpatterns = [
    path("", OrganizationDetailView.as_view(), name="organization-detail"),
    path("bank-accounts/", include(bank_router.urls)),
]
