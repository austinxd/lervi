from apps.common.state_machine import StateMachine

# --- Operational state machine ---
OPERATIONAL_TRANSITIONS = {
    "incomplete": ["pending", "confirmed", "cancelled"],
    "pending": ["confirmed", "cancelled"],
    "confirmed": ["check_in", "cancelled", "no_show"],
    "check_in": ["check_out"],
    "check_out": [],       # final state
    "cancelled": [],       # final state
    "no_show": [],         # final state
}

operational_state_machine = StateMachine(OPERATIONAL_TRANSITIONS)

# --- Financial state machine ---
FINANCIAL_TRANSITIONS = {
    "pending_payment": ["partial", "paid"],
    "partial": ["paid", "refunded"],
    "paid": ["partial_refund", "refunded"],
    "partial_refund": [],  # final state
    "refunded": [],        # final state
}

financial_state_machine = StateMachine(FINANCIAL_TRANSITIONS)
