from django.shortcuts import get_object_or_404
from rest_framework import generics, viewsets

from apps.common.mixins import TenantQuerySetMixin
from apps.common.permissions import IsOwnerOrManager

from .models import BankAccount, Organization, Property
from .serializers import BankAccountSerializer, OrganizationSerializer, PropertySerializer


class OrganizationDetailView(generics.RetrieveUpdateAPIView):
    """GET/PATCH the current user's organization."""
    serializer_class = OrganizationSerializer

    def get_object(self):
        return self.request.organization


class PropertyViewSet(TenantQuerySetMixin, viewsets.ModelViewSet):
    """CRUD for properties within the current organization."""
    serializer_class = PropertySerializer
    queryset = Property.objects.all()
    http_method_names = ["get", "post", "patch", "head", "options"]

    def get_permissions(self):
        if self.action in ("create", "partial_update"):
            self.permission_classes = [IsOwnerOrManager]
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save(organization=self.request.organization)


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
