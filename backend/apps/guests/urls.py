from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import GuestViewSet, ReniecLookupView

router = DefaultRouter()
router.register("", GuestViewSet, basename="guest")

urlpatterns = [
    path("reniec-lookup/", ReniecLookupView.as_view(), name="reniec-lookup"),
] + router.urls
