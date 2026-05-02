"""Lightener Integration."""

import json
import logging
import re
from collections.abc import Mapping
from pathlib import Path
from types import MappingProxyType
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceEntry

from .config_flow import LightenerConfigFlow
from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

PLATFORMS = [Platform.LIGHT]


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Set up the Lightener integration."""
    from . import websocket

    websocket.async_register_commands(hass)

    try:
        _manifest_path = Path(__file__).parent / "manifest.json"
        _manifest_text = await hass.async_add_executor_job(_manifest_path.read_text)
        _raw_version = json.loads(_manifest_text).get("version", "")
        # Strip SemVer build metadata (e.g. +build.4) before URL use — '+' is
        # reserved in URL paths. The pre-release label after '-' is kept.
        # Limitation: two manifests that differ only in build metadata
        # (e.g. 2.15.0+build.1 vs 2.15.0+build.2) collapse to the same versioned
        # URL and won't bust the SW cache between them. Accepted because the
        # project's release flow always bumps SemVer — pure build-metadata-only
        # releases are not a supported upgrade path.
        _url_version = _raw_version.split("+")[0] if _raw_version else ""
        _version = (
            _url_version
            if re.fullmatch(
                r"[0-9]+\.[0-9]+\.[0-9]+(?:[.\-][A-Za-z0-9]+)*", _url_version
            )
            else ""
        )
        if _raw_version and not _version:
            _LOGGER.warning(
                "manifest.json version %r contains unsafe characters; skipping cache-busting",
                _raw_version,
            )
    except Exception as e:
        _LOGGER.warning("Could not read manifest.json for version cache-busting: %s", e)
        _version = ""

    _panel_url = (
        f"/lightener/lightener-panel.js?v={_version}"
        if _version
        else "/lightener/lightener-panel.js"
    )

    # Serve the frontend card and panel JS.
    # hass.http is unavailable during some tests. StaticPathConfig is preferred
    # when available, with a fallback for older HA versions.
    _card_file = str(Path(__file__).parent / "frontend" / "lightener-curve-card.js")
    try:
        if getattr(hass, "http", None) is not None:
            static_paths = [
                # Unversioned path kept for back-compat (users who manually added the
                # Lovelace resource at this URL continue to get the card served).
                ("/lightener/lightener-curve-card.js", _card_file),
            ]
            # Versioned path: forces a SW cache miss on upgrade because the URL path
            # itself changes. lightener-panel.js imports from this versioned URL.
            # Both entries point to the same physical file on disk.
            if _version:
                static_paths.append(
                    (f"/lightener/lightener-curve-card.{_version}.js", _card_file)
                )
            static_paths.append(
                (
                    "/lightener/lightener-panel.js",
                    str(Path(__file__).parent / "frontend" / "lightener-panel.js"),
                )
            )
            registered = False

            try:
                from homeassistant.components.http import StaticPathConfig

                register_paths = getattr(hass.http, "async_register_static_paths", None)
                if register_paths is not None:
                    await register_paths(
                        [
                            StaticPathConfig(url_path, path, cache_headers=False)
                            for url_path, path in static_paths
                        ]
                    )
                    registered = True
            except ImportError:
                registered = False

            if not registered:
                async_register_static_path = getattr(
                    hass.http, "async_register_static_path", None
                )
                register_static_path = getattr(hass.http, "register_static_path", None)
                for url_path, path in static_paths:
                    if async_register_static_path is not None:
                        await async_register_static_path(
                            url_path, path, cache_headers=False
                        )
                    elif register_static_path is not None:
                        register_static_path(url_path, path, cache_headers=False)
    except Exception:
        _LOGGER.debug("Could not register static paths for frontend assets")

    # Register a dedicated sidebar panel for visual curve editing.
    try:
        from homeassistant.components import frontend

        frontend.async_register_built_in_panel(
            hass,
            "custom",
            sidebar_title="Lightener Editor",
            sidebar_icon="mdi:chart-bell-curve-cumulative",
            frontend_url_path="lightener-editor",
            config={
                "_panel_custom": {
                    "name": "lightener-editor-panel",
                    "embed_iframe": False,
                    "trust_external": False,
                    "module_url": _panel_url,
                    # Backward-compatible key for older custom panel handling.
                    "js_url": _panel_url,
                }
            },
            require_admin=False,
            config_panel_domain=DOMAIN,
        )
    except Exception:
        _LOGGER.debug("Could not register Lightener editor panel")

    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up platform from a config entry."""

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""

    # Forward the unloading of the entry to the platform.
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)

    if unload_ok:
        hass.data.get(DOMAIN, {}).pop(entry.entry_id, None)

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
