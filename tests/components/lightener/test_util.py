"""Tests for util helpers."""

from unittest.mock import patch

from custom_components.lightener.const import TYPE_DIMMABLE, TYPE_ONOFF
from custom_components.lightener.util import get_light_type


def test_get_light_type_returns_none_without_supported_modes(hass) -> None:
    """Return None when the entity has no supported color modes."""

    with patch(
        "custom_components.lightener.util.get_supported_color_modes", return_value=None
    ):
        assert get_light_type(hass, "light.test1") is None


def test_get_light_type_returns_dimmable_when_brightness_is_supported(hass) -> None:
    """Return dimmable when brightness is supported by the entity modes."""

    with (
        patch(
            "custom_components.lightener.util.get_supported_color_modes",
            return_value={"brightness"},
        ),
        patch(
            "custom_components.lightener.util.brightness_supported", return_value=True
        ),
    ):
        assert get_light_type(hass, "light.test1") == TYPE_DIMMABLE


def test_get_light_type_returns_onoff_when_brightness_is_not_supported(hass) -> None:
    """Return on/off when brightness is not supported by the entity modes."""

    with (
        patch(
            "custom_components.lightener.util.get_supported_color_modes",
            return_value={"onoff"},
        ),
        patch(
            "custom_components.lightener.util.brightness_supported", return_value=False
        ),
    ):
        assert get_light_type(hass, "light.test_onoff") == TYPE_ONOFF
