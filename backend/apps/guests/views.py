from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.common.mixins import TenantQuerySetMixin

from .models import Guest, GuestNote
from .serializers import GuestListSerializer, GuestNoteSerializer, GuestSerializer


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
