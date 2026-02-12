from apps.common.state_machine import StateMachine

ROOM_STATUS_TRANSITIONS = {
    "available": ["occupied", "blocked", "maintenance"],
    "occupied": ["dirty"],
    "dirty": ["cleaning"],
    "cleaning": ["inspection"],
    "inspection": ["available", "dirty"],
    "blocked": ["available"],
    "maintenance": ["available"],
}

room_state_machine = StateMachine(ROOM_STATUS_TRANSITIONS)

BED_TYPES = [
    ("single", "Individual"),
    ("double", "Doble"),
    ("queen", "Queen"),
    ("king", "King"),
    ("bunk", "Litera"),
    ("sofa_bed", "Sofá cama"),
]
