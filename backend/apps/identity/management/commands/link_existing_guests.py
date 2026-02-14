from django.core.management.base import BaseCommand

from apps.guests.models import Guest
from apps.identity.services import create_identity_link, get_or_create_identity
from apps.identity.utils import normalize_document


class Command(BaseCommand):
    help = "Create GlobalIdentity + IdentityLink for existing guests with documents."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show what would be created without writing to DB.",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        guests = Guest.objects.filter(
            document_type__gt="",
            document_number__gt="",
        ).select_related("organization")

        total = guests.count()
        created_identities = 0
        created_links = 0
        skipped = 0

        self.stdout.write(f"Found {total} guests with documents.")

        for guest in guests.iterator():
            doc_number = normalize_document(guest.document_number)
            if not doc_number:
                skipped += 1
                continue

            if dry_run:
                self.stdout.write(
                    f"  [DRY-RUN] Would link {guest.document_type}:{doc_number} "
                    f"-> {guest.organization.name}"
                )
                created_links += 1
                continue

            identity = get_or_create_identity(
                document_type=guest.document_type,
                document_number=doc_number,
                email=guest.email,
                full_name=guest.full_name,
            )
            link = create_identity_link(identity, guest.organization, guest)
            if link:
                created_links += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Done. Links created: {created_links}, skipped: {skipped}."
            )
        )
