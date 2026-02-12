import logging
import time

from django.db import transaction
from django.utils import timezone

from apps.billing.adapters import get_adapter
from apps.billing.constants import invoice_state_machine

from .config_resolver import resolve_billing_config

logger = logging.getLogger(__name__)


def emit_invoice(invoice, user=None):
    """
    Emit an invoice through the configured billing provider.

    NEVER raises — returns dict with success/error info.
    Triple safety net: emitter → action → dispatcher.
    """
    try:
        config = resolve_billing_config(invoice.property)
        if not config:
            return {"success": False, "error": "Billing disabled"}

        # Transition: draft/error/rejected → pending
        with transaction.atomic():
            invoice_state_machine.transition(
                invoice, "status", "pending", user=user,
            )

        adapter = get_adapter(config["proveedor"])
        if not adapter:
            _mark_error(invoice, f"No adapter for provider: {config['proveedor']}", user)
            return {"success": False, "error": f"No adapter for provider: {config['proveedor']}"}

        payload = adapter.build_payload(invoice, config)

        # Save request + transition → sent
        with transaction.atomic():
            invoice.provider_request = payload
            invoice.save(update_fields=["provider_request", "updated_at"])
            invoice_state_machine.transition(
                invoice, "status", "sent", user=user,
            )

        # Call provider (with timing)
        start = time.monotonic()
        result = adapter.send(payload, config)
        latency = int((time.monotonic() - start) * 1000)

        # Save response + final transition
        with transaction.atomic():
            invoice.provider_response = result.get("raw_response", {})
            invoice.provider_http_status = result.get("http_status")
            invoice.provider_latency_ms = latency
            invoice.provider_error_code = result.get("error_code", "")
            invoice.last_attempt_at = timezone.now()
            invoice.retry_count += 1

            if result["success"]:
                invoice.sunat_ticket = result.get("ticket", "")
                invoice.provider_document_url = result.get("document_url", "")
                invoice.save(update_fields=[
                    "provider_response", "provider_http_status",
                    "provider_latency_ms", "provider_error_code",
                    "sunat_ticket", "provider_document_url",
                    "last_attempt_at", "retry_count", "updated_at",
                ])
                invoice_state_machine.transition(
                    invoice, "status", "accepted", user=user,
                )
            else:
                invoice.last_error = result.get("error", "")
                invoice.save(update_fields=[
                    "provider_response", "provider_http_status",
                    "provider_latency_ms", "provider_error_code",
                    "last_error", "last_attempt_at", "retry_count",
                    "updated_at",
                ])
                new_status = "rejected" if result.get("rejected") else "error"
                invoice_state_machine.transition(
                    invoice, "status", new_status, user=user,
                )

        return {"success": result["success"], "invoice_id": str(invoice.id)}

    except Exception as e:
        logger.exception(f"emit_invoice failed for invoice {invoice.id}: {e}")
        _mark_error(invoice, str(e), user)
        return {"success": False, "error": str(e)}


def _mark_error(invoice, error_message, user):
    """
    Mark invoice as error. Never degrades an accepted invoice.
    """
    try:
        invoice.refresh_from_db(fields=["status"])
        if invoice.status == "accepted":
            return

        with transaction.atomic():
            invoice.last_error = error_message
            invoice.last_attempt_at = timezone.now()
            invoice.retry_count += 1
            invoice.save(update_fields=[
                "last_error", "last_attempt_at", "retry_count", "updated_at",
            ])
            if invoice.status in ("pending", "sent"):
                invoice_state_machine.transition(
                    invoice, "status", "error", user=user,
                )
    except Exception:
        logger.exception(f"Failed to mark invoice {invoice.id} as error")
