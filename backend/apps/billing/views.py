from django.core.exceptions import ValidationError as DjangoValidationError
from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.mixins import TenantQuerySetMixin
from apps.common.permissions import IsOwnerOrManager
from apps.reservations.models import Reservation

from .constants import invoice_state_machine
from .models import BillingConfig, Invoice, PropertyBillingConfig
from .serializers import (
    BillingConfigSerializer,
    InvoiceDetailSerializer,
    InvoiceListSerializer,
    ManualInvoiceCreateSerializer,
    PropertyBillingConfigSerializer,
)
from .services.invoice_builder import build_invoice_from_reservation
from .services.invoice_emitter import emit_invoice


class BillingConfigView(APIView):
    """
    GET/PATCH the organization's billing configuration.
    Creates config on first GET if it doesn't exist.
    """

    permission_classes = [IsOwnerOrManager]

    def get(self, request):
        config, _ = BillingConfig.objects.get_or_create(
            organization=request.organization,
        )
        serializer = BillingConfigSerializer(config)
        return Response(serializer.data)

    def patch(self, request):
        config, _ = BillingConfig.objects.get_or_create(
            organization=request.organization,
        )
        serializer = BillingConfigSerializer(
            config, data=request.data, partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class PropertyBillingConfigViewSet(viewsets.GenericViewSet):
    """
    GET/PUT/PATCH a property's billing configuration.
    """

    permission_classes = [IsOwnerOrManager]
    serializer_class = PropertyBillingConfigSerializer

    def _get_property(self, request, property_pk):
        from apps.organizations.models import Property

        return get_object_or_404(
            Property,
            pk=property_pk,
            organization=request.organization,
        )

    def retrieve(self, request, property_pk=None):
        property_obj = self._get_property(request, property_pk)
        config, _ = PropertyBillingConfig.objects.get_or_create(
            property=property_obj,
        )
        serializer = self.get_serializer(config)
        return Response(serializer.data)

    def update(self, request, property_pk=None):
        property_obj = self._get_property(request, property_pk)
        config, _ = PropertyBillingConfig.objects.get_or_create(
            property=property_obj,
        )
        serializer = self.get_serializer(config, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def partial_update(self, request, property_pk=None):
        property_obj = self._get_property(request, property_pk)
        config, _ = PropertyBillingConfig.objects.get_or_create(
            property=property_obj,
        )
        serializer = self.get_serializer(
            config, data=request.data, partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class InvoiceViewSet(TenantQuerySetMixin, viewsets.ModelViewSet):
    """
    ViewSet for invoices.
    list/retrieve: Read invoices
    create: Manually create an invoice from a reservation
    emit: Emit (or retry) an invoice
    void: Void an invoice
    """

    queryset = Invoice.objects.select_related(
        "property", "reservation", "reservation__guest",
    )
    permission_classes = [IsOwnerOrManager]
    http_method_names = ["get", "post", "head", "options"]
    filterset_fields = ["status", "document_type", "property"]
    search_fields = ["numero_completo", "cliente_razon_social", "cliente_numero_documento"]

    def get_serializer_class(self):
        if self.action == "list":
            return InvoiceListSerializer
        if self.action == "create":
            return ManualInvoiceCreateSerializer
        return InvoiceDetailSerializer

    def create(self, request, *args, **kwargs):
        serializer = ManualInvoiceCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        reservation = get_object_or_404(
            Reservation,
            pk=serializer.validated_data["reservation_id"],
            organization=request.organization,
        )

        invoice = build_invoice_from_reservation(
            reservation,
            document_type=serializer.validated_data["document_type"],
            user=request.user,
        )
        if not invoice:
            return Response(
                {"detail": "No se pudo crear la factura. Verifique la configuracion de facturacion y las series."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            InvoiceDetailSerializer(invoice).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"], url_path="emit")
    def emit(self, request, pk=None):
        invoice = self.get_object()
        if invoice.status not in ("draft", "error", "rejected"):
            return Response(
                {"detail": f"No se puede emitir un comprobante en estado '{invoice.get_status_display()}'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        result = emit_invoice(invoice, user=request.user)
        invoice.refresh_from_db()
        data = InvoiceDetailSerializer(invoice).data
        data["emission_result"] = result
        return Response(data)

    @action(detail=True, methods=["post"], url_path="void")
    def void(self, request, pk=None):
        invoice = self.get_object()
        try:
            invoice_state_machine.transition(
                invoice, "status", "voided", user=request.user,
            )
        except DjangoValidationError as e:
            return Response(
                {"detail": e.message},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(InvoiceDetailSerializer(invoice).data)
