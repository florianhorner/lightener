"""Lightener Integration."""

import logging
from collections.abc import Mapping
from pathlib import Path
from types import MappingProxyType
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceEntry

from .config_flow import LightenerConfigFlow

_LOGGER = logging.getLogger(__name__)

PLATFORMS = [Platform.LIGHT]


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Set up the Lightener integration."""
    from . import websocket

    websocket.async_register_commands(hass)

    # Serve the frontend card JS.
    # hass.http is unavailable during tests and StaticPathConfig may not
    # exist in older HA versions, so guard both the import and the call.
    try:
        from homeassistant.components.http import StaticPathConfig

        if getattr(hass, "http", None) is not None:
            await hass.http.async_register_static_paths(
                [
                    StaticPathConfig(
                        "/lightener/lightener-curve-card.js",
                        str(
                            Path(__file__).parent
                            / "frontend"
                            / "lightener-curve-card.js"
                        ),
                        cache_headers=False,
                    )
                ]
            )
    except Exception:
        _LOGGER.debug("Could not register static paths for frontend card")

    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up platform from a config entry."""

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""

    # Forward the unloading of the entry to the platform.
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)

    return unload_ok


async def async_migrate_entry(hass: HomeAssistant, config_entry: ConfigEntry) -> bool:
    """Update old versions of the configuration to the current format."""

    version = config_entry.version
    data = config_entry.data

    # Lightener 1.x didn't have config entries, just manual configuration.yaml. We consider this the no-version option.
    if version is None or version == 1:
        new_data = await async_migrate_data(data, version)

        hass.config_entries.async_update_entry(config_entry, data=new_data, version=2)

        return True

    if config_entry.version == LightenerConfigFlow.VERSION:
        return True

    _LOGGER.error('Unknown configuration version "%i"', version)
    return False


async def async_migrate_data(
    data: MappingProxyType[str, Any], version: int | None = None
) -> MappingProxyType[str, Any]:
    """Update data from old versions of the configuration to the current format."""

    # Lightener 1.x didn't have config entries, just manual configuration.yaml. We consider this the no-version option.
    if version is None or version == 1:
        new_data = {
            "entities": {},
        }

        if data.get("friendly_name") is not None:
            new_data["friendly_name"] = data["friendly_name"]

        for entity, brightness in data.get("entities", {}).items():
            if (
                isinstance(brightness, Mapping)
                and "brightness" in brightness
                and isinstance(brightness["brightness"], Mapping)
            ):
                normalized_brightness = dict(brightness["brightness"])
            elif isinstance(brightness, Mapping):
                normalized_brightness = dict(brightness)
            else:
                normalized_brightness = brightness

            new_data.get("entities")[entity] = {"brightness": normalized_brightness}

        return MappingProxyType(new_data)

    # Otherwise return a copy of the data.
    return MappingProxyType(dict(data))


async def async_remove_config_entry_device(
    _hass: HomeAssistant, _config_entry: ConfigEntry, _device_entry: DeviceEntry
) -> bool:
    """Remove a config entry from a device."""

    return True
