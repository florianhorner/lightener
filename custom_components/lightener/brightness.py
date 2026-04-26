"""Pure brightness-map helpers for Lightener.

Extracted from ``light.py`` to keep the Home Assistant entity class focused
on HA-side concerns. Functions here are intentionally framework-free so they
can be unit-tested in isolation.

``build_brightness_maps`` is decorated with ``@lru_cache`` here — ``light.py``
imports the decorated symbol and keeps a module-level binding, so callers
and tests that reference ``custom_components.lightener.light.build_brightness_maps``
resolve to the same cached object (no duplicate caches).
"""

from __future__ import annotations

from functools import lru_cache

from homeassistant.util.color import value_to_brightness


def _percent_to_brightness(value: int) -> int:
    """Convert a 0..100 percentage to Home Assistant's 0..255 brightness scale."""

    if value == 0:
        return 0
    return value_to_brightness((1, 100), value)


def translate_config_to_brightness(config: dict) -> dict:
    """Create a copy of config converting the 0-100 range to 0-255.

    Convert the values to integers since the original values are strings.
    """

    return {
        _percent_to_brightness(int(k)): _percent_to_brightness(int(v))
        for k, v in config.items()
    }


def prepare_brightness_config(config: dict) -> list[tuple[int, int]]:
    """Convert the brightness configuration to a list of tuples and sorts it by the lightener level.

    Also add the default 0 and 255 levels if they are not present.
    """

    config = translate_config_to_brightness(config)

    # If no explicit origin is present, zero must be zero. An explicit 0 key
    # is preserved as a supported dim floor for lights that should turn on
    # above physical zero as soon as the Lightener group leaves 0%.
    config.setdefault(0, 0)

    # If the maximum level is not present, add it.
    config.setdefault(255, 255)

    # Transform the dictionary into a list of tuples and sort it by the lightener level.
    return sorted(config.items())


def create_brightness_map(config: list) -> dict:
    """Create a mapping of lightener levels to entity levels."""

    brightness_map = {0: 0}

    for i in range(1, len(config)):
        start, end = config[i - 1][0], config[i][0]
        start_value, end_value = config[i - 1][1], config[i][1]
        for j in range(start + 1, end + 1):
            brightness_map[j] = scale_ranged_value_to_int_range(
                (start, end), (start_value, end_value), j
            )

    return brightness_map


def create_reverse_brightness_map(config: list, lightener_levels: dict) -> dict:
    """Create a map with all entity level (from 0 to 255) to all possible lightener levels at each entity level.

    There can be multiple lightener levels for a single entity level.
    """

    # Initialize with all levels from 0 to 255.
    reverse_brightness_map = {i: [] for i in range(256)}

    # Initialize entries with all lightener levels (it goes from 0 to 255)
    for k, v in lightener_levels.items():
        reverse_brightness_map[v].append(k)

    # Now fill the gaps in the map by looping though the configured entity ranges
    for i in range(1, len(config)):
        start, end = config[i - 1][0], config[i][0]
        start_value, end_value = config[i - 1][1], config[i][1]

        # If there is an entity range to be covered
        if start_value != end_value:
            order = 1 if start_value < end_value else -1

            # Loop through the entity range
            for j in range(start_value, end_value + order, order):
                entity_level = scale_ranged_value_to_int_range(
                    (start_value, end_value), (start, end), j
                )
                # If the entry is not yet present for into that level, add it.
                if entity_level not in reverse_brightness_map[j]:
                    reverse_brightness_map[j].append(entity_level)

    return reverse_brightness_map


def create_reverse_brightness_map_on_off(reverse_map: dict) -> dict:
    """Create a reversed map dedicated to on/off lights."""

    # Build the "on" state out of all levels which are not in the "off" state.
    off_levels = set(reverse_map[0])
    on_levels = [i for i in range(1, 256) if i not in off_levels]

    # The "on" levels are possible for all non-zero levels.
    reverse_map_on_off = dict.fromkeys(range(1, 256), on_levels)

    # The "off" matches the normal reverse map.
    reverse_map_on_off[0] = reverse_map[0]

    return reverse_map_on_off


def scale_ranged_value_to_int_range(
    source_range: tuple[float, float],
    target_range: tuple[float, float],
    value: float,
) -> int:
    """Scale a value from one range to another and return an integer."""

    # Unpack the original and target ranges
    (a, b) = source_range
    (c, d) = target_range

    # Calculate the conversion
    y = c + ((value - a) * (d - c)) / (b - a)
    return round(y)


@lru_cache(maxsize=128)
def build_brightness_maps(
    config: tuple[tuple[int, int], ...],
) -> tuple[dict, dict, dict]:
    """Build and cache brightness maps for identical curve configs."""
    levels = create_brightness_map(config)
    reverse_brightness_map = create_reverse_brightness_map(config, levels)
    reverse_brightness_map_on_off = create_reverse_brightness_map_on_off(
        reverse_brightness_map
    )

    return levels, reverse_brightness_map, reverse_brightness_map_on_off
