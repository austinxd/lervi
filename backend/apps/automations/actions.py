"""
Action executors for the automation engine.

Each action is a dict with "type" and params. Example:
    {"type": "create_task", "task_type": "cleaning", "assigned_role": "housekeeping", "priority": "high"}
    {"type": "change_room_status", "new_status": "dirty"}
    {"type": "add_note", "entity": "reservation", "content": "Auto-generada por regla"}
"""
import logging

from django.core.exceptions import ValidationError as DjangoValidationError

logger = logging.getLogger(__name__)


def execute_action(action_def, context):
    """
    Execute a single action.

    context keys:
        organization, user, reservation, room, task, guest, property
    """
    action_type = action_def.get("type")
    executor = ACTION_REGISTRY.get(action_type)
    if not executor:
        logger.warning(f"Unknown action type: {action_type}")
        return {"type": action_type, "success": False, "error": f"Unknown action: {action_type}"}

    try:
        result = executor(action_def, context)
        return {"type": action_type, "success": True, "detail": result}
    except Exception as e:
        logger.exception(f"Action {action_type} failed: {e}")
        return {"type": action_type, "success": False, "error": str(e)}


def _create_task(action_def, context):
    from apps.tasks.models import Task

    room = context.get("room")
    property_obj = context.get("property")
    organization = context.get("organization")

    task = Task.objects.create(
        organization=organization,
        task_type=action_def.get("task_type", "other"),
        property=property_obj,
        room=room,
        assigned_role=action_def.get("assigned_role", ""),
        priority=action_def.get("priority", "normal"),
        notes=action_def.get("notes", ""),
    )
    return f"Task {task.id} created ({task.get_task_type_display()})"


def _change_room_status(action_def, context):
    from apps.rooms.constants import room_state_machine

    room = context.get("room")
    if not room:
        return "No room in context, skipped"

    new_status = action_def.get("new_status")
    user = context.get("user")

    try:
        room_state_machine.transition(room, "status", new_status, user=user)
        return f"Room {room.number}: → {new_status}"
    except DjangoValidationError as e:
        return f"Room transition failed: {e.message}"


def _add_note(action_def, context):
    entity = action_def.get("entity")
    content = action_def.get("content", "")
    organization = context.get("organization")
    user = context.get("user")

    if entity == "guest":
        from apps.guests.models import GuestNote
        guest = context.get("guest")
        if guest:
            GuestNote.objects.create(
                guest=guest, organization=organization,
                content=content, created_by=user,
            )
            return f"Note added to guest {guest.full_name}"

    return f"Note skipped (entity={entity})"


def _emit_invoice(action_def, context):
    from apps.billing.services.config_resolver import resolve_billing_config
    from apps.billing.services.invoice_builder import build_invoice_from_reservation
    from apps.billing.services.invoice_emitter import emit_invoice

    reservation = context.get("reservation")
    if not reservation:
        return "No reservation in context, skipped"

    config = resolve_billing_config(reservation.property)
    if not config:
        return "Billing disabled, skipped"

    user = context.get("user")
    emission_mode = config["emission_mode"]
    document_type = action_def.get("document_type", "boleta")

    # Always create the draft
    invoice = build_invoice_from_reservation(reservation, document_type, user)
    if not invoice:
        return "Could not build invoice (no serie configured?), skipped"

    # Only emit if automatic
    if emission_mode == "automatic":
        result = emit_invoice(invoice, user)
        if result["success"]:
            return f"Invoice {invoice.numero_completo} emitted successfully"
        else:
            return (
                f"Invoice {invoice.numero_completo} created, emission failed: "
                f"{result.get('error')}. Pending retry."
            )
    else:  # manual
        return f"Invoice {invoice.numero_completo} created as draft (manual mode)"


ACTION_REGISTRY = {
    "create_task": _create_task,
    "change_room_status": _change_room_status,
    "add_note": _add_note,
    "emit_invoice": _emit_invoice,
}
