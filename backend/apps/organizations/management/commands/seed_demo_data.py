"""
Seed completo de datos demo para un hotel funcionando.
Crea tipos de habitación, habitaciones, huéspedes, reservaciones
en distintos estados, pagos, tareas, pricing y usuarios adicionales.
"""
import random
from datetime import date, timedelta, time
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.organizations.models import Organization, Property
from apps.users.models import User
from apps.rooms.models import RoomType, BedConfiguration, BedConfigurationDetail, Room
from apps.guests.models import Guest, GuestNote
from apps.reservations.models import Reservation, Payment
from apps.tasks.models import Task
from apps.pricing.models import Season, DayOfWeekPricing, RatePlan, Promotion


class Command(BaseCommand):
    help = "Llena la base de datos con datos demo realistas para un hotel funcionando"

    def handle(self, *args, **options):
        org = Organization.objects.filter(subdomain="demo").first()
        if not org:
            self.stderr.write("Ejecuta primero: python manage.py create_initial_org")
            return

        prop = Property.objects.filter(organization=org).first()
        owner = User.objects.filter(email="owner@hoteldemo.pe").first()

        self.stdout.write("Creando usuarios adicionales...")
        users = self._create_users(org, prop)

        self.stdout.write("Creando tipos de habitación...")
        room_types = self._create_room_types(prop)

        self.stdout.write("Creando habitaciones...")
        rooms = self._create_rooms(prop, room_types)

        self.stdout.write("Creando huéspedes...")
        guests = self._create_guests(org)

        self.stdout.write("Creando pricing...")
        self._create_pricing(prop, room_types)

        self.stdout.write("Creando reservaciones y pagos...")
        self._create_reservations(org, prop, room_types, rooms, guests)

        self.stdout.write("Creando tareas...")
        self._create_tasks(org, prop, rooms, users)

        self.stdout.write(self.style.SUCCESS(
            "\nSeed completo! El hotel está listo para funcionar."
        ))

    def _create_users(self, org, prop):
        users = {}
        staff = [
            ("recepcion@hoteldemo.pe", "María", "García", "reception"),
            ("housekeeping@hoteldemo.pe", "Carmen", "López", "housekeeping"),
            ("manager@hoteldemo.pe", "Carlos", "Mendoza", "manager"),
            ("mantenimiento@hoteldemo.pe", "Jorge", "Quispe", "maintenance"),
        ]
        for email, first, last, role in staff:
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "first_name": first,
                    "last_name": last,
                    "role": role,
                    "organization": org,
                },
            )
            if created:
                user.set_password("staff1234")
                user.save()
                user.properties.add(prop)
                self.stdout.write(f"  + {role}: {email}")
            users[role] = user
        return users

    def _create_room_types(self, prop):
        types_data = [
            {
                "name": "Individual Estándar",
                "slug": "individual-estandar",
                "description": "Habitación cómoda para una persona con baño privado, escritorio de trabajo y WiFi de alta velocidad.",
                "max_adults": 1, "max_children": 0,
                "base_price": Decimal("120.00"),
                "amenities": ["WiFi", "TV", "Baño privado", "Escritorio", "Aire acondicionado"],
                "beds": [("Estándar", [("single", 1)])],
            },
            {
                "name": "Doble Superior",
                "slug": "doble-superior",
                "description": "Amplia habitación con vista a la ciudad, ideal para parejas. Incluye minibar y servicio de habitación.",
                "max_adults": 2, "max_children": 1,
                "base_price": Decimal("220.00"),
                "amenities": ["WiFi", "TV 55\"", "Minibar", "Baño privado", "Vista ciudad", "Aire acondicionado", "Caja fuerte"],
                "beds": [
                    ("Cama queen", [("queen", 1)]),
                    ("Dos singles", [("single", 2)]),
                ],
            },
            {
                "name": "Suite Junior",
                "slug": "suite-junior",
                "description": "Suite elegante con sala de estar separada, bañera de hidromasaje y balcón privado con vista panorámica.",
                "max_adults": 2, "max_children": 2,
                "base_price": Decimal("380.00"),
                "amenities": ["WiFi", "TV 65\"", "Minibar premium", "Hidromasaje", "Balcón", "Sala de estar", "Room service 24h", "Aire acondicionado"],
                "beds": [("King", [("king", 1)])],
            },
            {
                "name": "Familiar",
                "slug": "familiar",
                "description": "Espaciosa habitación familiar con zona de juegos para niños, dos ambientes y cocina básica.",
                "max_adults": 2, "max_children": 3,
                "base_price": Decimal("300.00"),
                "amenities": ["WiFi", "TV", "Cocina básica", "Microondas", "Zona juegos", "2 Baños", "Aire acondicionado"],
                "beds": [
                    ("King + literas", [("king", 1), ("bunk", 1)]),
                    ("2 Queens", [("queen", 2)]),
                ],
            },
        ]

        room_types = {}
        for td in types_data:
            beds_data = td.pop("beds")
            rt, created = RoomType.objects.get_or_create(
                property=prop, slug=td["slug"],
                defaults=td,
            )
            if created:
                for bed_name, details in beds_data:
                    bc = BedConfiguration.objects.create(room_type=rt, name=bed_name)
                    for bed_type, qty in details:
                        BedConfigurationDetail.objects.create(
                            bed_configuration=bc, bed_type=bed_type, quantity=qty,
                        )
                self.stdout.write(f"  + {rt.name} — S/.{rt.base_price}")
            room_types[td["slug"]] = rt
        return room_types

    def _create_rooms(self, prop, room_types):
        rooms_data = [
            # Piso 1 — Individuales
            ("101", "1", "individual-estandar"),
            ("102", "1", "individual-estandar"),
            ("103", "1", "individual-estandar"),
            ("104", "1", "doble-superior"),
            ("105", "1", "doble-superior"),
            # Piso 2 — Dobles y Familiares
            ("201", "2", "doble-superior"),
            ("202", "2", "doble-superior"),
            ("203", "2", "doble-superior"),
            ("204", "2", "familiar"),
            ("205", "2", "familiar"),
            # Piso 3 — Suites y Premium
            ("301", "3", "suite-junior"),
            ("302", "3", "suite-junior"),
            ("303", "3", "doble-superior"),
            ("304", "3", "familiar"),
            ("305", "3", "suite-junior"),
        ]

        rooms = []
        for number, floor, type_slug in rooms_data:
            room, created = Room.objects.get_or_create(
                property=prop, number=number,
                defaults={
                    "floor": floor,
                    "room_type": room_types[type_slug],
                    "status": "available",
                },
            )
            if created:
                self.stdout.write(f"  + Hab {number} (Piso {floor}) — {room_types[type_slug].name}")
            rooms.append(room)
        return rooms

    def _create_guests(self, org):
        guests_data = [
            ("Juan", "Pérez", "juan.perez@gmail.com", "+51 999 111 001", "DNI", "45678901", "Peruana", False),
            ("Ana", "Rodríguez", "ana.rodriguez@hotmail.com", "+51 999 111 002", "DNI", "32165498", "Peruana", True),
            ("Roberto", "Smith", "r.smith@gmail.com", "+1 555 123 4567", "PASSPORT", "US12345678", "Estadounidense", False),
            ("María", "Fernández", "maria.fernandez@yahoo.com", "+51 999 111 004", "DNI", "78945612", "Peruana", False),
            ("Carlos", "Tanaka", "c.tanaka@outlook.com", "+81 90 1234 5678", "PASSPORT", "JP98765432", "Japonesa", True),
            ("Lucía", "García", "lucia.g@gmail.com", "+51 999 111 006", "DNI", "15935748", "Peruana", False),
            ("Pedro", "Martínez", "pedro.m@gmail.com", "+51 999 111 007", "DNI", "35795148", "Peruana", False),
            ("Sofía", "Weber", "sofia.weber@web.de", "+49 170 1234567", "PASSPORT", "DE55667788", "Alemana", False),
            ("Diego", "Torres", "diego.torres@gmail.com", "+54 11 5555 0001", "PASSPORT", "AR11223344", "Argentina", False),
            ("Valentina", "López", "vale.lopez@gmail.com", "+51 999 111 010", "CE", "CE-20230045", "Colombiana", False),
            ("Fernando", "Huamán", "f.huaman@outlook.com", "+51 999 111 011", "DNI", "48261537", "Peruana", False),
            ("Camila", "Ríos", "camila.rios@gmail.com", "+56 9 8765 4321", "PASSPORT", "CL99887766", "Chilena", True),
        ]

        guests = []
        for first, last, email, phone, doc_type, doc_num, nationality, vip in guests_data:
            guest, created = Guest.objects.get_or_create(
                organization=org,
                email=email,
                defaults={
                    "first_name": first, "last_name": last,
                    "phone": phone, "document_type": doc_type,
                    "document_number": doc_num, "nationality": nationality,
                    "is_vip": vip,
                },
            )
            if created:
                vip_tag = " ⭐ VIP" if vip else ""
                self.stdout.write(f"  + {first} {last} ({nationality}){vip_tag}")
                if vip:
                    GuestNote.objects.create(
                        organization=org, guest=guest,
                        content="Huésped frecuente y VIP. Ofrecer upgrade cuando esté disponible.",
                    )
            guests.append(guest)
        return guests

    def _create_pricing(self, prop, room_types):
        today = date.today()

        # Temporadas
        seasons = [
            ("Temporada Alta Verano", today.replace(month=1, day=1), today.replace(month=3, day=31), Decimal("1.30")),
            ("Fiestas Patrias", today.replace(month=7, day=15), today.replace(month=7, day=31), Decimal("1.40")),
            ("Temporada Baja", today.replace(month=5, day=1), today.replace(month=6, day=30), Decimal("0.85")),
            ("Navidad y Año Nuevo", today.replace(month=12, day=20), today.replace(month=12, day=31), Decimal("1.50")),
        ]
        for name, start, end, mod in seasons:
            _, created = Season.objects.get_or_create(
                property=prop, name=name,
                defaults={"start_date": start, "end_date": end, "price_modifier": mod},
            )
            if created:
                self.stdout.write(f"  + Temporada: {name} ({mod}x)")

        # Día de semana
        weekend_mod = [
            (0, Decimal("1.00")),  # Lunes
            (1, Decimal("1.00")),  # Martes
            (2, Decimal("1.00")),  # Miércoles
            (3, Decimal("1.05")),  # Jueves
            (4, Decimal("1.15")),  # Viernes
            (5, Decimal("1.25")),  # Sábado
            (6, Decimal("1.10")),  # Domingo
        ]
        for day, mod in weekend_mod:
            _, created = DayOfWeekPricing.objects.get_or_create(
                property=prop, day_of_week=day,
                defaults={"price_modifier": mod},
            )
        self.stdout.write("  + Precios por día de semana configurados")

        # Rate Plans
        for slug, rt in room_types.items():
            RatePlan.objects.get_or_create(
                property=prop, room_type=rt, name=f"No reembolsable — {rt.name}",
                defaults={
                    "plan_type": "non_refundable", "price_modifier": Decimal("0.85"),
                    "min_nights": 1, "min_advance_days": 0,
                },
            )
            RatePlan.objects.get_or_create(
                property=prop, room_type=rt, name=f"Early bird — {rt.name}",
                defaults={
                    "plan_type": "early_bird", "price_modifier": Decimal("0.90"),
                    "min_nights": 2, "min_advance_days": 14,
                },
            )
        self.stdout.write("  + Planes de tarifa creados")

        # Promociones
        promos = [
            ("Larga estadía", "LARGA5", Decimal("10"), Decimal("0"), 5),
            ("Bienvenida web", "WEB15", Decimal("15"), Decimal("0"), 1),
            ("Descuento corporativo", "CORP20", Decimal("0"), Decimal("50"), 1),
        ]
        for name, code, pct, fixed, min_nights in promos:
            Promotion.objects.get_or_create(
                property=prop, code=code,
                defaults={
                    "name": name, "discount_percent": pct, "discount_fixed": fixed,
                    "start_date": today - timedelta(days=30),
                    "end_date": today + timedelta(days=180),
                    "min_nights": min_nights,
                },
            )
        self.stdout.write("  + Promociones creadas")

    def _create_reservations(self, org, prop, room_types, rooms, guests):
        today = date.today()
        now = timezone.now()
        rt_list = list(room_types.values())

        # Helper para crear reserva + pago
        def make_reservation(guest, rt, room, ci, co, op_status, fin_status, origin, amount, payments=None):
            res = Reservation.objects.create(
                organization=org, guest=guest, property=prop,
                room_type=rt, room=room,
                check_in_date=ci, check_out_date=co,
                adults=random.randint(1, rt.max_adults),
                children=random.randint(0, rt.max_children),
                total_amount=amount, currency="PEN",
                operational_status=op_status,
                financial_status=fin_status,
                origin_type=origin,
            )
            for pmt in (payments or []):
                Payment.objects.create(
                    organization=org, reservation=res,
                    amount=pmt["amount"], currency="PEN",
                    method=pmt["method"], status=pmt["status"],
                    notes=pmt.get("notes", ""),
                )
            return res

        # ── Checked-in (huéspedes actualmente en el hotel) ──
        r101 = self._get_room(rooms, "101")
        r201 = self._get_room(rooms, "201")
        r301 = self._get_room(rooms, "301")
        r204 = self._get_room(rooms, "204")

        make_reservation(
            guests[0], room_types["individual-estandar"], r101,
            today - timedelta(days=2), today + timedelta(days=1),
            "check_in", "paid", "website", Decimal("360.00"),
            [{"amount": Decimal("360.00"), "method": "card", "status": "completed"}],
        )
        r101.status = "occupied"; r101.save()

        make_reservation(
            guests[1], room_types["doble-superior"], r201,
            today - timedelta(days=1), today + timedelta(days=3),
            "check_in", "partial", "walk_in", Decimal("880.00"),
            [{"amount": Decimal("500.00"), "method": "cash", "status": "completed", "notes": "Adelanto al check-in"}],
        )
        r201.status = "occupied"; r201.save()

        make_reservation(
            guests[4], room_types["suite-junior"], r301,
            today - timedelta(days=3), today + timedelta(days=2),
            "check_in", "paid", "ota", Decimal("1900.00"),
            [{"amount": Decimal("1900.00"), "method": "online", "status": "completed", "notes": "Pago via Booking.com"}],
        )
        r301.status = "occupied"; r301.save()

        make_reservation(
            guests[8], room_types["familiar"], r204,
            today, today + timedelta(days=4),
            "check_in", "partial", "phone", Decimal("1200.00"),
            [{"amount": Decimal("600.00"), "method": "transfer", "status": "completed"}],
        )
        r204.status = "occupied"; r204.save()

        self.stdout.write("  + 4 reservaciones checked-in (huéspedes en hotel)")

        # ── Confirmed (llegadas próximas) ──
        make_reservation(
            guests[2], room_types["doble-superior"], None,
            today + timedelta(days=1), today + timedelta(days=4),
            "confirmed", "pending_payment", "website", Decimal("660.00"),
        )
        make_reservation(
            guests[5], room_types["individual-estandar"], None,
            today + timedelta(days=2), today + timedelta(days=5),
            "confirmed", "paid", "website", Decimal("360.00"),
            [{"amount": Decimal("360.00"), "method": "online", "status": "completed", "notes": "Pago anticipado web"}],
        )
        make_reservation(
            guests[7], room_types["suite-junior"], None,
            today + timedelta(days=3), today + timedelta(days=7),
            "confirmed", "pending_payment", "ota", Decimal("1520.00"),
        )
        self.stdout.write("  + 3 reservaciones confirmadas (próximas llegadas)")

        # ── Pending (sin confirmar) ──
        make_reservation(
            guests[9], room_types["doble-superior"], None,
            today + timedelta(days=5), today + timedelta(days=8),
            "pending", "pending_payment", "website", Decimal("660.00"),
        )
        make_reservation(
            guests[10], room_types["familiar"], None,
            today + timedelta(days=7), today + timedelta(days=10),
            "pending", "pending_payment", "phone", Decimal("900.00"),
        )
        self.stdout.write("  + 2 reservaciones pendientes")

        # ── Checked-out (completadas recientes) ──
        r102 = self._get_room(rooms, "102")
        r202 = self._get_room(rooms, "202")
        r302 = self._get_room(rooms, "302")

        make_reservation(
            guests[3], room_types["individual-estandar"], r102,
            today - timedelta(days=5), today - timedelta(days=2),
            "check_out", "paid", "walk_in", Decimal("360.00"),
            [{"amount": Decimal("360.00"), "method": "cash", "status": "completed"}],
        )
        r102.status = "dirty"; r102.save()

        make_reservation(
            guests[6], room_types["doble-superior"], r202,
            today - timedelta(days=4), today - timedelta(days=1),
            "check_out", "paid", "ota", Decimal("660.00"),
            [
                {"amount": Decimal("330.00"), "method": "online", "status": "completed", "notes": "Pago OTA"},
                {"amount": Decimal("330.00"), "method": "card", "status": "completed", "notes": "Saldo en check-out"},
            ],
        )
        r202.status = "cleaning"; r202.save()

        make_reservation(
            guests[11], room_types["suite-junior"], r302,
            today - timedelta(days=3), today,
            "check_out", "paid", "website", Decimal("1140.00"),
            [{"amount": Decimal("1140.00"), "method": "card", "status": "completed"}],
        )
        r302.status = "inspection"; r302.save()

        self.stdout.write("  + 3 reservaciones checked-out")

        # ── Cancelled ──
        make_reservation(
            guests[9], room_types["doble-superior"], None,
            today + timedelta(days=10), today + timedelta(days=13),
            "cancelled", "pending_payment", "website", Decimal("660.00"),
        )
        self.stdout.write("  + 1 reservación cancelada")

        # ── No-show ──
        make_reservation(
            guests[10], room_types["individual-estandar"], None,
            today - timedelta(days=1), today + timedelta(days=2),
            "no_show", "pending_payment", "phone", Decimal("360.00"),
        )
        self.stdout.write("  + 1 reservación no-show")

        # Algunas habitaciones en mantenimiento/blocked
        r105 = self._get_room(rooms, "105")
        r105.status = "maintenance"; r105.save()

        r305 = self._get_room(rooms, "305")
        r305.status = "blocked"; r305.save()

        self.stdout.write("  + Habitaciones 105 (mantenimiento) y 305 (bloqueada)")

    def _create_tasks(self, org, prop, rooms, users):
        now = timezone.now()

        tasks_data = [
            # Pendientes
            {
                "task_type": "cleaning", "room": self._get_room(rooms, "102"),
                "assigned_role": "housekeeping", "priority": "high",
                "status": "pending", "notes": "Check-out reciente. Limpieza profunda.",
            },
            {
                "task_type": "cleaning", "room": self._get_room(rooms, "202"),
                "assigned_role": "housekeeping", "priority": "normal",
                "status": "in_progress", "notes": "En proceso de limpieza.",
            },
            {
                "task_type": "inspection", "room": self._get_room(rooms, "302"),
                "assigned_role": "housekeeping", "priority": "normal",
                "status": "pending", "notes": "Inspeccionar después de check-out VIP.",
            },
            {
                "task_type": "maintenance", "room": self._get_room(rooms, "105"),
                "assigned_role": "maintenance", "priority": "urgent",
                "status": "in_progress", "notes": "Fuga de agua en baño. Plomero en camino.",
                "due_date": now + timedelta(hours=4),
            },
            {
                "task_type": "bed_prep", "room": self._get_room(rooms, "203"),
                "assigned_role": "housekeeping", "priority": "normal",
                "status": "pending", "notes": "Preparar configuración de 2 camas singles para llegada mañana.",
                "due_date": now + timedelta(days=1),
            },
            {
                "task_type": "maintenance", "room": self._get_room(rooms, "303"),
                "assigned_role": "maintenance", "priority": "normal",
                "status": "pending", "notes": "Revisar aire acondicionado, huésped reportó ruido.",
                "due_date": now + timedelta(days=1),
            },
            # Completadas hoy
            {
                "task_type": "cleaning", "room": self._get_room(rooms, "103"),
                "assigned_role": "housekeeping", "priority": "normal",
                "status": "completed", "notes": "Limpieza de rutina.",
                "result": "Completada sin novedad.",
                "completed_at": now - timedelta(hours=2),
            },
            {
                "task_type": "inspection", "room": self._get_room(rooms, "103"),
                "assigned_role": "housekeeping", "priority": "normal",
                "status": "completed", "notes": "Inspección post-limpieza.",
                "result": "Habitación lista para nuevo huésped.",
                "completed_at": now - timedelta(hours=1),
            },
        ]

        for td in tasks_data:
            Task.objects.create(organization=org, property=prop, **td)

        self.stdout.write(f"  + {len(tasks_data)} tareas creadas (pendientes, en progreso, completadas)")

    def _get_room(self, rooms, number):
        return next((r for r in rooms if r.number == number), None)
