import logging
from datetime import datetime, timezone as tz

from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.guests.models import Guest
from apps.public.views import get_organization

from .models import EventLog
from .serializers import EventBatchSerializer

logger = logging.getLogger(__name__)


class EventIngestView(APIView):
    """Ingest a batch of tracking events for a hotel."""

    permission_classes = [AllowAny]
    throttle_scope = "events"

    def post(self, request, org_slug):
        org = get_organization(org_slug)
        serializer = EventBatchSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        events_data = serializer.validated_data["events"]
        objects = []

        for item in events_data:
            # Resolve guest if provided
            guest = None
            guest_id = item.get("guest_id", "")
            if guest_id:
                try:
                    guest = Guest.objects.get(id=guest_id, organization=org)
                except (Guest.DoesNotExist, ValueError):
                    pass

            # Convert timestamp (ms) to datetime
            try:
                ts = datetime.fromtimestamp(item["timestamp"] / 1000, tz=tz.utc)
            except (ValueError, OSError):
                ts = datetime.now(tz=tz.utc)

            objects.append(
                EventLog(
                    organization=org,
                    guest=guest,
                    session_id=item["session_id"],
                    event_name=item["event"],
                    metadata=item.get("metadata", {}),
                    created_at=ts,
                )
            )

        if objects:
            EventLog.objects.bulk_create(objects, ignore_conflicts=True)

        return Response({"accepted": len(objects)}, status=status.HTTP_202_ACCEPTED)
