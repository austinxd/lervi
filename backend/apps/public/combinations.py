"""
Algoritmo para encontrar combinaciones de habitaciones que acomoden grupos.
"""
import math
from decimal import Decimal

from apps.pricing.engine import calculate_nightly_prices, calculate_total


def find_group_combinations(
    available_room_types,
    total_adults,
    total_children,
    property_obj,
    check_in,
    check_out,
    max_results=3,
):
    """
    Encuentra combinaciones de múltiples habitaciones que juntas acomoden
    a todo el grupo.

    Args:
        available_room_types: lista de dicts {room_type, available_rooms}
        total_adults: adultos a acomodar
        total_children: niños a acomodar
        property_obj: Property instance
        check_in: date
        check_out: date
        max_results: máximo de combinaciones a retornar

    Returns:
        Lista de combinaciones ordenadas por precio total ascendente.
    """
    if total_adults <= 1 and total_children <= 0:
        return []

    # Ordenar por max_adults descendente para poda más eficiente
    sorted_types = sorted(
        available_room_types,
        key=lambda x: x["room_type"].max_adults,
        reverse=True,
    )

    combinations = []
    _backtrack(sorted_types, total_adults, total_children, 0, [], combinations)

    if not combinations:
        return []

    # Calcular precio para cada combinación
    priced = []
    for combo in combinations:
        combo_rooms = []
        combo_total = Decimal("0")

        for item in combo:
            rt = item["room_type"]
            qty = item["quantity"]
            adults_per = item["adults_per_room"]
            children_per = item["children_per_room"]

            nightly_prices = calculate_nightly_prices(
                property_obj=property_obj,
                room_type=rt,
                check_in=check_in,
                check_out=check_out,
                adults=adults_per,
                children=children_per,
            )
            subtotal = calculate_total(nightly_prices) * qty

            combo_rooms.append({
                "room_type": rt,
                "quantity": qty,
                "adults_per_room": adults_per,
                "children_per_room": children_per,
                "nightly_prices": nightly_prices,
                "subtotal": subtotal,
            })
            combo_total += subtotal

        priced.append({
            "rooms": combo_rooms,
            "total": combo_total,
            "property_name": property_obj.name,
            "property_slug": property_obj.slug,
        })

    # Ordenar por precio y retornar las N más baratas
    priced.sort(key=lambda x: x["total"])
    return priced[:max_results]


def _backtrack(sorted_types, remaining_adults, remaining_children, idx, current, results):
    """Backtracking con poda para encontrar combinaciones válidas."""
    if remaining_adults <= 0 and remaining_children <= 0:
        # Solo aceptar combinaciones de 2+ habitaciones totales
        total_rooms = sum(item["quantity"] for item in current)
        if total_rooms >= 2:
            results.append(list(current))
        return

    # Poda: limitar resultados
    if len(results) >= 20:
        return

    if idx >= len(sorted_types):
        return

    rt_info = sorted_types[idx]
    rt = rt_info["room_type"]
    available = rt_info["available_rooms"]
    max_adults_per = rt.max_adults

    if max_adults_per <= 0:
        _backtrack(sorted_types, remaining_adults, remaining_children, idx + 1, current, results)
        return

    # Máximo de este tipo que podríamos necesitar
    max_needed = math.ceil(max(remaining_adults, 1) / max_adults_per)
    max_qty = min(available, max_needed)

    for qty in range(max_qty, 0, -1):
        adults_per = math.ceil(remaining_adults / qty) if remaining_adults > 0 else 0
        adults_per = min(adults_per, max_adults_per)
        total_adults_covered = adults_per * qty

        children_per = math.ceil(remaining_children / qty) if remaining_children > 0 else 0
        total_children_covered = children_per * qty

        # Validar que los adultos por habitación no excedan capacidad
        if adults_per > max_adults_per:
            continue

        new_remaining_adults = remaining_adults - total_adults_covered
        new_remaining_children = remaining_children - total_children_covered

        current.append({
            "room_type": rt,
            "quantity": qty,
            "adults_per_room": adults_per,
            "children_per_room": children_per,
        })

        _backtrack(
            sorted_types,
            new_remaining_adults,
            new_remaining_children,
            idx + 1,
            current,
            results,
        )

        current.pop()

    # Opción: no usar este tipo
    _backtrack(sorted_types, remaining_adults, remaining_children, idx + 1, current, results)
