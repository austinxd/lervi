from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path("auth/", include("apps.users.urls_auth")),
    path("users/", include("apps.users.urls")),
    path("organization/", include("apps.organizations.urls_org")),
    path("properties/", include("apps.organizations.urls_property")),
    path("room-types/", include("apps.rooms.urls_room_types")),
    path("rooms/", include("apps.rooms.urls_rooms")),
    path("guests/", include("apps.guests.urls")),
    path("reservations/", include("apps.reservations.urls")),
    path("billing/", include("apps.billing.urls")),
    path("tasks/", include("apps.tasks.urls")),
    path("pricing/", include("apps.pricing.urls")),
    path("automations/", include("apps.automations.urls")),
    path("dashboard/", include("apps.dashboard.urls")),
    path("public/", include("apps.public.urls")),
    # OpenAPI
    path("schema/", SpectacularAPIView.as_view(), name="schema"),
    path("docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
]
