import logging

import requests

from .base import BaseBillingAdapter

logger = logging.getLogger(__name__)

# Nubefact document type codes
DOCUMENT_TYPE_MAP = {
    "boleta": 2,
    "factura": 1,
    "nota_credito": 3,
    "nota_debito": 4,
}

# Nubefact customer document type codes
CUSTOMER_DOC_TYPE_MAP = {
    "DNI": 1,
    "CE": 4,
    "RUC": 6,
    "PASSPORT": 7,
    "PASAPORTE": 7,
}

# Nubefact currency codes
CURRENCY_MAP = {
    "PEN": 1,
    "USD": 2,
}


class NubefactAdapter(BaseBillingAdapter):
    """Adapter for Nubefact electronic billing provider."""

    def build_payload(self, invoice, config):
        items = []
        for item in invoice.items.all().order_by("sort_order"):
            tipo_igv = "1" if item.tipo_afectacion_igv == "10" else "9"
            items.append({
                "unidad_de_medida": "ZZ",
                "codigo": "",
                "descripcion": item.description,
                "cantidad": float(item.quantity),
                "valor_unitario": float(item.unit_price),
                "precio_unitario": float(
                    (item.total / item.quantity).quantize(item.unit_price)
                    if item.quantity else item.unit_price
                ),
                "descuento": "",
                "subtotal": float(item.subtotal),
                "tipo_de_igv": tipo_igv,
                "igv": float(item.igv),
                "total": float(item.total),
                "anticipo_regularizacion": False,
            })

        customer_doc_type = CUSTOMER_DOC_TYPE_MAP.get(
            invoice.cliente_tipo_documento.upper(), 0
        )

        payload = {
            "operacion": "generar_comprobante",
            "tipo_de_comprobante": DOCUMENT_TYPE_MAP.get(invoice.document_type, 2),
            "serie": invoice.serie,
            "numero": invoice.correlativo,
            "sunat_transaction": 1,
            "cliente_tipo_de_documento": customer_doc_type,
            "cliente_numero_de_documento": invoice.cliente_numero_documento,
            "cliente_denominacion": invoice.cliente_razon_social,
            "cliente_direccion": invoice.cliente_direccion or "",
            "cliente_email": invoice.cliente_email or "",
            "fecha_de_emision": invoice.fecha_emision.strftime("%d-%m-%Y"),
            "fecha_de_vencimiento": (
                invoice.fecha_vencimiento.strftime("%d-%m-%Y")
                if invoice.fecha_vencimiento else ""
            ),
            "moneda": CURRENCY_MAP.get(invoice.currency, 1),
            "tipo_de_cambio": "",
            "porcentaje_de_igv": 18.00,
            "descuento_global": "",
            "total_descuento": float(invoice.total_descuentos) if invoice.total_descuentos else "",
            "total_gravada": float(invoice.total_gravado),
            "total_inafecta": float(invoice.total_inafecto),
            "total_exonerada": float(invoice.total_exonerado),
            "total_igv": float(invoice.total_igv),
            "total": float(invoice.total),
            "observaciones": invoice.observaciones or "",
            "items": items,
        }

        # Nota de credito/debito
        if invoice.document_type in ("nota_credito", "nota_debito") and invoice.related_invoice:
            payload["documento_que_se_modifica_tipo"] = DOCUMENT_TYPE_MAP.get(
                invoice.related_invoice.document_type, 2
            )
            payload["documento_que_se_modifica_serie"] = invoice.related_invoice.serie
            payload["documento_que_se_modifica_numero"] = invoice.related_invoice.correlativo
            payload["tipo_de_nota_de_credito"] = 1  # Anulacion
            payload["motivo_o_sustento_de_nota"] = invoice.observaciones or "Anulacion"

        return payload

    def send(self, payload, config):
        url = config["api_endpoint"]
        api_key = config["api_key"]

        try:
            response = requests.post(
                url,
                json=payload,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {api_key}",
                },
                timeout=30,
            )

            body = {}
            try:
                body = response.json()
            except (ValueError, TypeError):
                body = {"raw_text": response.text[:500]}

            if response.status_code == 200 and body.get("errors") is None:
                return {
                    "success": True,
                    "rejected": False,
                    "http_status": response.status_code,
                    "error_code": "",
                    "ticket": str(body.get("sunat_ticket_number", "")),
                    "document_url": body.get("enlace_del_pdf", ""),
                    "raw_response": body,
                    "error": "",
                }
            else:
                error_msg = body.get("errors", response.text[:200])
                return {
                    "success": False,
                    "rejected": response.status_code in (400, 422),
                    "http_status": response.status_code,
                    "error_code": str(body.get("codigo", "")),
                    "ticket": "",
                    "document_url": "",
                    "raw_response": body,
                    "error": str(error_msg),
                }

        except requests.Timeout:
            return {
                "success": False,
                "rejected": False,
                "http_status": None,
                "error_code": "TIMEOUT",
                "ticket": "",
                "document_url": "",
                "raw_response": {},
                "error": "Request timed out after 30s",
            }
        except requests.RequestException as e:
            return {
                "success": False,
                "rejected": False,
                "http_status": None,
                "error_code": "CONNECTION_ERROR",
                "ticket": "",
                "document_url": "",
                "raw_response": {},
                "error": str(e),
            }
