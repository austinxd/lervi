import logging
from decimal import Decimal

from django.utils import timezone

from .config_resolver import resolve_billing_config
from .correlativo import get_next_correlativo

logger = logging.getLogger(__name__)

QUANTIZE = Decimal("0.01")


def build_invoice_from_reservation(reservation, document_type="boleta", user=None):
    """
    Build an Invoice (+ InvoiceItems) from a Reservation.

    Returns Invoice in status 'draft', or None if billing is disabled
    or series are not configured.
    """
    from apps.billing.models import Invoice, InvoiceItem

    config = resolve_billing_config(reservation.property)
    if not config:
        return None

    # Determine serie
    if document_type in ("boleta", "nota_credito"):
        serie = config["serie_boleta"]
    else:
        serie = config["serie_factura"]

    if not serie:
        logger.warning(
            f"No serie configured for document_type={document_type} "
            f"on property {reservation.property.name}"
        )
        return None

    # IGV rate from org config
    tributaria = config.get("configuracion_tributaria") or {}
    igv_rate = Decimal(str(tributaria.get("igv_rate", "0.18")))

    # Get next correlativo
    correlativo = get_next_correlativo(reservation.organization, serie)
    numero_completo = f"{serie}-{correlativo:08d}"

    # Calculate nights
    nights = (reservation.check_out_date - reservation.check_in_date).days
    if nights < 1:
        nights = 1

    # Build items — default: alojamiento gravado (tipo_afectacion_igv="10")
    total_amount = reservation.total_amount
    tipo_afectacion = "10"  # gravado by default

    # Desglose tributario
    if tipo_afectacion == "10":  # Gravado
        base = (total_amount / (1 + igv_rate)).quantize(QUANTIZE)
        igv = (total_amount - base).quantize(QUANTIZE)
        total_gravado = base
        total_exonerado = Decimal("0.00")
        total_inafecto = Decimal("0.00")
    elif tipo_afectacion == "20":  # Exonerado
        base = total_amount
        igv = Decimal("0.00")
        total_gravado = Decimal("0.00")
        total_exonerado = base
        total_inafecto = Decimal("0.00")
    else:  # 30 — Inafecto
        base = total_amount
        igv = Decimal("0.00")
        total_gravado = Decimal("0.00")
        total_exonerado = Decimal("0.00")
        total_inafecto = base

    total_igv = igv
    total = total_amount

    # Consistency check
    computed_total = total_gravado + total_exonerado + total_inafecto + total_igv
    diff = abs(computed_total - total)
    if diff > Decimal("0.01"):
        logger.warning(
            f"Tax breakdown mismatch: computed={computed_total}, total={total}, "
            f"diff={diff}. Adjusting total_gravado."
        )
        total_gravado = (total - total_exonerado - total_inafecto - total_igv).quantize(QUANTIZE)

    # Customer snapshot from guest
    guest = reservation.guest
    cliente_tipo_documento = getattr(guest, "document_type", "") or ""
    cliente_numero_documento = getattr(guest, "document_number", "") or ""
    cliente_razon_social = getattr(guest, "full_name", "") or ""
    cliente_email = getattr(guest, "email", "") or ""

    # Create invoice
    invoice = Invoice.objects.create(
        organization=reservation.organization,
        created_by=user,
        reservation=reservation,
        property=reservation.property,
        document_type=document_type,
        serie=serie,
        correlativo=correlativo,
        numero_completo=numero_completo,
        status="draft",
        cliente_tipo_documento=cliente_tipo_documento,
        cliente_numero_documento=cliente_numero_documento,
        cliente_razon_social=cliente_razon_social,
        cliente_email=cliente_email,
        total_gravado=total_gravado,
        total_exonerado=total_exonerado,
        total_inafecto=total_inafecto,
        total_descuentos=Decimal("0.00"),
        total_igv=total_igv,
        total=total,
        currency=reservation.currency,
        fecha_emision=timezone.localdate(),
    )

    # Create item: alojamiento
    unit_price = (total_amount / nights).quantize(QUANTIZE)
    item_subtotal = (base / nights * nights).quantize(QUANTIZE)
    item_igv = (igv / nights * nights).quantize(QUANTIZE)

    # Adjust for rounding on last item
    item_subtotal = base
    item_igv = igv

    InvoiceItem.objects.create(
        invoice=invoice,
        description=(
            f"Alojamiento — {reservation.property.name} "
            f"({reservation.check_in_date} a {reservation.check_out_date})"
        ),
        quantity=Decimal(str(nights)),
        unit_price=unit_price,
        subtotal=item_subtotal,
        igv=item_igv,
        total=total_amount,
        tipo_afectacion_igv=tipo_afectacion,
        sort_order=1,
    )

    return invoice
