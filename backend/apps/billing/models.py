from django.conf import settings
from django.db import models

from apps.common.models import BaseModel, TenantModel

from .constants import EmissionMode, PropertyEmissionMode


class BillingConfig(BaseModel):
    organization = models.OneToOneField(
        "organizations.Organization",
        on_delete=models.CASCADE,
        related_name="billing_config",
    )
    emission_mode = models.CharField(
        max_length=20,
        choices=EmissionMode.choices,
        default=EmissionMode.DISABLED,
    )
    ruc = models.CharField(max_length=20, blank=True, default="")
    razon_social = models.CharField(max_length=300, blank=True, default="")
    direccion_fiscal = models.TextField(blank=True, default="")

    class ProveedorChoices(models.TextChoices):
        NUBEFACT = "nubefact", "Nubefact"
        EFACT = "efact", "eFact"
        CUSTOM_WEBHOOK = "custom_webhook", "Custom Webhook"

    proveedor = models.CharField(
        max_length=30,
        choices=ProveedorChoices.choices,
        blank=True,
        default="",
    )

    class TipoAutenticacion(models.TextChoices):
        API_KEY = "api_key", "API Key"
        CERTIFICATE = "certificate", "Certificado Digital"
        OAUTH2 = "oauth2", "OAuth2"

    tipo_autenticacion = models.CharField(
        max_length=20,
        choices=TipoAutenticacion.choices,
        default=TipoAutenticacion.API_KEY,
    )
    api_endpoint = models.URLField(blank=True, default="")
    api_key = models.CharField(max_length=500, blank=True, default="")
    certificado_digital = models.FileField(
        upload_to="billing/certificates/",
        blank=True,
    )

    class AmbienteChoices(models.TextChoices):
        PRODUCCION = "produccion", "Produccion"
        BETA = "beta", "Beta"

    ambiente = models.CharField(
        max_length=20,
        choices=AmbienteChoices.choices,
        default=AmbienteChoices.BETA,
    )
    configuracion_tributaria = models.JSONField(default=dict, blank=True)

    class Meta:
        verbose_name = "Configuracion de facturacion"
        verbose_name_plural = "Configuraciones de facturacion"

    def __str__(self):
        return f"BillingConfig — {self.organization.name}"


class PropertyBillingConfig(BaseModel):
    property = models.OneToOneField(
        "organizations.Property",
        on_delete=models.CASCADE,
        related_name="billing_config",
    )
    usa_configuracion_propia = models.BooleanField(default=False)
    emission_mode = models.CharField(
        max_length=20,
        choices=PropertyEmissionMode.choices,
        default=PropertyEmissionMode.INHERIT,
    )
    proveedor = models.CharField(
        max_length=30,
        choices=BillingConfig.ProveedorChoices.choices,
        blank=True,
        default="",
    )
    api_endpoint = models.URLField(blank=True, default="")
    api_key = models.CharField(max_length=500, blank=True, default="")
    serie_boleta = models.CharField(max_length=10, blank=True, default="")
    serie_factura = models.CharField(max_length=10, blank=True, default="")
    establecimiento_codigo = models.CharField(max_length=10, blank=True, default="")
    punto_emision = models.CharField(max_length=10, blank=True, default="")

    class Meta:
        verbose_name = "Configuracion de facturacion por propiedad"
        verbose_name_plural = "Configuraciones de facturacion por propiedad"

    def __str__(self):
        return f"PropertyBillingConfig — {self.property.name}"


class Invoice(TenantModel):
    class DocumentType(models.TextChoices):
        BOLETA = "boleta", "Boleta"
        FACTURA = "factura", "Factura"
        NOTA_CREDITO = "nota_credito", "Nota de credito"
        NOTA_DEBITO = "nota_debito", "Nota de debito"

    class Status(models.TextChoices):
        DRAFT = "draft", "Borrador"
        PENDING = "pending", "Pendiente"
        SENT = "sent", "Enviado"
        ACCEPTED = "accepted", "Aceptado"
        REJECTED = "rejected", "Rechazado"
        VOIDED = "voided", "Anulado"
        ERROR = "error", "Error"

    reservation = models.ForeignKey(
        "reservations.Reservation",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="invoices",
    )
    property = models.ForeignKey(
        "organizations.Property",
        on_delete=models.CASCADE,
        related_name="invoices",
    )
    document_type = models.CharField(
        max_length=20,
        choices=DocumentType.choices,
    )
    serie = models.CharField(max_length=10)
    correlativo = models.PositiveIntegerField()
    numero_completo = models.CharField(max_length=20, editable=False)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
    )

    # Customer snapshot
    cliente_tipo_documento = models.CharField(max_length=10, blank=True, default="")
    cliente_numero_documento = models.CharField(max_length=20, blank=True, default="")
    cliente_razon_social = models.CharField(max_length=300, blank=True, default="")
    cliente_direccion = models.CharField(max_length=500, blank=True, default="")
    cliente_email = models.EmailField(blank=True, default="")

    # Desglose tributario
    total_gravado = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_exonerado = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_inafecto = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_descuentos = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_igv = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default="PEN")

    # Fechas
    fecha_emision = models.DateField()
    fecha_vencimiento = models.DateField(null=True, blank=True)

    # Provider tracking
    provider_request = models.JSONField(default=dict, blank=True)
    provider_response = models.JSONField(default=dict, blank=True)
    provider_http_status = models.PositiveSmallIntegerField(null=True, blank=True)
    provider_latency_ms = models.PositiveIntegerField(null=True, blank=True)
    provider_error_code = models.CharField(max_length=50, blank=True, default="")
    provider_document_url = models.URLField(blank=True, default="")
    sunat_ticket = models.CharField(max_length=100, blank=True, default="")

    # Retry tracking
    retry_count = models.PositiveSmallIntegerField(default=0)
    last_error = models.TextField(blank=True, default="")
    last_attempt_at = models.DateTimeField(null=True, blank=True)

    # Otros
    observaciones = models.TextField(blank=True, default="")
    related_invoice = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="related_documents",
    )

    class Meta:
        ordering = ["-created_at"]
        unique_together = [("organization", "serie", "correlativo")]

    def __str__(self):
        return f"{self.numero_completo} — {self.get_document_type_display()}"

    def save(self, *args, **kwargs):
        if not self.numero_completo and self.serie and self.correlativo:
            self.numero_completo = f"{self.serie}-{self.correlativo:08d}"
        super().save(*args, **kwargs)


class InvoiceItem(BaseModel):
    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.CASCADE,
        related_name="items",
    )
    description = models.CharField(max_length=500)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    igv = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)

    class TipoAfectacionIGV(models.TextChoices):
        GRAVADO = "10", "Gravado"
        EXONERADO = "20", "Exonerado"
        INAFECTO = "30", "Inafecto"

    tipo_afectacion_igv = models.CharField(
        max_length=10,
        choices=TipoAfectacionIGV.choices,
        default=TipoAfectacionIGV.GRAVADO,
    )
    sort_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["sort_order"]

    def __str__(self):
        return f"{self.description} x{self.quantity}"
