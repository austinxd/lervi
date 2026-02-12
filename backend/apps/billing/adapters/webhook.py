import logging

import requests

from .base import BaseBillingAdapter

logger = logging.getLogger(__name__)


class CustomWebhookAdapter(BaseBillingAdapter):
    """
    Adapter that sends invoice data to a custom webhook endpoint.
    For organizations that handle billing in an external system.
    """

    def build_payload(self, invoice, config):
        items = []
        for item in invoice.items.all().order_by("sort_order"):
            items.append({
                "description": item.description,
                "quantity": str(item.quantity),
                "unit_price": str(item.unit_price),
                "subtotal": str(item.subtotal),
                "igv": str(item.igv),
                "total": str(item.total),
                "tipo_afectacion_igv": item.tipo_afectacion_igv,
            })

        return {
            "document_type": invoice.document_type,
            "serie": invoice.serie,
            "correlativo": invoice.correlativo,
            "numero_completo": invoice.numero_completo,
            "customer": {
                "tipo_documento": invoice.cliente_tipo_documento,
                "numero_documento": invoice.cliente_numero_documento,
                "razon_social": invoice.cliente_razon_social,
                "direccion": invoice.cliente_direccion,
                "email": invoice.cliente_email,
            },
            "emisor": {
                "ruc": config["ruc"],
                "razon_social": config["razon_social"],
                "direccion_fiscal": config["direccion_fiscal"],
            },
            "items": items,
            "total_gravado": str(invoice.total_gravado),
            "total_exonerado": str(invoice.total_exonerado),
            "total_inafecto": str(invoice.total_inafecto),
            "total_descuentos": str(invoice.total_descuentos),
            "total_igv": str(invoice.total_igv),
            "total": str(invoice.total),
            "currency": invoice.currency,
            "fecha_emision": invoice.fecha_emision.isoformat(),
            "fecha_vencimiento": (
                invoice.fecha_vencimiento.isoformat()
                if invoice.fecha_vencimiento else None
            ),
            "observaciones": invoice.observaciones,
        }

    def send(self, payload, config):
        url = config["api_endpoint"]
        api_key = config["api_key"]

        try:
            headers = {"Content-Type": "application/json"}
            if api_key:
                headers["Authorization"] = f"Bearer {api_key}"

            response = requests.post(
                url,
                json=payload,
                headers=headers,
                timeout=30,
            )

            body = {}
            try:
                body = response.json()
            except (ValueError, TypeError):
                body = {"raw_text": response.text[:500]}

            if response.status_code in (200, 201):
                return {
                    "success": True,
                    "rejected": False,
                    "http_status": response.status_code,
                    "error_code": "",
                    "ticket": str(body.get("ticket", "")),
                    "document_url": body.get("document_url", ""),
                    "raw_response": body,
                    "error": "",
                }
            else:
                return {
                    "success": False,
                    "rejected": response.status_code in (400, 422),
                    "http_status": response.status_code,
                    "error_code": str(body.get("error_code", "")),
                    "ticket": "",
                    "document_url": "",
                    "raw_response": body,
                    "error": body.get("error", response.text[:200]),
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
                "error": "Webhook timed out after 30s",
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
