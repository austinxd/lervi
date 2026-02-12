from django.core.management.base import BaseCommand

from apps.automations.models import AutomationRule
from apps.organizations.models import Organization

PREDEFINED_RULES = [
    {
        "name": "Limpieza post check-out",
        "description": "Al hacer check-out, marca la habitación como sucia y crea tarea de limpieza.",
        "trigger": "reservation.check_out",
        "conditions": [],
        "actions": [
            {"type": "change_room_status", "new_status": "dirty"},
            {"type": "create_task", "task_type": "cleaning", "assigned_role": "housekeeping", "priority": "high", "notes": "Limpieza post check-out (automática)"},
        ],
        "priority": 1,
    },
    {
        "name": "Inspección post limpieza",
        "description": "Cuando una tarea de limpieza se completa, pasa la habitación a inspección.",
        "trigger": "task.completed",
        "conditions": [
            {"field": "task.task_type", "operator": "eq", "value": "cleaning"},
        ],
        "actions": [
            {"type": "change_room_status", "new_status": "inspection"},
        ],
        "priority": 2,
    },
    {
        "name": "Liberar habitación por no-show",
        "description": "Cuando una reserva es marcada como no-show, libera la habitación asignada.",
        "trigger": "reservation.no_show",
        "conditions": [],
        "actions": [
            {"type": "change_room_status", "new_status": "available"},
        ],
        "priority": 3,
    },
]


class Command(BaseCommand):
    help = "Crea las reglas de automatización predefinidas para todas las organizaciones"

    def handle(self, *args, **options):
        organizations = Organization.objects.filter(is_active=True)

        for org in organizations:
            for rule_data in PREDEFINED_RULES:
                rule, created = AutomationRule.objects.get_or_create(
                    organization=org,
                    name=rule_data["name"],
                    is_system=True,
                    defaults={
                        "description": rule_data["description"],
                        "trigger": rule_data["trigger"],
                        "conditions": rule_data["conditions"],
                        "actions": rule_data["actions"],
                        "priority": rule_data["priority"],
                        "is_active": True,
                    },
                )
                if created:
                    self.stdout.write(
                        self.style.SUCCESS(f"  [{org.name}] Regla creada: {rule.name}")
                    )
                else:
                    self.stdout.write(f"  [{org.name}] Regla ya existe: {rule.name}")

        self.stdout.write(self.style.SUCCESS("Reglas predefinidas sincronizadas."))
