"""
Pricing calculation pipeline.

Pipeline order:
1. Base price (from room type)
2. Season adjustment
3. Day-of-week adjustment
4. Rate plan adjustment
5. Promotion adjustment
= Final nightly price

Total = sum of each night's price.
"""
from datetime import timedelta
from decimal import Decimal

from .models import DayOfWeekPricing, Promotion, RatePlan, Season


def calculate_nightly_prices(
    property_obj,
    room_type,
    check_in,
    check_out,
    rate_plan=None,
    promotion_code=None,
    advance_days=0,
):
    """
    Calculate the price for each night of a stay.

    Returns a list of dicts:
    [
        {"date": date, "base": Decimal, "final": Decimal, "adjustments": [...]},
        ...
    ]
    """
    num_nights = (check_out - check_in).days
    if num_nights <= 0:
        return []

    base_price = room_type.base_price

    # Pre-fetch all active seasons (recurring, no date filter needed)
    seasons = Season.objects.filter(
        property=property_obj,
        is_active=True,
    )
    dow_pricing = {
        d.day_of_week: d.price_modifier
        for d in DayOfWeekPricing.objects.filter(property=property_obj)
    }

    # Find rate plan
    active_rate_plan = None
    if rate_plan:
        active_rate_plan = rate_plan
    else:
        # Use default standard plan if exists
        active_rate_plan = RatePlan.objects.filter(
            property=property_obj,
            room_type=room_type,
            plan_type="standard",
            is_active=True,
        ).first()

    # Find promotion
    active_promotion = None
    if promotion_code:
        active_promotion = Promotion.objects.filter(
            property=property_obj,
            code=promotion_code,
            is_active=True,
        ).first()

    nightly_prices = []
    for i in range(num_nights):
        night_date = check_in + timedelta(days=i)
        price = base_price
        adjustments = []

        # 1. Season adjustment
        for season in seasons:
            if season.contains_date(night_date):
                old_price = price
                price = price * season.price_modifier
                adjustments.append({
                    "type": "season",
                    "name": season.name,
                    "modifier": str(season.price_modifier),
                    "before": str(old_price),
                    "after": str(price),
                })
                break  # Only first matching season applies

        # 2. Day-of-week adjustment
        dow = night_date.weekday()
        if dow in dow_pricing:
            modifier = dow_pricing[dow]
            if modifier != Decimal("1.00"):
                old_price = price
                price = price * modifier
                adjustments.append({
                    "type": "day_of_week",
                    "day": DayOfWeekPricing.DAY_NAMES[dow],
                    "modifier": str(modifier),
                    "before": str(old_price),
                    "after": str(price),
                })

        # 3. Rate plan adjustment
        if active_rate_plan and active_rate_plan.is_active:
            if (
                num_nights >= active_rate_plan.min_nights
                and advance_days >= active_rate_plan.min_advance_days
            ):
                modifier = active_rate_plan.price_modifier
                if modifier != Decimal("1.00"):
                    old_price = price
                    price = price * modifier
                    adjustments.append({
                        "type": "rate_plan",
                        "name": active_rate_plan.name,
                        "modifier": str(modifier),
                        "before": str(old_price),
                        "after": str(price),
                    })

        # 4. Promotion adjustment
        if active_promotion and active_promotion.is_active:
            if num_nights >= active_promotion.min_nights:
                in_range = True
                if active_promotion.start_date and night_date < active_promotion.start_date:
                    in_range = False
                if active_promotion.end_date and night_date > active_promotion.end_date:
                    in_range = False
                if in_range:
                    old_price = price
                    if active_promotion.discount_percent > 0:
                        discount = price * (active_promotion.discount_percent / Decimal("100"))
                        price = price - discount
                    elif active_promotion.discount_fixed > 0:
                        price = max(Decimal("0"), price - active_promotion.discount_fixed)
                    adjustments.append({
                        "type": "promotion",
                        "name": active_promotion.name,
                        "before": str(old_price),
                        "after": str(price),
                    })

        # Round to 2 decimal places
        price = price.quantize(Decimal("0.01"))

        nightly_prices.append({
            "date": night_date.isoformat(),
            "base": str(base_price),
            "final": str(price),
            "adjustments": adjustments,
        })

    return nightly_prices


def calculate_total(nightly_prices):
    """Sum up all nightly prices."""
    return sum(Decimal(n["final"]) for n in nightly_prices)
