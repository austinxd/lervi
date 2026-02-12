import logging
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.billing.models import Invoice
from apps.billing.services.invoice_emitter import emit_invoice

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Retry invoices in error/rejected status with exponential backoff"

    def add_arguments(self, parser):
        parser.add_argument(
            "--max-retries",
            type=int,
            default=5,
            help="Maximum retry count per invoice (default: 5)",
        )
        parser.add_argument(
            "--batch-size",
            type=int,
            default=100,
            help="Maximum invoices to process per run (default: 100)",
        )

    def handle(self, *args, **options):
        max_retries = options["max_retries"]
        batch_size = options["batch_size"]
        now = timezone.now()

        invoices = (
            Invoice.objects
            .filter(
                status__in=["error", "rejected"],
                retry_count__lt=max_retries,
            )
            .order_by("last_attempt_at")
        )

        # Filter by individual backoff
        eligible = []
        for inv in invoices:
            backoff_minutes = min(2 ** inv.retry_count * 5, 60)
            if (
                not inv.last_attempt_at
                or inv.last_attempt_at + timedelta(minutes=backoff_minutes) <= now
            ):
                eligible.append(inv)
            if len(eligible) >= batch_size:
                break

        if not eligible:
            self.stdout.write("No invoices eligible for retry.")
            return

        self.stdout.write(f"Retrying {len(eligible)} invoices...")

        success_count = 0
        error_count = 0

        for invoice in eligible:
            self.stdout.write(
                f"  Retrying {invoice.numero_completo} "
                f"(attempt {invoice.retry_count + 1})...",
                ending="",
            )
            result = emit_invoice(invoice)
            if result["success"]:
                success_count += 1
                self.stdout.write(" OK")
            else:
                error_count += 1
                self.stdout.write(f" FAIL: {result.get('error', 'unknown')}")

        self.stdout.write(
            self.style.SUCCESS(
                f"Done. Success: {success_count}, Failed: {error_count}"
            )
        )
