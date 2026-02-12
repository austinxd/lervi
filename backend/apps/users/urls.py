from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import MeView, UserViewSet

router = DefaultRouter()
router.register("", UserViewSet, basename="user")

urlpatterns = [
    path("me/", MeView.as_view(), name="user-me"),
] + router.urls
