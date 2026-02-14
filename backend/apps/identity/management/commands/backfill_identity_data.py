"""
Backfill GlobalIdentity records with data from linked Guest records.

Fills in encrypted_email, encrypted_name, encrypted_phone, encrypted_nationality
from the most recent Guest linked to each identity.
"""
from django.core.management.base import BaseCommand

from apps.identity.models import GlobalIdentity, IdentityLink
from apps.identity.utils import encrypt_value


class Command(BaseCommand):
    help = "Backfill GlobalIdentity with phone/nationality/email/name from linked Guests"

    def handle(self, *args, **options):
        identities = GlobalIdentity.objects.all()
        updated = 0

        for identity in identities:
            # Get the most recent linked guest with data
            link = (
                IdentityLink.objects.filter(identity=identity)
                .select_related("guest")
                .order_by("-created_at")
                .first()
            )
            if not link or not link.guest:
                continue

            guest = link.guest
            update_fields = []

            if not identity.encrypted_email and guest.email:
                identity.encrypted_email = encrypt_value(guest.email)
                update_fields.append("encrypted_email")

            if not identity.encrypted_name and guest.full_name.strip():
                identity.encrypted_name = encrypt_value(guest.full_name)
                update_fields.append("encrypted_name")

            if not identity.encrypted_phone and guest.phone:
                identity.encrypted_phone = encrypt_value(guest.phone)
                update_fields.append("encrypted_phone")

            if not identity.encrypted_nationality and guest.nationality:
                identity.encrypted_nationality = encrypt_value(guest.nationality)
                update_fields.append("encrypted_nationality")

            if update_fields:
                identity.save(update_fields=update_fields)
                updated += 1
                self.stdout.write(f"  Updated {identity} — fields: {', '.join(update_fields)}")

        self.stdout.write(self.style.SUCCESS(f"Done. Updated {updated}/{identities.count()} identities."))
