from django.contrib import admin

from .models import BillingConfig, Invoice, InvoiceItem, PropertyBillingConfig


class InvoiceItemInline(admin.TabularInline):
    model = InvoiceItem
    extra = 0


@admin.register(BillingConfig)
class BillingConfigAdmin(admin.ModelAdmin):
    list_display = ["organization", "emission_mode", "proveedor", "ambiente"]
    list_filter = ["emission_mode", "proveedor", "ambiente"]


@admin.register(PropertyBillingConfig)
class PropertyBillingConfigAdmin(admin.ModelAdmin):
    list_display = [
        "property", "usa_configuracion_propia", "emission_mode",
        "serie_boleta", "serie_factura",
    ]
    list_filter = ["emission_mode", "usa_configuracion_propia"]


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = [
        "numero_completo", "document_type", "status",
        "cliente_razon_social", "total", "currency",
        "fecha_emision", "property",
    ]
    list_filter = ["status", "document_type", "property__organization"]
    search_fields = ["numero_completo", "cliente_razon_social", "cliente_numero_documento"]
    inlines = [InvoiceItemInline]
    readonly_fields = ["numero_completo"]


@admin.register(InvoiceItem)
class InvoiceItemAdmin(admin.ModelAdmin):
    list_display = ["invoice", "description", "quantity", "total", "tipo_afectacion_igv"]
