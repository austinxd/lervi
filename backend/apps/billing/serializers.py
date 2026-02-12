from rest_framework import serializers

from apps.billing.services.config_resolver import resolve_billing_config

from .models import (
    BillingConfig,
    Invoice,
    InvoiceItem,
    PropertyBillingConfig,
)


class BillingConfigSerializer(serializers.ModelSerializer):
    api_key = serializers.CharField(
        write_only=True, required=False, allow_blank=True,
    )

    class Meta:
        model = BillingConfig
        fields = [
            "id",
            "emission_mode",
            "ruc",
            "razon_social",
            "direccion_fiscal",
            "proveedor",
            "tipo_autenticacion",
            "api_endpoint",
            "api_key",
            "ambiente",
            "configuracion_tributaria",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class PropertyBillingConfigSerializer(serializers.ModelSerializer):
    api_key = serializers.CharField(
        write_only=True, required=False, allow_blank=True,
    )
    resolved_config = serializers.SerializerMethodField()

    class Meta:
        model = PropertyBillingConfig
        fields = [
            "id",
            "property",
            "usa_configuracion_propia",
            "emission_mode",
            "proveedor",
            "api_endpoint",
            "api_key",
            "serie_boleta",
            "serie_factura",
            "establecimiento_codigo",
            "punto_emision",
            "resolved_config",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "property", "resolved_config", "created_at", "updated_at"]

    def get_resolved_config(self, obj):
        config = resolve_billing_config(obj.property)
        if not config:
            return None
        # Remove sensitive fields
        config.pop("api_key", None)
        return config


class InvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItem
        fields = [
            "id",
            "description",
            "quantity",
            "unit_price",
            "subtotal",
            "igv",
            "total",
            "tipo_afectacion_igv",
            "sort_order",
        ]
        read_only_fields = ["id"]


class InvoiceListSerializer(serializers.ModelSerializer):
    property_name = serializers.CharField(
        source="property.name", read_only=True,
    )
    reservation_code = serializers.CharField(
        source="reservation.confirmation_code",
        read_only=True,
        default=None,
    )

    class Meta:
        model = Invoice
        fields = [
            "id",
            "numero_completo",
            "document_type",
            "serie",
            "correlativo",
            "status",
            "cliente_razon_social",
            "cliente_numero_documento",
            "total",
            "currency",
            "fecha_emision",
            "property",
            "property_name",
            "reservation",
            "reservation_code",
            "retry_count",
            "last_error",
            "created_at",
        ]
        read_only_fields = fields


class InvoiceDetailSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True, read_only=True)
    property_name = serializers.CharField(
        source="property.name", read_only=True,
    )
    reservation_code = serializers.CharField(
        source="reservation.confirmation_code",
        read_only=True,
        default=None,
    )

    class Meta:
        model = Invoice
        fields = [
            "id",
            "numero_completo",
            "document_type",
            "serie",
            "correlativo",
            "status",
            # Customer snapshot
            "cliente_tipo_documento",
            "cliente_numero_documento",
            "cliente_razon_social",
            "cliente_direccion",
            "cliente_email",
            # Tax breakdown
            "total_gravado",
            "total_exonerado",
            "total_inafecto",
            "total_descuentos",
            "total_igv",
            "total",
            "currency",
            # Dates
            "fecha_emision",
            "fecha_vencimiento",
            # Provider tracking
            "provider_http_status",
            "provider_latency_ms",
            "provider_error_code",
            "provider_document_url",
            "sunat_ticket",
            # Retry tracking
            "retry_count",
            "last_error",
            "last_attempt_at",
            # Relations
            "property",
            "property_name",
            "reservation",
            "reservation_code",
            "related_invoice",
            "observaciones",
            # Items
            "items",
            # Timestamps
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id", "numero_completo", "serie", "correlativo",
            "status", "provider_http_status", "provider_latency_ms",
            "provider_error_code", "provider_document_url", "sunat_ticket",
            "retry_count", "last_error", "last_attempt_at",
            "created_at", "updated_at",
        ]


class ManualInvoiceCreateSerializer(serializers.Serializer):
    reservation_id = serializers.UUIDField()
    document_type = serializers.ChoiceField(
        choices=[
            ("boleta", "Boleta"),
            ("factura", "Factura"),
        ],
        default="boleta",
    )
