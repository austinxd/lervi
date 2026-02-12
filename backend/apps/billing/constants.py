from django.db import models

from apps.common.state_machine import StateMachine

# --- Emission modes ---


class EmissionMode(models.TextChoices):
    DISABLED = "disabled", "Deshabilitado"
    MANUAL = "manual", "Manual"
    AUTOMATIC = "automatic", "Automático"


class PropertyEmissionMode(models.TextChoices):
    INHERIT = "inherit", "Heredar de organización"
    DISABLED = "disabled", "Deshabilitado"
    MANUAL = "manual", "Manual"
    AUTOMATIC = "automatic", "Automático"


# --- Invoice state machine ---

INVOICE_TRANSITIONS = {
    "draft": ["pending", "voided"],
    "pending": ["sent", "error", "voided"],
    "sent": ["accepted", "rejected", "error"],
    "accepted": ["voided"],
    "rejected": ["pending", "voided"],
    "error": ["pending", "voided"],
    "voided": [],
}

invoice_state_machine = StateMachine(INVOICE_TRANSITIONS)
