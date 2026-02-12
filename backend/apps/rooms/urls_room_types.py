from rest_framework.routers import DefaultRouter

from .views import RoomTypeViewSet

router = DefaultRouter()
router.register("", RoomTypeViewSet, basename="room-type")

urlpatterns = router.urls
