import logging

import requests
from django.conf import settings
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.common.mixins import TenantQuerySetMixin

from .models import Guest, GuestNote
from .serializers import GuestListSerializer, GuestNoteSerializer, GuestSerializer

logger = logging.getLogger(__name__)


class ReniecLookupView(generics.GenericAPIView):
    """Proxy para consulta RENIEC. Solo usuarios autenticados."""

    def get(self, request):
        dni = request.query_params.get("dni", "")
        if not dni.isdigit() or len(dni) != 8:
            return Response(
                {"detail": "El DNI debe tener exactamente 8 dígitos."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        api_key = settings.RENIEC_API_KEY
        base_url = settings.RENIEC_API_URL  # e.g. https://api.casaaustin.pe/api/v1/reniec/lookup/

        try:
            # Si hay API key, intentar endpoint con key (mayor rate limit)
            if api_key:
                resp = requests.post(
                    base_url,
                    json={"dni": dni},
                    headers={"X-API-Key": api_key, "Content-Type": "application/json"},
                    timeout=10,
                )
                if resp.status_code != 401:
                    resp.raise_for_status()
                    return Response(resp.json())
                logger.info("RENIEC API key rejected, falling back to public endpoint")

            # Fallback: endpoint público (rate limited)
            resp = requests.get(
                f"{base_url}public/",
                params={"dni": dni},
                timeout=10,
            )
            resp.raise_for_status()
            return Response(resp.json())
        except requests.RequestException as exc:
            logger.warning("RENIEC lookup failed for DNI %s: %s", dni, exc)
            return Response(
                {"detail": "No se pudo consultar RENIEC."},
                status=status.HTTP_502_BAD_GATEWAY,
            )


class GuestViewSet(TenantQuerySetMixin, viewsets.ModelViewSet):
    serializer_class = GuestSerializer
    queryset = Guest.objects.all()
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]
    search_fields = ["first_name", "last_name", "email", "document_number"]
    filterset_fields = ["is_vip"]

    def get_serializer_class(self):
        if self.action == "list":
            return GuestListSerializer
        return GuestSerializer

    # --- Nested: Notes ---
    @action(detail=True, methods=["get", "post"], url_path="notes")
    def notes(self, request, pk=None):
        guest = self.get_object()
        if request.method == "GET":
            notes = guest.notes.all()
            serializer = GuestNoteSerializer(notes, many=True)
            return Response(serializer.data)
        serializer = GuestNoteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(
            guest=guest,
            organization=request.organization,
            created_by=request.user,
        )
        return Response(serializer.data, status=status.HTTP_201_CREATED)
