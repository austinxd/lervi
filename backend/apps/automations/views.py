from rest_framework import mixins, viewsets
from rest_framework.response import Response

from apps.common.mixins import TenantQuerySetMixin
from apps.common.permissions import IsOwnerOrManager

from .models import AutomationLog, AutomationRule
from .serializers import AutomationLogSerializer, AutomationRuleSerializer


class AutomationRuleViewSet(TenantQuerySetMixin, viewsets.ModelViewSet):
    serializer_class = AutomationRuleSerializer
    queryset = AutomationRule.objects.all()
    permission_classes = [IsOwnerOrManager]
    filterset_fields = ["trigger", "is_active"]

    def perform_destroy(self, instance):
        if instance.is_system:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Las reglas del sistema no pueden eliminarse. Desactívela en su lugar.")
        instance.delete()


class AutomationLogViewSet(
    TenantQuerySetMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = AutomationLogSerializer
    queryset = AutomationLog.objects.all()
    permission_classes = [IsOwnerOrManager]
    filterset_fields = ["trigger", "success", "rule"]
