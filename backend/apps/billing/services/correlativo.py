from django.db import transaction
from django.db.models import Max


def get_next_correlativo(organization, serie):
    """
    Get the next correlativo number for a given organization + serie.

    Uses SELECT FOR UPDATE to prevent race conditions. Each serie
    (B001, F001, etc.) has an independent sequence per organization.
    The unique_together on Invoice is the safety net.
    """
    from apps.billing.models import Invoice

    with transaction.atomic():
        last = (
            Invoice.objects
            .select_for_update()
            .filter(organization=organization, serie=serie)
            .aggregate(max_correlativo=Max("correlativo"))
        )
        return (last["max_correlativo"] or 0) + 1
