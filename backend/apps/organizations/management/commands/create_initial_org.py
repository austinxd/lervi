from django.core.management.base import BaseCommand

from apps.organizations.models import Organization, Property
from apps.users.models import User


class Command(BaseCommand):
    help = "Crea una organización, propiedad y usuario owner de prueba"

    def handle(self, *args, **options):
        org, created = Organization.objects.get_or_create(
            subdomain="demo",
            defaults={
                "name": "Hotel Demo",
                "legal_name": "Hotel Demo S.A.C.",
                "tax_id": "20123456789",
                "timezone": "America/Lima",
                "currency": "PEN",
                "language": "es",
            },
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f"Organización creada: {org.name}"))
        else:
            self.stdout.write(f"Organización ya existe: {org.name}")

        prop, created = Property.objects.get_or_create(
            organization=org,
            slug="hotel-demo-lima",
            defaults={
                "name": "Hotel Demo Lima",
                "address": "Av. José Larco 101, Miraflores",
                "city": "Lima",
                "country": "PE",
                "check_in_time": "14:00",
                "check_out_time": "12:00",
                "contact_phone": "+51 1 234 5678",
                "contact_email": "recepcion@hoteldemo.pe",
            },
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f"Propiedad creada: {prop.name}"))
        else:
            self.stdout.write(f"Propiedad ya existe: {prop.name}")

        email = "owner@hoteldemo.pe"
        if not User.objects.filter(email=email).exists():
            user = User.objects.create_user(
                email=email,
                password="admin1234",
                first_name="Austin",
                last_name="Admin",
                role="owner",
                organization=org,
            )
            user.properties.add(prop)
            self.stdout.write(self.style.SUCCESS(f"Usuario owner creado: {email} / admin1234"))
        else:
            self.stdout.write(f"Usuario ya existe: {email}")

        self.stdout.write(self.style.SUCCESS("Setup completo."))
