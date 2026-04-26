"""Tests for the pure brightness-map helpers in ``custom_components.lightener.brightness``.

These tests deliberately import from the ``brightness`` module so the pure
helpers are exercised directly, independent of the HA entity module. The
broader numerical coverage lives in ``test_light.py``.
"""

from __future__ import annotations

import pytest

from custom_components.lightener.brightness import (
    build_brightness_maps,
    create_brightness_map,
    create_reverse_brightness_map,
    create_reverse_brightness_map_on_off,
    prepare_brightness_config,
    scale_ranged_value_to_int_range,
    translate_config_to_brightness,
)


@pytest.mark.parametrize(
    ("source", "target", "value", "expected"),
    [
        ((0, 100), (0, 255), 0, 0),
        ((0, 100), (0, 255), 50, 128),
        ((0, 100), (0, 255), 100, 255),
        ((1, 255), (0, 100), 128, 50),
        ((0, 10), (0, 100), 7, 70),
        # Pin banker's-rounding behaviour of Python's round().
        # 1.5 -> 2 and 2.5 -> 2 (round-half-to-even).
        ((0, 10), (0, 3), 5, 2),
        ((0, 4), (0, 5), 2, 2),
    ],
)
def test_scale_ranged_value_to_int_range(
    source: tuple[int, int],
    target: tuple[int, int],
    value: int,
    expected: int,
) -> None:
    assert scale_ranged_value_to_int_range(source, target, value) == expected


def test_translate_config_to_brightness_rescales_0_100_to_1_255() -> None:
    """Non-zero values get rescaled to the 1..255 range; zero stays zero."""
    result = translate_config_to_brightness({"50": "50"})
    # Keys and values are both rescaled, except zero which stays zero.
    assert len(result) == 1
    [(k, v)] = result.items()
    assert k == v  # symmetric mapping
    assert 1 <= k <= 255

    zero_result = translate_config_to_brightness({"100": "0"})
    assert zero_result == {255: 0}


def test_prepare_brightness_config_adds_endpoints_and_sorts() -> None:
    """Defaults for 0 and 255 are injected; output is sorted by key."""
    result = prepare_brightness_config({"50": "50"})
    assert result[0] == (0, 0)
    assert result[-1][0] == 255  # max key is 255
    # Sorted ascending
    keys = [k for k, _ in result]
    assert keys == sorted(keys)


def test_prepare_brightness_config_preserves_explicit_max() -> None:
    """If 255 is explicitly configured, the explicit value wins over the default."""
    # value_to_brightness((1,100), 100) == 255, value_to_brightness((1,100), 50) == 128
    result = prepare_brightness_config({"100": "50"})
    d = dict(result)
    assert d[255] == 128


def test_prepare_brightness_config_preserves_explicit_origin_dim_floor() -> None:
    """An explicit 0 key can define the first non-zero target brightness."""
    result = prepare_brightness_config({"0": "12", "100": "80"})
    d = dict(result)
    assert d[0] > 0
    assert d[255] < 255

    brightness_map = create_brightness_map(result)
    assert brightness_map[0] == 0
    assert brightness_map[1] > 0


def test_create_brightness_map_fills_full_range() -> None:
    """Map covers every lightener level 0..255 exactly once."""
    config = prepare_brightness_config({"50": "50"})
    m = create_brightness_map(config)
    assert set(m.keys()) == set(range(256))
    assert m[0] == 0
    assert m[255] == 255


def test_create_brightness_map_is_monotonic_for_linear_config() -> None:
    """For a linear config, the map is monotonically non-decreasing."""
    config = prepare_brightness_config({"50": "50"})
    m = create_brightness_map(config)
    values = [m[i] for i in range(256)]
    assert values == sorted(values)


def test_create_reverse_brightness_map_contains_all_entity_levels() -> None:
    """Reverse map keys span 0..255."""
    config = prepare_brightness_config({"50": "50"})
    levels = create_brightness_map(config)
    reverse = create_reverse_brightness_map(config, levels)
    assert set(reverse.keys()) == set(range(256))


def test_create_reverse_brightness_map_round_trip_linear() -> None:
    """For a linear map, every lightener level appears in the reverse lookup for its entity level."""
    config = prepare_brightness_config({"50": "50"})
    levels = create_brightness_map(config)
    reverse = create_reverse_brightness_map(config, levels)
    for lightener_level, entity_level in levels.items():
        assert lightener_level in reverse[entity_level]


def test_create_reverse_brightness_map_on_off_partition() -> None:
    """On/off reverse map: level 0 keeps the off levels, every other level shares the same on list."""
    config = prepare_brightness_config({"50": "50"})
    levels = create_brightness_map(config)
    reverse = create_reverse_brightness_map(config, levels)
    on_off = create_reverse_brightness_map_on_off(reverse)

    assert on_off[0] == reverse[0]
    # All non-zero entries point at the same on-level list.
    non_zero = [on_off[i] for i in range(1, 256)]
    assert all(entry == non_zero[0] for entry in non_zero)
    # The on-level list and off-level list are disjoint.
    assert not (set(on_off[0]) & set(non_zero[0]))


def test_build_brightness_maps_cache_hits_on_identical_config() -> None:
    """``build_brightness_maps`` is memoized: identical tuple inputs return the same object."""
    # Use a unique config unlikely to be cached already across test ordering.
    cfg = tuple(prepare_brightness_config({"42": "17"}))

    # Clear cache to make hit/miss assertions deterministic for this input.
    build_brightness_maps.cache_clear()

    first = build_brightness_maps(cfg)
    second = build_brightness_maps(cfg)

    # lru_cache returns the same tuple object on hit.
    assert first is second

    info = build_brightness_maps.cache_info()
    assert info.hits >= 1
    assert info.misses >= 1


def test_build_brightness_maps_distinct_configs_miss_cache_independently() -> None:
    """Different tuples are distinct cache keys."""
    build_brightness_maps.cache_clear()

    cfg_a = tuple(prepare_brightness_config({"20": "10"}))
    cfg_b = tuple(prepare_brightness_config({"80": "90"}))

    build_brightness_maps(cfg_a)
    build_brightness_maps(cfg_b)
    info = build_brightness_maps.cache_info()
    assert info.misses == 2
    assert info.currsize == 2


def test_light_module_reexports_share_cache_identity() -> None:
    """``light.build_brightness_maps`` must be the same object as the brightness-module symbol.

    This guards against accidental re-decoration in ``light.py`` which would
    create a second ``@lru_cache`` wrapper and split the cache.
    """
    from custom_components.lightener import light as light_module

    assert light_module.build_brightness_maps is build_brightness_maps
