"""
Condition evaluator for automation rules.

Each condition is a dict:
    {"field": "reservation.origin_type", "operator": "eq", "value": "website"}
    {"field": "task.task_type", "operator": "eq", "value": "cleaning"}
    {"field": "room.status", "operator": "in", "value": ["dirty", "maintenance"]}

Supported operators: eq, neq, in, gt, gte, lt, lte
"""


def evaluate_conditions(conditions, context):
    """
    Evaluate all conditions. Returns True if ALL conditions pass (AND logic).
    Empty conditions list = always true.
    """
    if not conditions:
        return True

    for condition in conditions:
        if not _evaluate_single(condition, context):
            return False
    return True


def _resolve_field(field_path, context):
    """Resolve a dotted field path from context. e.g. 'task.task_type'"""
    parts = field_path.split(".")
    obj = context.get(parts[0])
    if obj is None:
        return None
    for part in parts[1:]:
        obj = getattr(obj, part, None)
        if obj is None:
            return None
    return obj


def _evaluate_single(condition, context):
    field = condition.get("field", "")
    operator = condition.get("operator", "eq")
    expected = condition.get("value")

    actual = _resolve_field(field, context)

    if operator == "eq":
        return actual == expected
    elif operator == "neq":
        return actual != expected
    elif operator == "in":
        return actual in expected
    elif operator == "gt":
        return actual is not None and actual > expected
    elif operator == "gte":
        return actual is not None and actual >= expected
    elif operator == "lt":
        return actual is not None and actual < expected
    elif operator == "lte":
        return actual is not None and actual <= expected

    return False
