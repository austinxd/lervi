from rest_framework.routers import DefaultRouter

from .views import AutomationLogViewSet, AutomationRuleViewSet

router = DefaultRouter()
router.register("rules", AutomationRuleViewSet, basename="automation-rule")
router.register("logs", AutomationLogViewSet, basename="automation-log")

urlpatterns = router.urls
