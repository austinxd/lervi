from django.core.exceptions import ValidationError as DjangoValidationError
from django.db.models import ProtectedError
from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import JSONParser, MultiPartParser
from rest_framework.response import Response

from apps.common.mixins import TenantQuerySetMixin
from apps.common.models import StateTransitionLog
from apps.common.permissions import HasRolePermission, IsOwnerOrManager

from .constants import room_state_machine
from .models import BedConfiguration, Room, RoomType, RoomTypePhoto
from .serializers import (
    BedConfigurationSerializer,
    ChangeBedConfigSerializer,
    ChangeStatusSerializer,
    RoomSerializer,
    RoomTypeCreateSerializer,
    RoomTypePhotoSerializer,
    RoomTypeSerializer,
)


class RoomTypeViewSet(viewsets.ModelViewSet):
    serializer_class = RoomTypeSerializer
    queryset = RoomType.objects.all()
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]

    def get_queryset(self):
        qs = super().get_queryset()
        org = getattr(self.request, "organization", None)
        if org:
            qs = qs.filter(property__organization=org)
        property_id = self.request.query_params.get("property")
        if property_id:
            qs = qs.filter(property_id=property_id)
        return qs

    def get_serializer_class(self):
        if self.action == "create":
            return RoomTypeCreateSerializer
        return RoomTypeSerializer

    def get_permissions(self):
        if self.action in ("create", "partial_update", "destroy"):
            self.permission_classes = [IsOwnerOrManager]
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            instance.delete()
        except ProtectedError:
            return Response(
                {"detail": "No se puede eliminar este tipo de habitación porque tiene reservas asociadas."},
                status=status.HTTP_409_CONFLICT,
            )
        return Response(status=status.HTTP_204_NO_CONTENT)

    # --- Nested: Bed Configurations ---
    @action(detail=True, methods=["get", "post"], url_path="bed-configs")
    def bed_configs(self, request, pk=None):
        room_type = self.get_object()
        if request.method == "GET":
            configs = room_type.bed_configurations.all()
            serializer = BedConfigurationSerializer(configs, many=True)
            return Response(serializer.data)
        serializer = BedConfigurationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(room_type=room_type)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(
        detail=True,
        methods=["patch", "delete"],
        url_path="bed-configs/(?P<config_id>[^/.]+)",
    )
    def bed_config_detail(self, request, pk=None, config_id=None):
        room_type = self.get_object()
        config = get_object_or_404(room_type.bed_configurations, pk=config_id)
        if request.method == "DELETE":
            config.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        serializer = BedConfigurationSerializer(config, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    # --- Nested: Photos ---
    @action(detail=True, methods=["get", "post"], url_path="photos", parser_classes=[MultiPartParser, JSONParser])
    def photos(self, request, pk=None):
        room_type = self.get_object()
        if request.method == "GET":
            photos = room_type.photos.all()
            serializer = RoomTypePhotoSerializer(photos, many=True, context={"request": request})
            return Response(serializer.data)
        serializer = RoomTypePhotoSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save(room_type=room_type)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(
        detail=True,
        methods=["patch", "delete"],
        url_path="photos/(?P<photo_id>[^/.]+)",
        parser_classes=[MultiPartParser, JSONParser],
    )
    def photo_detail(self, request, pk=None, photo_id=None):
        room_type = self.get_object()
        photo = get_object_or_404(room_type.photos, pk=photo_id)
        if request.method == "DELETE":
            photo.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        serializer = RoomTypePhotoSerializer(photo, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class RoomViewSet(viewsets.ModelViewSet):
    serializer_class = RoomSerializer
    queryset = Room.objects.prefetch_related("room_types").select_related("active_bed_configuration")
    http_method_names = ["get", "post", "patch", "head", "options"]

    def get_queryset(self):
        qs = super().get_queryset()
        org = getattr(self.request, "organization", None)
        if org:
            qs = qs.filter(property__organization=org)
        property_id = self.request.query_params.get("property")
        if property_id:
            qs = qs.filter(property_id=property_id)
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    def get_permissions(self):
        if self.action in ("create", "partial_update"):
            self.permission_classes = [IsOwnerOrManager]
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=True, methods=["post"], url_path="change-status")
    def change_status(self, request, pk=None):
        room = self.get_object()
        serializer = ChangeStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_status = serializer.validated_data["new_status"]
        try:
            room_state_machine.transition(room, "status", new_status, user=request.user)
        except DjangoValidationError as e:
            return Response(
                {"detail": e.message},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(RoomSerializer(room).data)

    @action(detail=True, methods=["post"], url_path="change-bed-config")
    def change_bed_config(self, request, pk=None):
        room = self.get_object()
        serializer = ChangeBedConfigSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        config = get_object_or_404(
            BedConfiguration,
            pk=serializer.validated_data["bed_configuration_id"],
            room_type__in=room.room_types.all(),
        )
        room.active_bed_configuration = config
        room.save(update_fields=["active_bed_configuration", "updated_at"])
        return Response(RoomSerializer(room).data)

    @action(detail=True, methods=["get"], url_path="transitions")
    def transitions(self, request, pk=None):
        room = self.get_object()
        logs = StateTransitionLog.objects.filter(
            entity_type="Room",
            entity_id=room.pk,
        )
        data = [
            {
                "id": str(log.id),
                "old_value": log.old_value,
                "new_value": log.new_value,
                "changed_by": str(log.changed_by_id) if log.changed_by_id else None,
                "created_at": log.created_at.isoformat(),
            }
            for log in logs
        ]
        return Response(data)
