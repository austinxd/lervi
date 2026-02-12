from datetime import timedelta
from decimal import Decimal

from django.db.models import Count, Q, Sum
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.permissions import HasRolePermission
from apps.reservations.models import Payment, Reservation
from apps.rooms.models import Room, RoomType
from apps.tasks.models import Task


class TodayView(APIView):
    """
    GET /api/v1/dashboard/today/
    Summary of today's operations for the current organization.
    """

    def get(self, request):
        org = request.organization
        today = timezone.localdate()
        property_id = request.query_params.get("property")

        # --- Reservations ---
        res_qs = Reservation.objects.filter(organization=org)
        if property_id:
            res_qs = res_qs.filter(property_id=property_id)

        check_ins_today = res_qs.filter(
            check_in_date=today,
            operational_status__in=["confirmed", "check_in"],
        ).count()

        check_outs_today = res_qs.filter(
            check_out_date=today,
            operational_status__in=["check_in", "check_out"],
        ).count()

        in_house = res_qs.filter(operational_status="check_in").count()

        pending_reservations = res_qs.filter(
            operational_status="pending",
        ).count()

        # --- Rooms ---
        room_qs = Room.objects.filter(property__organization=org)
        if property_id:
            room_qs = room_qs.filter(property_id=property_id)

        total_rooms = room_qs.count()
        room_status_counts = dict(
            room_qs.values_list("status").annotate(count=Count("id")).values_list("status", "count")
        )

        # --- Tasks ---
        task_qs = Task.objects.filter(organization=org)
        if property_id:
            task_qs = task_qs.filter(property_id=property_id)

        tasks_pending = task_qs.filter(status="pending").count()
        tasks_in_progress = task_qs.filter(status="in_progress").count()
        tasks_completed_today = task_qs.filter(
            status="completed",
            completed_at__date=today,
        ).count()

        # --- Today's revenue ---
        payment_qs = Payment.objects.filter(
            organization=org,
            status="completed",
            processed_at__date=today,
        )
        if property_id:
            payment_qs = payment_qs.filter(reservation__property_id=property_id)

        revenue_today = payment_qs.aggregate(total=Sum("amount"))["total"] or Decimal("0")

        # --- Rooms readiness ---
        rooms_ready = room_status_counts.get("available", 0)
        rooms_not_ready = sum(
            room_status_counts.get(s, 0) for s in ("dirty", "cleaning", "inspection")
        )

        # --- Tasks by type & urgent ---
        active_tasks_qs = task_qs.filter(status__in=["pending", "in_progress"])
        tasks_by_type = dict(
            active_tasks_qs.values_list("task_type")
            .annotate(count=Count("id"))
            .values_list("task_type", "count")
        )
        tasks_urgent = active_tasks_qs.filter(priority__in=["high", "urgent"]).count()

        # --- Room type occupancy ---
        rt_qs = RoomType.objects.filter(property__organization=org, is_active=True)
        if property_id:
            rt_qs = rt_qs.filter(property_id=property_id)

        next_7 = today + timedelta(days=7)
        room_type_occupancy = []
        for rt in rt_qs:
            total_rt_rooms = Room.objects.filter(room_types=rt).count()
            if total_rt_rooms == 0:
                continue
            occupied = Reservation.objects.filter(
                room_type=rt,
                operational_status="check_in",
            ).count()
            upcoming_demand = Reservation.objects.filter(
                room_type=rt,
                operational_status__in=["pending", "confirmed"],
                check_in_date__gte=today,
                check_in_date__lt=next_7,
            ).count()
            rate = round(occupied / total_rt_rooms * 100, 1)
            room_type_occupancy.append({
                "id": str(rt.id),
                "name": rt.name,
                "total_rooms": total_rt_rooms,
                "occupied": occupied,
                "occupancy_rate": rate,
                "upcoming_demand": upcoming_demand,
            })
        room_type_occupancy.sort(key=lambda x: x["occupancy_rate"], reverse=True)

        # --- Alerts ---
        alerts = []
        overdue_checkins = res_qs.filter(
            check_in_date=today,
            operational_status="confirmed",
        ).count()
        if overdue_checkins:
            alerts.append({
                "type": "overdue_checkin",
                "severity": "warning",
                "message": f"{overdue_checkins} check-in(s) pendiente(s) de hoy",
                "count": overdue_checkins,
            })

        dirty_rooms = room_status_counts.get("dirty", 0)
        if dirty_rooms:
            alerts.append({
                "type": "dirty_rooms",
                "severity": "warning",
                "message": f"{dirty_rooms} habitacion(es) pendientes de limpieza",
                "count": dirty_rooms,
            })

        if tasks_urgent:
            alerts.append({
                "type": "urgent_tasks",
                "severity": "error",
                "message": f"{tasks_urgent} tarea(s) urgente(s)",
                "count": tasks_urgent,
            })

        tomorrow = today + timedelta(days=1)
        unconfirmed_tomorrow = res_qs.filter(
            check_in_date=tomorrow,
            operational_status="pending",
        ).count()
        if unconfirmed_tomorrow:
            alerts.append({
                "type": "unconfirmed_tomorrow",
                "severity": "info",
                "message": f"{unconfirmed_tomorrow} reserva(s) sin confirmar para manana",
                "count": unconfirmed_tomorrow,
            })

        return Response({
            "date": today.isoformat(),
            "reservations": {
                "check_ins_today": check_ins_today,
                "check_outs_today": check_outs_today,
                "in_house": in_house,
                "pending": pending_reservations,
            },
            "rooms": {
                "total": total_rooms,
                "by_status": room_status_counts,
                "ready": rooms_ready,
                "not_ready": rooms_not_ready,
            },
            "tasks": {
                "pending": tasks_pending,
                "in_progress": tasks_in_progress,
                "completed_today": tasks_completed_today,
                "by_type": tasks_by_type,
                "urgent": tasks_urgent,
            },
            "revenue_today": str(revenue_today),
            "room_type_occupancy": room_type_occupancy,
            "alerts": alerts,
        })


class OccupancyView(APIView):
    """
    GET /api/v1/dashboard/occupancy/
    Current and projected occupancy.
    Query params: property, days (default 7)
    """

    def get(self, request):
        org = request.organization
        today = timezone.localdate()
        property_id = request.query_params.get("property")
        days = int(request.query_params.get("days", 7))

        room_qs = Room.objects.filter(property__organization=org)
        if property_id:
            room_qs = room_qs.filter(property_id=property_id)
        total_rooms = room_qs.count()

        if total_rooms == 0:
            return Response({"total_rooms": 0, "current_occupancy": 0, "daily": []})

        # Current occupancy
        occupied_now = room_qs.filter(status="occupied").count()
        current_rate = round(occupied_now / total_rooms * 100, 1)

        # Projected occupancy for next N days
        res_qs = Reservation.objects.filter(
            organization=org,
            operational_status__in=["confirmed", "check_in"],
        )
        if property_id:
            res_qs = res_qs.filter(property_id=property_id)

        daily = []
        for i in range(days):
            date = today + timedelta(days=i)
            # Reservations that overlap this date
            occupied = res_qs.filter(
                check_in_date__lte=date,
                check_out_date__gt=date,
            ).count()
            rate = round(occupied / total_rooms * 100, 1)
            daily.append({
                "date": date.isoformat(),
                "occupied_rooms": occupied,
                "occupancy_rate": rate,
            })

        return Response({
            "total_rooms": total_rooms,
            "current": {
                "occupied": occupied_now,
                "occupancy_rate": current_rate,
            },
            "daily": daily,
        })


class RevenueView(APIView):
    """
    GET /api/v1/dashboard/revenue/
    Revenue for a period.
    Query params: property, period (today|week|month, default month), start_date, end_date
    """
    required_role = "owner"
    permission_classes = [HasRolePermission]

    def get(self, request):
        org = request.organization
        today = timezone.localdate()
        property_id = request.query_params.get("property")
        period = request.query_params.get("period", "month")

        # Determine date range
        start_date = request.query_params.get("start_date")
        end_date = request.query_params.get("end_date")

        if start_date and end_date:
            from datetime import date as date_type
            start = date_type.fromisoformat(start_date)
            end = date_type.fromisoformat(end_date)
        elif period == "today":
            start = end = today
        elif period == "week":
            start = today - timedelta(days=today.weekday())
            end = today
        else:  # month
            start = today.replace(day=1)
            end = today

        payment_qs = Payment.objects.filter(
            organization=org,
            status="completed",
            processed_at__date__gte=start,
            processed_at__date__lte=end,
        )
        if property_id:
            payment_qs = payment_qs.filter(reservation__property_id=property_id)

        total_revenue = payment_qs.aggregate(total=Sum("amount"))["total"] or Decimal("0")
        payment_count = payment_qs.count()

        # Breakdown by method
        by_method = {}
        for row in payment_qs.values("method").annotate(total=Sum("amount"), count=Count("id")):
            by_method[row["method"]] = {
                "total": str(row["total"]),
                "count": row["count"],
            }

        # Daily breakdown
        daily = []
        current = start
        while current <= end:
            day_total = payment_qs.filter(
                processed_at__date=current,
            ).aggregate(total=Sum("amount"))["total"] or Decimal("0")
            if day_total > 0:
                daily.append({
                    "date": current.isoformat(),
                    "revenue": str(day_total),
                })
            current += timedelta(days=1)

        # Reservation stats for the period
        res_qs = Reservation.objects.filter(
            organization=org,
            created_at__date__gte=start,
            created_at__date__lte=end,
        )
        if property_id:
            res_qs = res_qs.filter(property_id=property_id)

        reservations_created = res_qs.count()
        reservations_by_status = dict(
            res_qs.values_list("operational_status").annotate(
                count=Count("id")
            ).values_list("operational_status", "count")
        )

        return Response({
            "period": {
                "start": start.isoformat(),
                "end": end.isoformat(),
            },
            "revenue": {
                "total": str(total_revenue),
                "payment_count": payment_count,
                "by_method": by_method,
            },
            "daily": daily,
            "reservations": {
                "created": reservations_created,
                "by_status": reservations_by_status,
            },
        })
