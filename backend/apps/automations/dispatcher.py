"""
Event dispatcher for the automation engine.

Usage:
    from apps.automations.dispatcher import dispatch_event

    dispatch_event(
        trigger="reservation.check_out",
        organization=reservation.organization,
        context={
            "reservation": reservation,
            "room": reservation.room,
            "guest": reservation.guest,
            "property": reservation.property,
            "user": request.user,
        },
    )
"""
import logging

from .actions import execute_action
from .conditions import evaluate_conditions
from .models import AutomationLog, AutomationRule

logger = logging.getLogger(__name__)


def dispatch_event(trigger, organization, context):
    """
    Find all active rules matching the trigger for this organization,
    evaluate conditions, and execute actions.
    """
    context["organization"] = organization

    rules = AutomationRule.objects.filter(
        organization=organization,
        trigger=trigger,
        is_active=True,
    ).order_by("priority")

    results = []

    for rule in rules:
        conditions_met = evaluate_conditions(rule.conditions, context)

        if not conditions_met:
            AutomationLog.objects.create(
                organization=organization,
                rule=rule,
                rule_name=rule.name,
                trigger=trigger,
                event_data=_serialize_context(context),
                conditions_met=False,
                actions_executed=[],
                success=True,
            )
            continue

        # Execute actions
        action_results = []
        all_success = True

        for action_def in rule.actions:
            result = execute_action(action_def, context)
            action_results.append(result)
            if not result.get("success"):
                all_success = False

        # Log execution
        AutomationLog.objects.create(
            organization=organization,
            rule=rule,
            rule_name=rule.name,
            trigger=trigger,
            event_data=_serialize_context(context),
            conditions_met=True,
            actions_executed=action_results,
            success=all_success,
            error_message="" if all_success else str(
                [r for r in action_results if not r.get("success")]
            ),
        )

        results.append({
            "rule": rule.name,
            "actions": action_results,
            "success": all_success,
        })

        logger.info(
            f"Automation '{rule.name}' executed for {trigger} "
            f"(org={organization.id}, success={all_success})"
        )

    return results


def _serialize_context(context):
    """Serialize context to JSON-safe dict for logging."""
    data = {}
    for key, val in context.items():
        if hasattr(val, "pk"):
            data[key] = {"id": str(val.pk), "str": str(val)}
        elif val is None:
            data[key] = None
        else:
            try:
                data[key] = str(val)
            except Exception:
                data[key] = repr(val)
    return data
