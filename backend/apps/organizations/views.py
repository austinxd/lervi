from django.shortcuts import get_object_or_404
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import JSONParser, MultiPartParser
from rest_framework.response import Response

from apps.common.mixins import TenantQuerySetMixin
from apps.common.permissions import IsOwnerOrManager

from .models import BankAccount, Organization, Property
from .serializers import (
    BankAccountSerializer,
    OrganizationSerializer,
    PropertyPhotoSerializer,
    PropertySerializer,
)


class OrganizationDetailView(generics.RetrieveUpdateAPIView):
    """GET/PATCH the current user's organization."""
    serializer_class = OrganizationSerializer

    def get_object(self):
        return self.request.organization


class PropertyViewSet(TenantQuerySetMixin, viewsets.ModelViewSet):
    """CRUD for properties within the current organization."""
    serializer_class = PropertySerializer
    queryset = Property.objects.all()
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]
    parser_classes = [MultiPartParser, JSONParser]

    def get_permissions(self):
        if self.action in ("create", "partial_update", "photos", "photo_detail"):
            self.permission_classes = [IsOwnerOrManager]
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save(organization=self.request.organization)

    # --- Nested: Photos ---
    @action(detail=True, methods=["get", "post"], url_path="photos", parser_classes=[MultiPartParser, JSONParser])
    def photos(self, request, pk=None):
        prop = self.get_object()
        if request.method == "GET":
            photos = prop.photos.all()
            serializer = PropertyPhotoSerializer(photos, many=True, context={"request": request})
            return Response(serializer.data)
        serializer = PropertyPhotoSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save(property=prop)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(
        detail=True,
        methods=["patch", "delete"],
        url_path="photos/(?P<photo_id>[^/.]+)",
        parser_classes=[MultiPartParser, JSONParser],
    )
    def photo_detail(self, request, pk=None, photo_id=None):
        prop = self.get_object()
        photo = get_object_or_404(prop.photos, pk=photo_id)
        if request.method == "DELETE":
            photo.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        serializer = PropertyPhotoSerializer(photo, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class BankAccountViewSet(viewsets.ModelViewSet):
    serializer_class = BankAccountSerializer
    queryset = BankAccount.objects.all()
    permission_classes = [IsOwnerOrManager]
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]

    def get_queryset(self):
        return BankAccount.objects.filter(
            property_id=self.kwargs["property_pk"],
            property__organization=self.request.organization,
        )

    def perform_create(self, serializer):
        prop = get_object_or_404(
            Property,
            pk=self.kwargs["property_pk"],
            organization=self.request.organization,
        )
        serializer.save(property=prop)
