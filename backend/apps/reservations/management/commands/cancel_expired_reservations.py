from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.reservations.models import Reservation


class Command(BaseCommand):
    help = "Cancela reservas pendientes cuyo plazo de pago expiró y no tienen voucher."

    def handle(self, *args, **options):
        now = timezone.now()
        expired = Reservation.objects.filter(
            operational_status=Reservation.OperationalStatus.INCOMPLETE,
            payment_deadline__lt=now,
            voucher_image="",
        )
        count = expired.count()
        expired.update(
            operational_status=Reservation.OperationalStatus.CANCELLED,
        )
        self.stdout.write(
            self.style.SUCCESS(f"{count} reserva(s) cancelada(s) por expiración.")
        )
