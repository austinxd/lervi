#!/usr/bin/env python
"""
Seed script to populate Hotel Arena Blanca with complete demo data.
Run: cd backend && source venv/bin/activate && python seed_templates_data.py
"""
import os
import sys
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

# Add the backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

django.setup()

from apps.organizations.models import Property
from apps.rooms.models import RoomType


def seed():
    try:
        prop = Property.objects.get(slug="hotel-arena-blanca")
    except Property.DoesNotExist:
        print("Property 'hotel-arena-blanca' not found. Skipping.")
        return

    # --- Property updates ---
    prop.latitude = -12.1196
    prop.longitude = -77.0310
    prop.address = "Av. José Larco 820, Miraflores"
    prop.city = "Lima"
    prop.country = "PE"
    prop.tagline = "Tu refugio frente al mar en el corazón de Miraflores"
    prop.description = (
        "Hotel Arena Blanca es un hotel boutique de 4 estrellas ubicado en el "
        "corazón de Miraflores, a pocos pasos del malecón y las mejores opciones "
        "gastronómicas de Lima. Con una arquitectura que fusiona lo contemporáneo "
        "con la calidez peruana, ofrecemos 42 habitaciones diseñadas para el "
        "descanso y la inspiración.\n\n"
        "Nuestro compromiso es brindar una experiencia auténtica: desayunos con "
        "productos locales, un rooftop con vista al Pacífico, y un equipo que "
        "conoce cada rincón de la ciudad para hacer de su estadía algo memorable."
    )
    prop.contact_phone = "+51 1 234 5678"
    prop.contact_email = "reservas@hotelarena.pe"
    prop.whatsapp = "+51987654321"
    prop.stars = 4
    prop.policies = {
        "cancellation": "Cancelación gratuita hasta 48 horas antes del check-in. Después se cobra la primera noche.",
        "pets": "No se admiten mascotas.",
        "smoking": "Hotel 100% libre de humo. Áreas de fumadores en terraza.",
        "children": "Niños de todas las edades son bienvenidos. Cunas disponibles bajo solicitud.",
        "check_in_early": "Sujeto a disponibilidad, sin cargo adicional.",
        "check_out_late": "Disponible hasta las 14:00 con cargo de 50% de la tarifa.",
    }
    prop.amenities = [
        "Wi-Fi gratuito",
        "Piscina en rooftop",
        "Restaurante",
        "Bar",
        "Gimnasio",
        "Estacionamiento",
        "Room service 24h",
        "Lavandería",
        "Concierge",
        "Centro de negocios",
        "Spa",
        "Terraza panorámica",
    ]
    prop.payment_methods = ["Visa", "Mastercard", "Efectivo", "Transferencia", "Yape"]
    prop.languages = ["Español", "English", "Português"]
    prop.social_links = {
        "instagram": "https://instagram.com/hotelarena",
        "facebook": "https://facebook.com/hotelarena",
        "tripadvisor": "https://tripadvisor.com/hotelarena",
        "google_maps": "https://maps.google.com/?q=-12.1196,-77.0310",
    }
    prop.save()
    print(f"Updated property: {prop.name}")

    # --- Room Type data ---
    room_data = {
        "Queen Personal": {
            "description": (
                "Habitación acogedora y funcional con cama Queen, ideal para "
                "viajeros individuales que buscan comodidad y buen precio. "
                "Diseño contemporáneo con acabados en madera y textiles peruanos."
            ),
            "size_sqm": 18,
            "view_type": "city",
            "bathroom_type": "private_shower",
            "highlights": ["Cama Queen", "Smart TV 43\"", "Minibar", "Caja fuerte"],
            "amenities": [
                "Wi-Fi", "TV cable", "Aire acondicionado", "Minibar",
                "Secador de pelo", "Caja fuerte", "Amenities de baño",
            ],
        },
        "Queen Matrimonial": {
            "description": (
                "Perfecta para parejas, esta habitación con cama Queen matrimonial "
                "ofrece un ambiente íntimo y relajante. Con iluminación cálida "
                "y detalles pensados para una estadía romántica."
            ),
            "size_sqm": 22,
            "view_type": "city",
            "bathroom_type": "private_shower",
            "highlights": ["Cama Queen", "Iluminación ambiental", "Smart TV 43\"", "Minibar"],
            "amenities": [
                "Wi-Fi", "TV cable", "Aire acondicionado", "Minibar",
                "Secador de pelo", "Caja fuerte", "Amenities de baño",
                "Bata y pantuflas",
            ],
        },
        "King Personal": {
            "description": (
                "Espaciosa habitación con cama King para el viajero que valora "
                "su espacio. Área de trabajo dedicada y vista a la ciudad. "
                "Ideal para estadías extendidas o viajeros de negocios."
            ),
            "size_sqm": 25,
            "view_type": "city",
            "bathroom_type": "private_shower",
            "highlights": ["Cama King", "Escritorio ejecutivo", "Smart TV 50\"", "Vista ciudad"],
            "amenities": [
                "Wi-Fi", "TV cable", "Aire acondicionado", "Minibar",
                "Secador de pelo", "Caja fuerte", "Amenities premium",
                "Escritorio", "Bata y pantuflas",
            ],
        },
        "King Matrimonial": {
            "description": (
                "Nuestra habitación King Matrimonial combina amplitud y elegancia. "
                "Cama King extra confortable, vista parcial al océano y acabados "
                "de primera que hacen de cada momento un placer."
            ),
            "size_sqm": 30,
            "view_type": "ocean",
            "bathroom_type": "private_tub",
            "highlights": ["Cama King", "Vista al mar", "Bañera", "Balcón privado"],
            "amenities": [
                "Wi-Fi", "TV cable", "Aire acondicionado", "Minibar premium",
                "Secador de pelo", "Caja fuerte", "Amenities L'Occitane",
                "Escritorio", "Bata y pantuflas", "Máquina Nespresso",
                "Balcón",
            ],
        },
        "Doble": {
            "description": (
                "Habitación con dos camas individuales, perfecta para amigos "
                "o compañeros de viaje. Amplia y luminosa, con todo lo necesario "
                "para una estadía confortable."
            ),
            "size_sqm": 26,
            "view_type": "city",
            "bathroom_type": "private_shower",
            "highlights": ["2 camas individuales", "Smart TV 43\"", "Minibar", "Escritorio"],
            "amenities": [
                "Wi-Fi", "TV cable", "Aire acondicionado", "Minibar",
                "Secador de pelo", "Caja fuerte", "Amenities de baño",
                "Escritorio",
            ],
        },
        "Triple": {
            "description": (
                "Espaciosa habitación para tres huéspedes con configuración "
                "flexible de camas. Ideal para familias pequeñas o grupos "
                "de amigos que buscan compartir sin sacrificar comodidad."
            ),
            "size_sqm": 32,
            "view_type": "garden",
            "bathroom_type": "private_shower",
            "highlights": ["3 camas o 1 King + 1 individual", "Smart TV 50\"", "Vista jardín", "Espacio amplio"],
            "amenities": [
                "Wi-Fi", "TV cable", "Aire acondicionado", "Minibar",
                "Secador de pelo", "Caja fuerte", "Amenities de baño",
                "Escritorio", "Espejo de cuerpo completo",
            ],
        },
    }

    updated = 0
    for rt in RoomType.objects.filter(property=prop):
        if rt.name in room_data:
            data = room_data[rt.name]
            rt.description = data["description"]
            rt.size_sqm = data["size_sqm"]
            rt.view_type = data["view_type"]
            rt.bathroom_type = data["bathroom_type"]
            rt.highlights = data["highlights"]
            rt.amenities = data["amenities"]
            rt.save()
            updated += 1
            print(f"  Updated room type: {rt.name}")

    print(f"\nDone. Updated {updated} room types.")


if __name__ == "__main__":
    seed()
