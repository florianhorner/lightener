"""Tests for __init__."""

import logging
import re
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from homeassistant.config_entries import ConfigEntry, ConfigEntryState
from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers.entity_registry import (
    async_get as async_get_entity_registry,
)
from homeassistant.setup import async_setup_component
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.lightener import (
    async_migrate_entry,
    async_setup,
    async_unload_entry,
)
from custom_components.lightener.config_flow import LightenerConfigFlow
from custom_components.lightener.const import DOMAIN


async def test_async_setup_registers_websocket_and_static_path(
    hass: HomeAssistant,
) -> None:
    """Test integration setup registers websocket handlers and static frontend path."""

    hass.http = MagicMock()
    hass.http.async_register_static_paths = AsyncMock()

    with (
        patch(
            "custom_components.lightener.websocket.async_register_commands"
        ) as register_commands,
        patch(
            "homeassistant.components.frontend.async_register_built_in_panel"
        ) as register_panel,
    ):
        assert await async_setup(hass, {}) is True

    register_commands.assert_called_once_with(hass)
    hass.http.async_register_static_paths.assert_awaited_once()
    register_panel.assert_called_once()

    paths = hass.http.async_register_static_paths.await_args.args[0]
    by_url = {p.url_path: p for p in paths}

    unversioned = by_url["/lightener/lightener-curve-card.js"]
    assert unversioned.path.endswith(
        "/custom_components/lightener/frontend/lightener-curve-card.js"
    )
    assert unversioned.cache_headers is False

    versioned_keys = [
        k
        for k in by_url
        if k != "/lightener/lightener-curve-card.js"
        and re.fullmatch(r"/lightener/lightener-curve-card\.[^/]+\.js", k)
    ]
    assert len(versioned_keys) == 1
    versioned = by_url[versioned_keys[0]]
    assert versioned.path.endswith(
        "/custom_components/lightener/frontend/lightener-curve-card.js"
    )
    assert versioned.cache_headers is False

    panel = by_url["/lightener/lightener-panel.js"]
    assert panel.path.endswith(
        "/custom_components/lightener/frontend/lightener-panel.js"
    )
    assert panel.cache_headers is False

    assert register_panel.call_args.args[1] == "custom"
    assert register_panel.call_args.kwargs["frontend_url_path"] == "lightener-editor"
    panel_custom = register_panel.call_args.kwargs["config"]["_panel_custom"]
    assert panel_custom["name"] == "lightener-editor-panel"
    assert panel_custom["embed_iframe"] is False
    assert panel_custom["trust_external"] is False
    assert panel_custom["module_url"].startswith("/lightener/lightener-panel.js?v=")
    assert panel_custom["js_url"].startswith("/lightener/lightener-panel.js?v=")


async def test_async_setup_panel_urls_degrade_gracefully_without_manifest(
    hass: HomeAssistant,
    caplog: pytest.LogCaptureFixture,
) -> None:
    """Test panel URLs fall back to unversioned when manifest.json cannot be read."""

    hass.http = MagicMock()
    hass.http.async_register_static_paths = AsyncMock()
    # Only the manifest read goes through async_add_executor_job in async_setup.
    # Raising here is narrower than patching pathlib.Path.read_text globally.
    hass.async_add_executor_job = AsyncMock(side_effect=OSError("manifest missing"))

    with (
        patch("custom_components.lightener.websocket.async_register_commands"),
        patch(
            "homeassistant.components.frontend.async_register_built_in_panel"
        ) as register_panel,
        caplog.at_level(logging.WARNING, logger="custom_components.lightener"),
    ):
        assert await async_setup(hass, {}) is True

    hass.http.async_register_static_paths.assert_awaited_once()
    assert "Could not read manifest.json" in caplog.text

    panel_custom = register_panel.call_args.kwargs["config"]["_panel_custom"]
    assert panel_custom["module_url"] == "/lightener/lightener-panel.js"
    assert panel_custom["js_url"] == "/lightener/lightener-panel.js"


async def test_async_setup_versioned_path_omitted_without_version(
    hass: HomeAssistant,
) -> None:
    """Test that the versioned card path is skipped when manifest has no version key."""

    hass.http = MagicMock()
    hass.http.async_register_static_paths = AsyncMock()
    hass.async_add_executor_job = AsyncMock(return_value="{}")

    with (
        patch("custom_components.lightener.websocket.async_register_commands"),
        patch("homeassistant.components.frontend.async_register_built_in_panel"),
    ):
        assert await async_setup(hass, {}) is True

    paths = hass.http.async_register_static_paths.await_args.args[0]
    assert len(paths) == 2
    assert paths[0].url_path == "/lightener/lightener-curve-card.js"
    assert paths[1].url_path == "/lightener/lightener-panel.js"


async def test_async_setup_skips_versioned_path_for_unsafe_version(
    hass: HomeAssistant,
    caplog: pytest.LogCaptureFixture,
) -> None:
    """Test that a version string with unsafe characters is rejected with a warning."""

    hass.http = MagicMock()
    hass.http.async_register_static_paths = AsyncMock()
    hass.async_add_executor_job = AsyncMock(return_value='{"version": "../../evil"}')

    with (
        patch("custom_components.lightener.websocket.async_register_commands"),
        patch("homeassistant.components.frontend.async_register_built_in_panel"),
        caplog.at_level(logging.WARNING, logger="custom_components.lightener"),
    ):
        assert await async_setup(hass, {}) is True

    paths = hass.http.async_register_static_paths.await_args.args[0]
    assert len(paths) == 2
    assert paths[0].url_path == "/lightener/lightener-curve-card.js"
    assert paths[1].url_path == "/lightener/lightener-panel.js"
    assert "unsafe characters" in caplog.text


async def test_async_setup_continues_when_static_path_registration_fails(
    hass: HomeAssistant,
) -> None:
    """Test integration setup succeeds even if static path setup fails."""

    hass.http = MagicMock()
    hass.http.async_register_static_paths = AsyncMock(side_effect=RuntimeError)

    with patch(
        "custom_components.lightener.websocket.async_register_commands"
    ) as register_commands:
        assert await async_setup(hass, {}) is True

    register_commands.assert_called_once_with(hass)
    hass.http.async_register_static_paths.assert_awaited_once()


async def test_async_setup_continues_when_panel_registration_fails(
    hass: HomeAssistant,
) -> None:
    """Test integration setup succeeds even if panel registration fails."""

    hass.http = MagicMock()
    hass.http.async_register_static_paths = AsyncMock()

    with (
        patch(
            "custom_components.lightener.websocket.async_register_commands"
        ) as register_commands,
        patch(
            "homeassistant.components.frontend.async_register_built_in_panel",
            side_effect=RuntimeError,
        ) as register_panel,
    ):
        assert await async_setup(hass, {}) is True

    register_commands.assert_called_once_with(hass)
    hass.http.async_register_static_paths.assert_awaited_once()
    register_panel.assert_called_once()


async def test_async_setup_continues_when_http_component_is_unavailable(
    hass: HomeAssistant,
) -> None:
    """Test integration setup succeeds when hass.http is unavailable."""

    hass.http = None

    with patch(
        "custom_components.lightener.websocket.async_register_commands"
    ) as register_commands:
        assert await async_setup(hass, {}) is True

    register_commands.assert_called_once_with(hass)


async def test_async_setup_entry(hass):
    """Test setting up Lightener successfully."""
    config_entry = MockConfigEntry(
        domain="lightener",
        data={
            "friendly_name": "Test",
            "entities": {
                "light.test1": {},
            },
        },
    )
    config_entry.add_to_hass(hass)

    assert await hass.config_entries.async_setup(config_entry.entry_id)
    await hass.async_block_till_done()
    assert "lightener.light" in hass.config.components


@patch("custom_components.lightener.async_unload_entry", wraps=async_unload_entry)
async def test_async_unload_entry(mock_unload, hass):
    """Test setting up Lightener successfully."""
    config_entry = MockConfigEntry(
        domain="lightener",
        data={
            "friendly_name": "Test",
            "entities": {
                "light.test1": {},
            },
        },
    )
    config_entry.add_to_hass(hass)
    await hass.config_entries.async_setup(config_entry.entry_id)
    await hass.async_block_till_done()
    assert config_entry.state is ConfigEntryState.LOADED
    assert "light.test" in hass.states.async_entity_ids()

    assert await hass.config_entries.async_remove(config_entry.entry_id)
    await hass.async_block_till_done()
    assert config_entry.state is ConfigEntryState.NOT_LOADED
    assert "light.test" not in hass.states.async_entity_ids()

    # Ensure that the Lightener unload implementation was called.
    mock_unload.assert_called_once()
    assert mock_unload.return_value


async def test_migrate_entry_current(hass: HomeAssistant) -> None:
    """Test is the migration does nothing for an up-to-date configuration."""

    config_entry = ConfigEntry(
        version=LightenerConfigFlow.VERSION,
        minor_version=LightenerConfigFlow.VERSION,
        title="lightener",
        domain=DOMAIN,
        data={},
        source="user",
        unique_id=None,
        options=None,
        discovery_keys=[],
        subentries_data={},
    )

    data = config_entry.data

    assert await async_migrate_entry(hass, config_entry) is True

    assert config_entry.data is data


async def test_migrate_entry_v1(hass: HomeAssistant) -> None:
    """Test is the migration does nothing for an up-to-date configuration."""

    config_v1 = {
        "friendly_name": "Test",
        "entities": {
            "light.test1": {
                "10": "20",
                "30": "40",
            },
            "light.test2": {
                "50": "60",
                "70": "80",
            },
        },
    }

    config_entry = ConfigEntry(
        version=1,
        minor_version=1,
        title="lightener",
        domain=DOMAIN,
        data=config_v1,
        source="user",
        unique_id=None,
        options=None,
        discovery_keys=[],
        subentries_data={},
    )

    with patch.object(hass.config_entries, "async_update_entry") as update_mock:
        assert await async_migrate_entry(hass, config_entry) is True

    assert update_mock.call_count == 1
    assert update_mock.call_args.kwargs.get("data") == {
        "friendly_name": "Test",
        "entities": {
            "light.test1": {"brightness": {"10": "20", "30": "40"}},
            "light.test2": {"brightness": {"50": "60", "70": "80"}},
        },
    }


async def test_migrate_entry_v1_already_wrapped(hass: HomeAssistant) -> None:
    """Test migration preserves entries already using the v2 entity shape."""

    config_v1 = {
        "friendly_name": "Test",
        "entities": {
            "light.test1": {
                "brightness": {
                    "10": "20",
                    "30": "40",
                }
            }
        },
    }

    config_entry = ConfigEntry(
        version=1,
        minor_version=1,
        title="lightener",
        domain=DOMAIN,
        data=config_v1,
        source="user",
        unique_id=None,
        options=None,
        discovery_keys=[],
        subentries_data={},
    )

    with patch.object(hass.config_entries, "async_update_entry") as update_mock:
        assert await async_migrate_entry(hass, config_entry) is True

    assert update_mock.call_count == 1
    assert update_mock.call_args.kwargs.get("data") == config_v1


async def test_migrate_unknown_version(hass: HomeAssistant) -> None:
    """Test is the migration does nothing for an up-to-date configuration."""

    config_entry = ConfigEntry(
        version=1000,
        minor_version=1000,
        title="lightener",
        domain=DOMAIN,
        data={},
        source="user",
        unique_id=None,
        options=None,
        discovery_keys=[],
        subentries_data={},
    )

    with patch.object(logging.Logger, "error") as mock:
        assert await async_migrate_entry(hass, config_entry) is False

    mock.assert_called_once_with('Unknown configuration version "%i"', 1000)


async def test_remove_device(
    hass: HomeAssistant, hass_ws_client, create_lightener
) -> None:
    """Ensure HA can remove the Lightener device."""

    # Create a Lightener via the helper so a device and entity are registered.
    lightener = await create_lightener()

    # Find the created entity and its device id.
    er = async_get_entity_registry(hass)
    entity_entry = er.async_get(lightener.entity_id)
    assert entity_entry is not None
    assert entity_entry.device_id is not None
    device_id = entity_entry.device_id
    assert entity_entry.config_entry_id is not None
    config_entry_id = entity_entry.config_entry_id

    # Ensure the config component is set up so it registers the device_registry websocket commands.
    assert await async_setup_component(hass, "config", {})
    await hass.async_block_till_done()

    # Call the websocket API to remove the config entry from the device.
    ws = await hass_ws_client(hass)
    ws_result = await ws.remove_device(device_id, config_entry_id)

    # It should succeed and return a result payload.
    assert ws_result["type"] == "result"
    assert ws_result["success"] is True

    # And the device should no longer reference this config entry.
    dev_reg = dr.async_get(hass)
    device_entry = dev_reg.async_get(device_id)
    if device_entry is not None:
        assert config_entry_id not in device_entry.config_entries
