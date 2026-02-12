from django.core.exceptions import ValidationError

from apps.common.models import StateTransitionLog


class StateMachine:
    """
    Generic state machine that validates transitions and logs them.

    Usage:
        TRANSITIONS = {
            "available": ["occupied", "blocked", "maintenance"],
            "occupied": ["dirty"],
            ...
        }
        machine = StateMachine(TRANSITIONS)
        machine.transition(instance, "status", "occupied", user=request.user)
    """

    def __init__(self, transitions: dict[str, list[str]]):
        self.transitions = transitions

    def get_valid_transitions(self, current_state: str) -> list[str]:
        return self.transitions.get(current_state, [])

    def can_transition(self, current_state: str, new_state: str) -> bool:
        return new_state in self.get_valid_transitions(current_state)

    def transition(self, instance, field: str, new_state: str, user=None):
        current_state = getattr(instance, field)
        if not self.can_transition(current_state, new_state):
            valid = ", ".join(self.get_valid_transitions(current_state))
            raise ValidationError(
                f"Transición inválida: {current_state} → {new_state}. "
                f"Transiciones válidas desde '{current_state}': [{valid}]"
            )

        old_state = current_state
        setattr(instance, field, new_state)
        instance.save(update_fields=[field, "updated_at"])

        organization = getattr(instance, "organization", None)
        if organization is None:
            organization = getattr(instance, "property", None)
            if organization is not None:
                organization = organization.organization

        StateTransitionLog.objects.create(
            entity_type=instance.__class__.__name__,
            entity_id=instance.pk,
            field=field,
            old_value=old_state,
            new_value=new_state,
            changed_by=user,
            organization=organization,
        )
