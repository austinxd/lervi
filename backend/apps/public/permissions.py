import jwt
from django.conf import settings
from rest_framework.permissions import BasePermission

from apps.guests.models import Guest


class IsAuthenticatedGuest(BasePermission):
    """Validates JWT issued to a guest and attaches request.guest."""

    def has_permission(self, request, view):
        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            return False

        token = auth.split(" ", 1)[1]
        try:
            payload = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=["HS256"],
            )
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
            return False

        guest_id = payload.get("guest_id")
        if not guest_id:
            return False

        try:
            request.guest = Guest.objects.get(id=guest_id)
        except Guest.DoesNotExist:
            return False

        return True
