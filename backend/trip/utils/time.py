import math
from datetime import datetime


def get_current_time_rounded_up() -> float:
    """
    Returns current time rounded up to the next 15-minute block as float hours.
    Example: 13:07 → 13.25, 13:16 → 13.5, 23:59 → 24.0
    """
    now = datetime.now()
    total_minutes = now.hour * 60 + now.minute
    rounded_minutes = math.ceil(total_minutes / 15) * 15
    hours = rounded_minutes // 60
    minutes = rounded_minutes % 60
    return hours + minutes / 60


def round_up_to_15min(hours: float) -> float:
    """
    Rounds any float hour value to the next 15-minute block.
    Example: 1.02 → 1.25, 2.6 → 2.75
    """
    return math.ceil(hours * 4) / 4
