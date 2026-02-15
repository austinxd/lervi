import logging

import requests

from .base import BaseBillingAdapter

logger = logging.getLogger(__name__)

# eFact document type codes (SUNAT UBL 2.1)
DOCUMENT_TYPE_MAP = {
    "factura": "01",
    "boleta": "03",
    "nota_credito": "07",
    "nota_debito": "08",
}

# Customer document type codes (SUNAT)
CUSTOMER_DOC_TYPE_MAP = {
    "DNI": "1",
    "CE": "4",
    "RUC": "6",
    "PASSPORT": "7",
    "PASAPORTE": "7",
}

# IGV affectation codes (SUNAT)
IGV_AFFECTATION_MAP = {
    "10": "gravado",
    "20": "exonerado",
    "30": "inafecto",
}


class EfactAdapter(BaseBillingAdapter):
    """
    Adapter for eFact electronic billing provider.
    Uses the eFact REST API with JSON payloads following SUNAT UBL 2.1 standard.
    """

    def build_payload(self, invoice, config):
        items = []
        for item in invoice.items.all().order_by("sort_order"):
            entry = {
                "descripcion": item.description,
                "cantidad": float(item.quantity),
                "valorUnitario": float(item.unit_price),
                "precioUnitario": float(
                    (item.total / item.quantity).quantize(item.unit_price)
                    if item.quantity else item.unit_price
                ),
                "subtotal": float(item.subtotal),
                "igv": float(item.igv),
                "total": float(item.total),
                "tipoAfectacionIgv": item.tipo_afectacion_igv or "10",
                "unidadMedida": "NIU",
            }
            items.append(entry)

        customer_doc_type = CUSTOMER_DOC_TYPE_MAP.get(
            invoice.cliente_tipo_documento.upper(), "0"
        )

        igv_rate = float(config.get("configuracion_tributaria", {}).get("tasa_igv", 18))

        payload = {
            "tipoComprobante": DOCUMENT_TYPE_MAP.get(invoice.document_type, "03"),
            "serie": invoice.serie,
            "numero": invoice.correlativo,
            "fechaEmision": invoice.fecha_emision.strftime("%Y-%m-%d"),
            "fechaVencimiento": (
                invoice.fecha_vencimiento.strftime("%Y-%m-%d")
                if invoice.fecha_vencimiento else None
            ),
            "moneda": invoice.currency or "PEN",
            "tasaIgv": igv_rate,
            "cliente": {
                "tipoDocumento": customer_doc_type,
                "numDocumento": invoice.cliente_numero_documento,
                "razonSocial": invoice.cliente_razon_social,
                "direccion": invoice.cliente_direccion or "",
                "email": invoice.cliente_email or "",
            },
            "items": items,
            "totales": {
                "totalGravado": float(invoice.total_gravado),
                "totalExonerado": float(invoice.total_exonerado),
                "totalInafecto": float(invoice.total_inafecto),
                "totalDescuentos": float(invoice.total_descuentos) if invoice.total_descuentos else 0,
                "totalIgv": float(invoice.total_igv),
                "total": float(invoice.total),
            },
            "observaciones": invoice.observaciones or "",
        }

        # Nota de credito/debito
        if invoice.document_type in ("nota_credito", "nota_debito") and invoice.related_invoice:
            payload["documentoRelacionado"] = {
                "tipoComprobante": DOCUMENT_TYPE_MAP.get(
                    invoice.related_invoice.document_type, "03"
                ),
                "serie": invoice.related_invoice.serie,
                "numero": invoice.related_invoice.correlativo,
            }
            if invoice.document_type == "nota_credito":
                payload["tipoNotaCredito"] = "01"  # Anulacion de la operacion
            else:
                payload["tipoNotaDebito"] = "01"  # Intereses por mora
            payload["motivo"] = invoice.observaciones or "Anulacion"

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

            if response.status_code == 200 and not body.get("errors"):
                return {
                    "success": True,
                    "rejected": False,
                    "http_status": response.status_code,
                    "error_code": "",
                    "ticket": str(body.get("ticket", body.get("sunatTicket", ""))),
                    "document_url": body.get("enlacePdf", body.get("urlPdf", "")),
                    "raw_response": body,
                    "error": "",
                }
            else:
                error_msg = body.get("errors", body.get("mensaje", response.text[:200]))
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
