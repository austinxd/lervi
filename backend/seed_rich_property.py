"""
Seed script: Enrich Hotel Arena Blanca with rich content fields.
Run: cd backend && source venv/bin/activate && python seed_rich_property.py
"""
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.organizations.models import Property
from apps.rooms.models import RoomType

slug = "hotel-arena-blanca"

try:
    prop = Property.objects.get(slug=slug)
except Property.DoesNotExist:
    print(f"Property '{slug}' not found. Skipping.")
    exit(0)

# Update Property rich fields
prop.description = (
    "Ubicado frente a las playas mas hermosas del litoral, "
    "Hotel Arena Blanca ofrece una experiencia unica donde el confort se encuentra "
    "con la naturaleza. Nuestras instalaciones de primer nivel, combinadas con un "
    "servicio personalizado y calido, hacen de cada estadia un momento inolvidable.\n\n"
    "Contamos con habitaciones amplias y modernas, una piscina con vista al mar, "
    "restaurante con cocina local e internacional, y acceso directo a la playa."
)
prop.tagline = "Donde el lujo encuentra el mar"
prop.whatsapp = "+51 999 888 777"
org = prop.organization
org.website_url = "https://hotelarenablanca.pe"
org.social_links = {
    "instagram": "https://instagram.com/hotelarenablanca",
    "facebook": "https://facebook.com/hotelarenablanca",
    "tripadvisor": "https://tripadvisor.com/hotel-arena-blanca",
    "google_maps": "https://maps.google.com/?q=Hotel+Arena+Blanca",
}
org.save(update_fields=["website_url", "social_links", "updated_at"])
prop.amenities = [
    "Piscina",
    "WiFi gratuito",
    "Estacionamiento",
    "Restaurante",
    "Bar",
    "Room Service",
    "Acceso a la playa",
    "Gym",
    "Spa",
    "Lavanderia",
]
prop.payment_methods = [
    "Efectivo",
    "Visa",
    "Mastercard",
    "Yape",
    "Transferencia bancaria",
]
prop.languages = ["Espanol", "Ingles"]
prop.stars = 4
prop.save()
print(f"Updated Property: {prop.name}")

# Update RoomTypes
room_types_data = {
    # Match by name prefix
    "Suite": {
        "size_sqm": 45.0,
        "view_type": "ocean",
        "bathroom_type": "private_jacuzzi",
        "highlights": ["Vista al mar", "Jacuzzi privado", "Balcon privado", "Minibar incluido"],
    },
    "Doble": {
        "size_sqm": 28.0,
        "view_type": "garden",
        "bathroom_type": "private_shower",
        "highlights": ["Vista al jardin", "Cama king size"],
    },
    "Simple": {
        "size_sqm": 20.0,
        "view_type": "city",
        "bathroom_type": "private_shower",
        "highlights": ["Ideal para viajeros"],
    },
    "Familiar": {
        "size_sqm": 38.0,
        "view_type": "pool",
        "bathroom_type": "private_tub",
        "highlights": ["Ideal para familias", "Vista a la piscina", "2 ambientes"],
    },
}

for rt in RoomType.objects.filter(property=prop, is_active=True):
    for prefix, data in room_types_data.items():
        if rt.name.startswith(prefix) or prefix.lower() in rt.name.lower():
            rt.size_sqm = data["size_sqm"]
            rt.view_type = data["view_type"]
            rt.bathroom_type = data["bathroom_type"]
            rt.highlights = data["highlights"]
            rt.save()
            print(f"  Updated RoomType: {rt.name}")
            break

print("\nDone! All rich content fields have been populated.")
