from apps.common.state_machine import StateMachine

TASK_STATUS_TRANSITIONS = {
    "pending": ["in_progress"],
    "in_progress": ["completed"],
    "completed": [],  # final state
}

task_state_machine = StateMachine(TASK_STATUS_TRANSITIONS)
