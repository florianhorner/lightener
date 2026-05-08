"""Tests for WebSocket API."""

from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

import pytest
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.lightener.const import DOMAIN
from custom_components.lightener.websocket import (
    _async_apply_config_entry_update,
    _async_restore_config_entry_data,
    _connection_can_read_entity,
    _set_entity_list_cache,
)


async def _setup_lightener(hass: HomeAssistant, entities: dict | None = None):
    """Create a config entry and set up the integration. Return the config entry."""
    config_entry = MockConfigEntry(
        domain=DOMAIN,
        unique_id=str(uuid4()),
        data={
            "friendly_name": "Test",
            "entities": entities
            or {
                "light.test1": {
                    "brightness": {"60": "100", "10": "50"},
                },
            },
        },
    )
    config_entry.add_to_hass(hass)

    assert await hass.config_entries.async_setup(config_entry.entry_id)
    await hass.async_block_till_done()

    return config_entry


async def test_get_curves_returns_entities(hass: HomeAssistant, hass_ws_client) -> None:
    """Test ws_get_curves returns the entities dict from the config entry."""
    entities = {
        "light.test1": {
            "brightness": {"60": "100", "10": "50"},
        },
    }
    await _setup_lightener(hass, entities)

    ws = await hass_ws_client(hass)
    await ws.send_json(
        {
            "id": 1,
            "type": "lightener/get_curves",
            "entity_id": "light.test",
        }
    )
    result = await ws.receive_json()

    assert result["success"] is True
    assert result["result"]["entities"] == entities


async def test_list_entities_returns_lightener_entities(
    hass: HomeAssistant, hass_ws_client
) -> None:
    """Test ws_list_entities returns only Lightener entities."""
    config_entry = await _setup_lightener(hass)

    ws = await hass_ws_client(hass)
    await ws.send_json(
        {
            "id": 100,
            "type": "lightener/list_entities",
        }
    )
    result = await ws.receive_json()

    assert result["success"] is True
    assert isinstance(result["result"]["entities"], list)
    assert any(
        item["entity_id"] == "light.test"
        and item["config_entry_id"] == config_entry.entry_id
        for item in result["result"]["entities"]
    )


async def test_get_curves_invalid_entity(hass: HomeAssistant, hass_ws_client) -> None:
    """Test ws_get_curves returns an error for a non-Lightener entity."""
    await _setup_lightener(hass)

    ws = await hass_ws_client(hass)
    await ws.send_json(
        {
            "id": 1,
            "type": "lightener/get_curves",
            "entity_id": "light.test1",
        }
    )
    result = await ws.receive_json()

    assert result["success"] is False
    assert result["error"]["code"] == "not_found"


async def test_save_curves_updates_config(hass: HomeAssistant, hass_ws_client) -> None:
    """Test ws_save_curves updates the config entry data."""
    config_entry = await _setup_lightener(
        hass,
        {
            "light.test1": {
                "brightness": {"60": "100", "10": "50"},
            },
        },
    )

    ws = await hass_ws_client(hass)
    await ws.send_json(
        {
            "id": 1,
            "type": "lightener/save_curves",
            "entity_id": "light.test",
            "curves": {
                "light.test1": {
                    "brightness": {"20": "80", "50": "90"},
                },
            },
        }
    )
    result = await ws.receive_json()

    assert result["success"] is True

    # Verify the config entry was updated
    updated_entry = hass.config_entries.async_get_entry(config_entry.entry_id)
    assert updated_entry.data["entities"]["light.test1"]["brightness"] == {
        "20": "80",
        "50": "90",
    }


async def test_save_curves_refreshes_live_entity_state(
    hass: HomeAssistant, hass_ws_client
) -> None:
    """Saving curves should immediately refresh the live Lightener state."""
    config_entry = await _setup_lightener(
        hass,
        {
            "light.test1": {
                "brightness": {"50": "0"},
            },
        },
    )
    lightener = hass.data[DOMAIN][config_entry.entry_id]

    hass.states.async_set(
        "light.test1",
        "on",
        attributes={"brightness": 1},
    )
    lightener.async_update_group_state()
    lightener.async_write_ha_state()
    brightness_before = hass.states.get("light.test").attributes["brightness"]

    ws = await hass_ws_client(hass)
    await ws.send_json(
        {
            "id": 10,
            "type": "lightener/save_curves",
            "entity_id": "light.test",
            "curves": {
                "light.test1": {
                    "brightness": {"1": "1", "100": "100"},
                },
            },
        }
    )
    result = await ws.receive_json()

    assert result["success"] is True

    brightness_after_save = hass.states.get("light.test").attributes["brightness"]
    lightener.async_update_group_state()
    lightener.async_write_ha_state()
    brightness_after_manual_refresh = hass.states.get("light.test").attributes[
        "brightness"
    ]

    assert brightness_before != brightness_after_manual_refresh
    assert brightness_after_save == brightness_after_manual_refresh


async def test_save_curves_rolls_back_on_reload_failure(
    hass: HomeAssistant, hass_ws_client
) -> None:
    """A failed save reload must not leave the config entry mutated."""
    original_entities = {
        "light.test1": {
            "brightness": {"60": "100", "10": "50"},
        },
    }
    config_entry = await _setup_lightener(hass, original_entities)
    hass.data.get(DOMAIN, {}).pop(config_entry.entry_id, None)

    ws = await hass_ws_client(hass)
    with patch.object(hass.config_entries, "async_reload", return_value=False):
        await ws.send_json(
            {
                "id": 11,
                "type": "lightener/save_curves",
                "entity_id": "light.test",
                "curves": {
                    "light.test1": {
                        "brightness": {"20": "80", "50": "90"},
                    },
                },
            }
        )
        result = await ws.receive_json()

    assert result["success"] is False
    assert result["error"]["code"] == "reload_failed"

    updated_entry = hass.config_entries.async_get_entry(config_entry.entry_id)
    assert dict(updated_entry.data["entities"]) == original_entities


async def test_save_curves_validates_range(hass: HomeAssistant, hass_ws_client) -> None:
    """Test ws_save_curves rejects out-of-range brightness values."""
    await _setup_lightener(hass)

    ws = await hass_ws_client(hass)

    # Key out of range (below minimum of 0)
    await ws.send_json(
        {
            "id": 1,
            "type": "lightener/save_curves",
            "entity_id": "light.test",
            "curves": {
                "light.test1": {
                    "brightness": {"-1": "50"},
                },
            },
        }
    )
    result = await ws.receive_json()
    assert result["success"] is False
    assert result["error"]["code"] == "invalid_format"

    # Value out of range (101 is above maximum of 100)
    await ws.send_json(
        {
            "id": 2,
            "type": "lightener/save_curves",
            "entity_id": "light.test",
            "curves": {
                "light.test1": {
                    "brightness": {"50": "101"},
                },
            },
        }
    )
    result = await ws.receive_json()
    assert result["success"] is False
    assert result["error"]["code"] == "invalid_format"


async def test_save_curves_rejects_unknown_entities(
    hass: HomeAssistant, hass_ws_client
) -> None:
    """Test ws_save_curves rejects entity IDs not in the config entry."""
    await _setup_lightener(
        hass,
        {
            "light.test1": {
                "brightness": {"60": "100"},
            },
        },
    )

    ws = await hass_ws_client(hass)
    await ws.send_json(
        {
            "id": 1,
            "type": "lightener/save_curves",
            "entity_id": "light.test",
            "curves": {
                "light.unknown_entity": {
                    "brightness": {"50": "80"},
                },
            },
        }
    )
    result = await ws.receive_json()

    assert result["success"] is False
    assert result["error"]["code"] == "unknown_entities"


async def test_save_curves_rejects_non_dict_entity_payload(
    hass: HomeAssistant, hass_ws_client
) -> None:
    """Test ws_save_curves rejects non-dict entity payloads."""
    await _setup_lightener(hass)

    ws = await hass_ws_client(hass)
    await ws.send_json(
        {
            "id": 1,
            "type": "lightener/save_curves",
            "entity_id": "light.test",
            "curves": {
                "light.test1": "not_a_dict",
            },
        }
    )
    result = await ws.receive_json()

    assert result["success"] is False
    assert result["error"]["code"] == "invalid_format"


async def test_save_curves_rejects_non_dict_brightness(
    hass: HomeAssistant, hass_ws_client
) -> None:
    """Test ws_save_curves rejects non-dict brightness payloads."""
    await _setup_lightener(hass)

    ws = await hass_ws_client(hass)
    await ws.send_json(
        {
            "id": 1,
            "type": "lightener/save_curves",
            "entity_id": "light.test",
            "curves": {
                "light.test1": {
                    "brightness": "not_a_dict",
                },
            },
        }
    )
    result = await ws.receive_json()

    assert result["success"] is False
    assert result["error"]["code"] == "invalid_format"


async def test_save_curves_rejects_non_numeric_values(
    hass: HomeAssistant, hass_ws_client
) -> None:
    """Test ws_save_curves rejects non-numeric brightness keys/values."""
    await _setup_lightener(hass)

    ws = await hass_ws_client(hass)
    await ws.send_json(
        {
            "id": 1,
            "type": "lightener/save_curves",
            "entity_id": "light.test",
            "curves": {
                "light.test1": {
                    "brightness": {"abc": "50"},
                },
            },
        }
    )
    result = await ws.receive_json()

    assert result["success"] is False
    assert result["error"]["code"] == "invalid_format"


@pytest.mark.parametrize(
    "curves",
    [
        {"light.test1": {"brightness": {"50": 50.5}}},
        {"light.test1": {"brightness": {"50": True}}},
        {"light.test1": {"brightness": {"50": False}}},
        {"light.test1": {}},
    ],
)
async def test_save_curves_rejects_non_integer_or_missing_brightness(
    hass: HomeAssistant, hass_ws_client, curves: dict
) -> None:
    """Test ws_save_curves rejects ambiguous values that int() would truncate."""
    await _setup_lightener(hass)

    ws = await hass_ws_client(hass)
    await ws.send_json(
        {
            "id": 2,
            "type": "lightener/save_curves",
            "entity_id": "light.test",
            "curves": curves,
        }
    )
    result = await ws.receive_json()

    assert result["success"] is False
    assert result["error"]["code"] == "invalid_format"


async def test_save_curves_preserves_origin_dim_floor(
    hass: HomeAssistant, hass_ws_client
) -> None:
    """Test ws_save_curves accepts and normalizes an explicit 0% origin target."""
    config_entry = await _setup_lightener(hass)

    ws = await hass_ws_client(hass)
    await ws.send_json(
        {
            "id": 3,
            "type": "lightener/save_curves",
            "entity_id": "light.test",
            "curves": {
                "light.test1": {
                    "brightness": {"0": "12", "100": "85"},
                },
            },
        }
    )
    result = await ws.receive_json()

    assert result["success"] is True
    updated_entry = hass.config_entries.async_get_entry(config_entry.entry_id)
    assert updated_entry.data["entities"]["light.test1"]["brightness"] == {
        "0": "12",
        "100": "85",
    }


async def test_save_curves_requires_admin(
    hass: HomeAssistant, hass_ws_client, hass_admin_user
) -> None:
    """Test ws_save_curves rejects non-admin connections."""
    await _setup_lightener(hass)

    # Remove admin privileges from the test user
    hass_admin_user.groups = []

    ws = await hass_ws_client(hass)
    await ws.send_json(
        {
            "id": 1,
            "type": "lightener/save_curves",
            "entity_id": "light.test",
            "curves": {
                "light.test1": {
                    "brightness": {"50": "80"},
                },
            },
        }
    )
    result = await ws.receive_json()

    assert result["success"] is False
    assert result["error"]["code"] == "unauthorized"


async def test_add_light_appends_entity(hass: HomeAssistant, hass_ws_client) -> None:
    """Test ws_add_light adds a new controlled light with a default linear curve."""
    config_entry = await _setup_lightener(
        hass,
        {"light.test1": {"brightness": {"100": "100"}}},
    )

    ws = await hass_ws_client(hass)
    await ws.send_json(
        {
            "id": 1,
            "type": "lightener/add_light",
            "entity_id": "light.test",
            "controlled_entity_id": "light.test2",
        }
    )
    result = await ws.receive_json()

    assert result["success"] is True
    assert "light.test2" in result["result"]["entities"]

    updated_entry = hass.config_entries.async_get_entry(config_entry.entry_id)
    assert "light.test2" in updated_entry.data["entities"]
    # Default preset is linear: 1->1, 100->100
    assert updated_entry.data["entities"]["light.test2"]["brightness"] == {
        "1": "1",
        "100": "100",
    }
    # Existing light is preserved
    assert updated_entry.data["entities"]["light.test1"]["brightness"] == {"100": "100"}


async def test_add_light_with_preset(hass: HomeAssistant, hass_ws_client) -> None:
    """Test ws_add_light respects the preset argument."""
    await _setup_lightener(hass)

    ws = await hass_ws_client(hass)
    await ws.send_json(
        {
            "id": 1,
            "type": "lightener/add_light",
            "entity_id": "light.test",
            "controlled_entity_id": "light.test2",
            "preset": "night_mode",
        }
    )
    result = await ws.receive_json()

    assert result["success"] is True
    assert result["result"]["entities"]["light.test2"]["brightness"] == {
        "1": "1",
        "20": "3",
        "50": "10",
        "100": "25",
    }


async def test_add_light_rejects_duplicate(hass: HomeAssistant, hass_ws_client) -> None:
    """Test ws_add_light rejects a light that is already controlled."""
    await _setup_lightener(
        hass,
        {"light.test1": {"brightness": {"100": "100"}}},
    )

    ws = await hass_ws_client(hass)
    await ws.send_json(
        {
            "id": 1,
            "type": "lightener/add_light",
            "entity_id": "light.test",
            "controlled_entity_id": "light.test1",
        }
    )
    result = await ws.receive_json()

    assert result["success"] is False
    assert result["error"]["code"] == "already_exists"


async def test_add_light_rejects_self_reference(
    hass: HomeAssistant, hass_ws_client
) -> None:
    """Test ws_add_light rejects adding the lightener to itself."""
    await _setup_lightener(hass)

    ws = await hass_ws_client(hass)
    await ws.send_json(
        {
            "id": 1,
            "type": "lightener/add_light",
            "entity_id": "light.test",
            "controlled_entity_id": "light.test",
        }
    )
    result = await ws.receive_json()

    assert result["success"] is False
    assert result["error"]["code"] == "invalid_format"


async def test_add_light_rejects_non_light_entity(
    hass: HomeAssistant, hass_ws_client
) -> None:
    """Test ws_add_light rejects non-light entity ids."""
    await _setup_lightener(hass)

    ws = await hass_ws_client(hass)
    await ws.send_json(
        {
            "id": 1,
            "type": "lightener/add_light",
            "entity_id": "light.test",
            "controlled_entity_id": "switch.something",
        }
    )
    result = await ws.receive_json()

    assert result["success"] is False
    assert result["error"]["code"] == "invalid_format"


async def test_add_light_rejects_unknown_light_entity(
    hass: HomeAssistant, hass_ws_client
) -> None:
    """Test ws_add_light rejects light ids that do not exist."""
    await _setup_lightener(hass)

    ws = await hass_ws_client(hass)
    await ws.send_json(
        {
            "id": 12,
            "type": "lightener/add_light",
            "entity_id": "light.test",
            "controlled_entity_id": "light.not_real",
        }
    )
    result = await ws.receive_json()

    assert result["success"] is False
    assert result["error"]["code"] == "not_found"


async def test_add_light_rejects_unknown_preset(
    hass: HomeAssistant, hass_ws_client
) -> None:
    """Test ws_add_light rejects unknown preset names."""
    await _setup_lightener(hass)

    ws = await hass_ws_client(hass)
    await ws.send_json(
        {
            "id": 1,
            "type": "lightener/add_light",
            "entity_id": "light.test",
            "controlled_entity_id": "light.new_light",
            "preset": "not_a_real_preset",
        }
    )
    result = await ws.receive_json()

    assert result["success"] is False
    assert result["error"]["code"] == "invalid_format"


async def test_add_light_allows_nested_lightener(
    hass: HomeAssistant, hass_ws_client
) -> None:
    """Test ws_add_light allows another Lightener as a controlled light.

    Matches the config flow behaviour, which only excludes the *current*
    Lightener from the picker — chaining Lighteners is a legitimate use case.
    """
    config_entry_a = MockConfigEntry(
        domain=DOMAIN,
        unique_id=str(uuid4()),
        data={
            "friendly_name": "Group A",
            "entities": {"light.bulb1": {"brightness": {"100": "100"}}},
        },
    )
    config_entry_a.add_to_hass(hass)
    assert await hass.config_entries.async_setup(config_entry_a.entry_id)

    config_entry_b = MockConfigEntry(
        domain=DOMAIN,
        unique_id=str(uuid4()),
        data={
            "friendly_name": "Group B",
            "entities": {"light.bulb2": {"brightness": {"100": "100"}}},
        },
    )
    config_entry_b.add_to_hass(hass)
    assert await hass.config_entries.async_setup(config_entry_b.entry_id)
    await hass.async_block_till_done()

    ws = await hass_ws_client(hass)
    await ws.send_json(
        {
            "id": 1,
            "type": "lightener/add_light",
            "entity_id": "light.group_a",
            "controlled_entity_id": "light.group_b",
        }
    )
    result = await ws.receive_json()

    assert result["success"] is True
    assert "light.group_b" in result["result"]["entities"]


async def test_add_light_rejects_non_lightener_entity(
    hass: HomeAssistant, hass_ws_client
) -> None:
    """Test ws_add_light refuses when the target entity is not a Lightener entity."""
    await _setup_lightener(hass)

    ws = await hass_ws_client(hass)
    await ws.send_json(
        {
            "id": 1,
            "type": "lightener/add_light",
            "entity_id": "light.not_a_lightener",
            "controlled_entity_id": "light.new_light",
        }
    )
    result = await ws.receive_json()

    assert result["success"] is False
    assert result["error"]["code"] == "not_found"


async def test_add_light_requires_admin(
    hass: HomeAssistant, hass_ws_client, hass_admin_user
) -> None:
    """Test ws_add_light rejects non-admin connections."""
    await _setup_lightener(hass)
    hass_admin_user.groups = []

    ws = await hass_ws_client(hass)
    await ws.send_json(
        {
            "id": 1,
            "type": "lightener/add_light",
            "entity_id": "light.test",
            "controlled_entity_id": "light.new_light",
        }
    )
    result = await ws.receive_json()

    assert result["success"] is False
    assert result["error"]["code"] == "unauthorized"


async def test_remove_light_drops_entity(hass: HomeAssistant, hass_ws_client) -> None:
    """Test ws_remove_light removes a controlled light."""
    config_entry = await _setup_lightener(
        hass,
        {
            "light.test1": {"brightness": {"100": "100"}},
            "light.test2": {"brightness": {"100": "80"}},
        },
    )

    ws = await hass_ws_client(hass)
    await ws.send_json(
        {
            "id": 1,
            "type": "lightener/remove_light",
            "entity_id": "light.test",
            "controlled_entity_id": "light.test1",
        }
    )
    result = await ws.receive_json()

    assert result["success"] is True
    assert "light.test1" not in result["result"]["entities"]
    assert "light.test2" in result["result"]["entities"]

    updated_entry = hass.config_entries.async_get_entry(config_entry.entry_id)
    assert "light.test1" not in updated_entry.data["entities"]
    assert "light.test2" in updated_entry.data["entities"]


@pytest.mark.parametrize(
    ("msg", "entities"),
    [
        (
            {
                "id": 13,
                "type": "lightener/add_light",
                "entity_id": "light.test",
                "controlled_entity_id": "light.test2",
            },
            {"light.test1": {"brightness": {"100": "100"}}},
        ),
        (
            {
                "id": 14,
                "type": "lightener/remove_light",
                "entity_id": "light.test",
                "controlled_entity_id": "light.test1",
            },
            {
                "light.test1": {"brightness": {"100": "100"}},
                "light.test2": {"brightness": {"100": "80"}},
            },
        ),
    ],
)
async def test_light_mutations_roll_back_on_reload_failure(
    hass: HomeAssistant, hass_ws_client, msg: dict, entities: dict
) -> None:
    """Add/remove websocket mutations should roll back if the reload fails."""
    config_entry = await _setup_lightener(hass, entities)

    ws = await hass_ws_client(hass)
    with patch.object(hass.config_entries, "async_reload", return_value=False):
        await ws.send_json(msg)
        result = await ws.receive_json()

    assert result["success"] is False
    assert result["error"]["code"] == "reload_failed"

    updated_entry = hass.config_entries.async_get_entry(config_entry.entry_id)
    assert dict(updated_entry.data["entities"]) == entities


async def test_remove_light_rejects_last_light(
    hass: HomeAssistant, hass_ws_client
) -> None:
    """Test ws_remove_light refuses to remove the only remaining controlled light."""
    await _setup_lightener(
        hass,
        {"light.test1": {"brightness": {"100": "100"}}},
    )

    ws = await hass_ws_client(hass)
    await ws.send_json(
        {
            "id": 1,
            "type": "lightener/remove_light",
            "entity_id": "light.test",
            "controlled_entity_id": "light.test1",
        }
    )
    result = await ws.receive_json()

    assert result["success"] is False
    assert result["error"]["code"] == "last_light"


async def test_remove_light_rejects_unknown_entity(
    hass: HomeAssistant, hass_ws_client
) -> None:
    """Test ws_remove_light rejects entity ids not in the config entry."""
    await _setup_lightener(
        hass,
        {
            "light.test1": {"brightness": {"100": "100"}},
            "light.test2": {"brightness": {"100": "80"}},
        },
    )

    ws = await hass_ws_client(hass)
    await ws.send_json(
        {
            "id": 1,
            "type": "lightener/remove_light",
            "entity_id": "light.test",
            "controlled_entity_id": "light.not_here",
        }
    )
    result = await ws.receive_json()

    assert result["success"] is False
    assert result["error"]["code"] == "not_found"


async def test_remove_light_rejects_non_lightener_entity(
    hass: HomeAssistant, hass_ws_client
) -> None:
    """Test ws_remove_light refuses when the target entity is not a Lightener."""
    await _setup_lightener(hass)

    ws = await hass_ws_client(hass)
    await ws.send_json(
        {
            "id": 1,
            "type": "lightener/remove_light",
            "entity_id": "light.not_a_lightener",
            "controlled_entity_id": "light.test1",
        }
    )
    result = await ws.receive_json()

    assert result["success"] is False
    assert result["error"]["code"] == "not_found"


async def test_remove_light_requires_admin(
    hass: HomeAssistant, hass_ws_client, hass_admin_user
) -> None:
    """Test ws_remove_light rejects non-admin connections."""
    await _setup_lightener(
        hass,
        {
            "light.test1": {"brightness": {"100": "100"}},
            "light.test2": {"brightness": {"100": "80"}},
        },
    )
    hass_admin_user.groups = []

    ws = await hass_ws_client(hass)
    await ws.send_json(
        {
            "id": 1,
            "type": "lightener/remove_light",
            "entity_id": "light.test",
            "controlled_entity_id": "light.test1",
        }
    )
    result = await ws.receive_json()

    assert result["success"] is False
    assert result["error"]["code"] == "unauthorized"


async def test_add_light_reports_reload_failure(
    hass: HomeAssistant, hass_ws_client
) -> None:
    """ws_add_light surfaces reload_failed when async_reload returns False.

    The config entry data has already been updated by the time reload runs;
    if reload fails (unload or setup returns False) the handler must not
    silently report success.
    """
    await _setup_lightener(hass)

    ws = await hass_ws_client(hass)
    with patch.object(hass.config_entries, "async_reload", return_value=False):
        await ws.send_json(
            {
                "id": 1,
                "type": "lightener/add_light",
                "entity_id": "light.test",
                "controlled_entity_id": "light.test2",
            }
        )
        result = await ws.receive_json()

    assert result["success"] is False
    assert result["error"]["code"] == "reload_failed"


async def test_remove_light_reports_reload_failure(
    hass: HomeAssistant, hass_ws_client
) -> None:
    """ws_remove_light surfaces reload_failed when async_reload returns False."""
    await _setup_lightener(
        hass,
        {
            "light.test1": {"brightness": {"100": "100"}},
            "light.test2": {"brightness": {"100": "80"}},
        },
    )

    ws = await hass_ws_client(hass)
    with patch.object(hass.config_entries, "async_reload", return_value=False):
        await ws.send_json(
            {
                "id": 1,
                "type": "lightener/remove_light",
                "entity_id": "light.test",
                "controlled_entity_id": "light.test1",
            }
        )
        result = await ws.receive_json()

    assert result["success"] is False
    assert result["error"]["code"] == "reload_failed"


async def test_save_curves_uses_targeted_refresh_not_reload(
    hass: HomeAssistant, hass_ws_client
) -> None:
    """ws_save_curves updates curves in-place without triggering async_reload."""
    await _setup_lightener(
        hass,
        {"light.test1": {"brightness": {"60": "100", "10": "50"}}},
    )

    ws = await hass_ws_client(hass)
    with patch.object(
        hass.config_entries, "async_reload", new_callable=AsyncMock
    ) as mock_reload:
        await ws.send_json(
            {
                "id": 1,
                "type": "lightener/save_curves",
                "entity_id": "light.test",
                "curves": {"light.test1": {"brightness": {"20": "80"}}},
            }
        )
        result = await ws.receive_json()

    assert result["success"] is True
    mock_reload.assert_not_called()


# ---------------------------------------------------------------------------
# _connection_can_read_entity — exception fallback branches
# ---------------------------------------------------------------------------


def _make_connection_with_permission_check(check_fn):
    """Build a fake ActiveConnection whose user has a permissions.check_entity."""
    permissions = MagicMock()
    permissions.check_entity = check_fn
    user = MagicMock()
    user.is_admin = False
    user.permissions = permissions
    connection = MagicMock()
    connection.user = user
    return connection


def test_connection_can_read_entity_check_raises_type_error_then_succeeds():
    """TypeError on (entity_id, "read") falls back to ("read", entity_id)."""
    calls = []

    def check(a, b):
        """Record args; raise TypeError on first order, succeed on reversed."""
        calls.append((a, b))
        if (a, b) == ("light.test", "read"):
            raise TypeError("wrong arg order")
        return True  # reversed order succeeds

    connection = _make_connection_with_permission_check(check)
    assert _connection_can_read_entity(connection, "light.test") is True
    assert ("light.test", "read") in calls
    assert ("read", "light.test") in calls


def test_connection_can_read_entity_both_orders_raise():
    """If both argument orders raise, returns False."""

    def check(a, b):
        """Raise on both arg orders to force the False fallback path."""
        if (a, b) == ("light.test", "read"):
            raise TypeError("wrong arg order")
        raise RuntimeError("still broken")

    connection = _make_connection_with_permission_check(check)
    assert _connection_can_read_entity(connection, "light.test") is False


def test_connection_can_read_entity_non_type_error_returns_false():
    """A non-TypeError exception from check_entity returns False directly."""

    def check(a, b):
        """Raise a non-TypeError to exercise the catch-all False return."""
        raise ValueError("unexpected")

    connection = _make_connection_with_permission_check(check)
    assert _connection_can_read_entity(connection, "light.test") is False


# ---------------------------------------------------------------------------
# Entity list cache — cache-hit path
# ---------------------------------------------------------------------------


async def test_list_entities_cache_hit_does_not_rebuild(
    hass: HomeAssistant, hass_ws_client
) -> None:
    """Second call to ws_list_entities within TTL returns cached results."""
    await _setup_lightener(hass)

    ws = await hass_ws_client(hass)

    await ws.send_json({"id": 1, "type": "lightener/list_entities"})
    first = await ws.receive_json()
    assert first["success"] is True

    # Pre-populate the cache with a sentinel so we can confirm the second call
    # uses the cache rather than rebuilding from the registry.
    sentinel = [
        {
            "entity_id": "light.cached_sentinel",
            "name": "Sentinel",
            "config_entry_id": "x",
        }
    ]
    _set_entity_list_cache(hass, sentinel)

    await ws.send_json({"id": 2, "type": "lightener/list_entities"})
    second = await ws.receive_json()
    assert second["success"] is True
    # The cache was returned as-is (filtered to visible entities; admin sees all).
    assert any(
        e["entity_id"] == "light.cached_sentinel" for e in second["result"]["entities"]
    )


# ---------------------------------------------------------------------------
# _async_apply_config_entry_update — rollback paths
# ---------------------------------------------------------------------------


async def test_async_apply_config_entry_update_rolls_back_on_exception(
    hass: HomeAssistant,
) -> None:
    """apply_change raising an exception triggers a rollback to previous data."""
    config_entry = MockConfigEntry(
        domain=DOMAIN,
        unique_id=str(uuid4()),
        data={
            "friendly_name": "Test",
            "entities": {"light.test1": {"brightness": {"100": "100"}}},
        },
    )
    config_entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(config_entry.entry_id)
    await hass.async_block_till_done()

    original_data = dict(config_entry.data)
    new_data = {
        "friendly_name": "Test",
        "entities": {"light.test1": {"brightness": {"50": "50"}}},
    }

    async def boom() -> bool:
        """Raise during apply_change to drive the exception-rollback path."""
        raise RuntimeError("apply failed")

    with patch.object(hass.config_entries, "async_reload", return_value=True):
        result = await _async_apply_config_entry_update(
            hass, config_entry, new_data, boom
        )

    assert result is False
    restored = hass.config_entries.async_get_entry(config_entry.entry_id)
    assert dict(restored.data) == original_data


async def test_async_apply_config_entry_update_rolls_back_when_apply_returns_false(
    hass: HomeAssistant,
) -> None:
    """apply_change returning False triggers a rollback to previous data."""
    config_entry = MockConfigEntry(
        domain=DOMAIN,
        unique_id=str(uuid4()),
        data={
            "friendly_name": "Test",
            "entities": {"light.test1": {"brightness": {"100": "100"}}},
        },
    )
    config_entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(config_entry.entry_id)
    await hass.async_block_till_done()

    original_data = dict(config_entry.data)
    new_data = {
        "friendly_name": "Test",
        "entities": {"light.test1": {"brightness": {"50": "50"}}},
    }

    async def returns_false() -> bool:
        """Return False from apply_change to drive the False-return rollback."""
        return False

    with patch.object(hass.config_entries, "async_reload", return_value=True):
        result = await _async_apply_config_entry_update(
            hass, config_entry, new_data, returns_false
        )

    assert result is False
    restored = hass.config_entries.async_get_entry(config_entry.entry_id)
    assert dict(restored.data) == original_data


async def test_async_restore_config_entry_data_logs_on_reload_exception(
    hass: HomeAssistant,
) -> None:
    """_async_restore_config_entry_data logs and swallows a reload exception."""
    config_entry = MockConfigEntry(
        domain=DOMAIN,
        unique_id=str(uuid4()),
        data={"friendly_name": "Test", "entities": {}},
    )
    config_entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(config_entry.entry_id)
    await hass.async_block_till_done()

    previous_data = {
        "friendly_name": "Test",
        "entities": {"light.test1": {"brightness": {"100": "100"}}},
    }

    with (
        patch.object(
            hass.config_entries,
            "async_reload",
            side_effect=RuntimeError("reload blew up"),
        ),
        patch("custom_components.lightener.websocket._LOGGER") as mock_logger,
    ):
        # Should not raise — exception is caught and logged.
        await _async_restore_config_entry_data(hass, config_entry, previous_data)

    restored = hass.config_entries.async_get_entry(config_entry.entry_id)
    assert dict(restored.data) == previous_data
    # The "logs" half of the contract: assert the exception was actually logged.
    assert mock_logger.exception.called or mock_logger.warning.called


# ---------------------------------------------------------------------------
# ws_get_curves — unauthorized and missing config entry branches
# ---------------------------------------------------------------------------


async def test_get_curves_unauthorized_non_admin(
    hass: HomeAssistant, hass_ws_client
) -> None:
    """ws_get_curves returns unauthorized when _connection_can_read_entity is False."""
    await _setup_lightener(hass)

    ws = await hass_ws_client(hass)
    with patch(
        "custom_components.lightener.websocket._connection_can_read_entity",
        return_value=False,
    ):
        await ws.send_json(
            {
                "id": 1,
                "type": "lightener/get_curves",
                "entity_id": "light.test",
            }
        )
        result = await ws.receive_json()

    assert result["success"] is False
    assert result["error"]["code"] == "unauthorized"


async def test_get_curves_missing_config_entry(
    hass: HomeAssistant, hass_ws_client
) -> None:
    """ws_get_curves returns not_found when config entry has been removed."""
    config_entry = await _setup_lightener(hass)

    # Remove the config entry directly from hass without going through
    # the normal unload path so the entity registry entry still points to it.
    hass.config_entries._entries.pop(config_entry.entry_id)

    ws = await hass_ws_client(hass)
    await ws.send_json(
        {
            "id": 1,
            "type": "lightener/get_curves",
            "entity_id": "light.test",
        }
    )
    result = await ws.receive_json()

    assert result["success"] is False
    assert result["error"]["code"] == "not_found"


# ---------------------------------------------------------------------------
# _connection_can_read_entity — check_entity is None branch (line 43)
# ---------------------------------------------------------------------------


def test_connection_can_read_entity_returns_true_when_check_entity_is_none():
    """Non-admin user whose permissions object has no check_entity is allowed through."""
    permissions = MagicMock(spec=[])  # no check_entity attribute
    user = MagicMock()
    user.is_admin = False
    user.permissions = permissions
    connection = MagicMock()
    connection.user = user
    assert _connection_can_read_entity(connection, "light.test") is True


# ---------------------------------------------------------------------------
# _parse_curve_percent — unsupported type branch (lines 65, 77)
# ---------------------------------------------------------------------------


def test_parse_curve_percent_accepts_bare_integer():
    """A bare integer is returned as-is without conversion."""
    from custom_components.lightener.websocket import _parse_curve_percent

    assert _parse_curve_percent(42, "level") == 42


def test_parse_curve_percent_rejects_unsupported_type():
    """A list or other non-scalar type raises CurveValidationError."""
    from custom_components.lightener.websocket import (
        CurveValidationError,
        _parse_curve_percent,
    )

    with pytest.raises(CurveValidationError) as exc_info:
        _parse_curve_percent(["not", "a", "number"], "level")
    assert exc_info.value.metric_code == "non_numeric_curve_value"


# ---------------------------------------------------------------------------
# ws_save_curves — non-Lightener entity and missing config entry (lines 406-432)
# ---------------------------------------------------------------------------


async def test_save_curves_rejects_non_lightener_entity(
    hass: HomeAssistant, hass_ws_client
) -> None:
    """ws_save_curves returns not_found for an entity not owned by Lightener."""
    await _setup_lightener(hass)

    ws = await hass_ws_client(hass)
    # light.test1 is a controlled light, not a Lightener entity itself.
    await ws.send_json(
        {
            "id": 1,
            "type": "lightener/save_curves",
            "entity_id": "light.test1",
            "curves": {"light.test1": {"brightness": {"50": "50"}}},
        }
    )
    result = await ws.receive_json()

    assert result["success"] is False
    assert result["error"]["code"] == "not_found"


async def test_save_curves_missing_config_entry(
    hass: HomeAssistant, hass_ws_client
) -> None:
    """ws_save_curves returns not_found when the config entry no longer exists."""
    config_entry = await _setup_lightener(hass)

    hass.config_entries._entries.pop(config_entry.entry_id)

    ws = await hass_ws_client(hass)
    await ws.send_json(
        {
            "id": 1,
            "type": "lightener/save_curves",
            "entity_id": "light.test",
            "curves": {"light.test1": {"brightness": {"50": "50"}}},
        }
    )
    result = await ws.receive_json()

    assert result["success"] is False
    assert result["error"]["code"] == "not_found"


# ---------------------------------------------------------------------------
# _resolve_lightener_entry — config_entry is None path (line 547)
# ---------------------------------------------------------------------------


async def test_add_light_missing_config_entry(
    hass: HomeAssistant, hass_ws_client
) -> None:
    """ws_add_light returns not_found when the config entry no longer exists."""
    config_entry = await _setup_lightener(hass)

    hass.config_entries._entries.pop(config_entry.entry_id)

    ws = await hass_ws_client(hass)
    await ws.send_json(
        {
            "id": 1,
            "type": "lightener/add_light",
            "entity_id": "light.test",
            "controlled_entity_id": "light.test2",
        }
    )
    result = await ws.receive_json()

    assert result["success"] is False
    assert result["error"]["code"] == "not_found"


async def test_remove_light_missing_config_entry(
    hass: HomeAssistant, hass_ws_client
) -> None:
    """ws_remove_light returns not_found when the config entry no longer exists."""
    config_entry = await _setup_lightener(
        hass,
        {
            "light.test1": {"brightness": {"100": "100"}},
            "light.test2": {"brightness": {"100": "80"}},
        },
    )

    hass.config_entries._entries.pop(config_entry.entry_id)

    ws = await hass_ws_client(hass)
    await ws.send_json(
        {
            "id": 1,
            "type": "lightener/remove_light",
            "entity_id": "light.test",
            "controlled_entity_id": "light.test1",
        }
    )
    result = await ws.receive_json()

    assert result["success"] is False
    assert result["error"]["code"] == "not_found"
