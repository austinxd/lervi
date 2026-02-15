from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import models
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.automations.dispatcher import dispatch_event
from apps.common.mixins import TenantQuerySetMixin
from apps.common.permissions import HasRolePermission

from .constants import task_state_machine
from .models import Task
from .serializers import (
    TaskCompleteSerializer,
    TaskCreateSerializer,
    TaskDetailSerializer,
    TaskListSerializer,
)


class TaskViewSet(TenantQuerySetMixin, viewsets.ModelViewSet):
    queryset = Task.objects.select_related("room", "assigned_to", "property", "organization")
    http_method_names = ["get", "post", "patch", "head", "options"]
    filterset_fields = ["status", "task_type", "priority", "property", "assigned_to", "assigned_role"]

    def get_serializer_class(self):
        if self.action == "list":
            return TaskListSerializer
        if self.action == "create":
            return TaskCreateSerializer
        return TaskDetailSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        # Housekeeping/maintenance only see their own tasks
        user = self.request.user
        if user.role in ("housekeeping", "maintenance"):
            qs = qs.filter(
                models.Q(assigned_to=user) | models.Q(assigned_role=user.role)
            )
        return qs

    def get_permissions(self):
        if self.action == "create":
            self.required_role = "reception"
            self.permission_classes = [HasRolePermission]
        return super().get_permissions()

    @action(detail=True, methods=["post"], url_path="start")
    def start(self, request, pk=None):
        task = self.get_object()
        try:
            task_state_machine.transition(task, "status", "in_progress", user=request.user)
        except DjangoValidationError as e:
            return Response({"detail": e.message}, status=status.HTTP_400_BAD_REQUEST)

        # Auto-assign to current user if not assigned
        if not task.assigned_to:
            task.assigned_to = request.user
            task.save(update_fields=["assigned_to", "updated_at"])

        return Response(TaskDetailSerializer(task).data)

    @action(detail=True, methods=["post"], url_path="complete")
    def complete(self, request, pk=None):
        task = self.get_object()
        serializer = TaskCompleteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            task_state_machine.transition(task, "status", "completed", user=request.user)
        except DjangoValidationError as e:
            return Response({"detail": e.message}, status=status.HTTP_400_BAD_REQUEST)

        task.result = serializer.validated_data.get("result", "")
        task.completed_at = timezone.now()
        task.save(update_fields=["result", "completed_at", "updated_at"])

        # Dispatch automation event
        dispatch_event("task.completed", task.organization, {
            "task": task,
            "room": task.room,
            "property": task.property,
            "user": request.user,
        })

        return Response(TaskDetailSerializer(task).data)
