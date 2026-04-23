"""Tests for WebSocket API."""

from unittest.mock import patch
from uuid import uuid4

from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.lightener.const import DOMAIN


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


async def test_save_curves_validates_range(hass: HomeAssistant, hass_ws_client) -> None:
    """Test ws_save_curves rejects out-of-range brightness values."""
    await _setup_lightener(hass)

    ws = await hass_ws_client(hass)

    # Key out of range (0 is below minimum of 1)
    await ws.send_json(
        {
            "id": 1,
            "type": "lightener/save_curves",
            "entity_id": "light.test",
            "curves": {
                "light.test1": {
                    "brightness": {"0": "50"},
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
            "controlled_entity_id": "light.new_light",
        }
    )
    result = await ws.receive_json()

    assert result["success"] is True
    assert "light.new_light" in result["result"]["entities"]

    updated_entry = hass.config_entries.async_get_entry(config_entry.entry_id)
    assert "light.new_light" in updated_entry.data["entities"]
    # Default preset is linear: 1->1, 100->100
    assert updated_entry.data["entities"]["light.new_light"]["brightness"] == {
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
            "controlled_entity_id": "light.new_light",
            "preset": "night_mode",
        }
    )
    result = await ws.receive_json()

    assert result["success"] is True
    assert result["result"]["entities"]["light.new_light"]["brightness"] == {
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
                "controlled_entity_id": "light.new_light",
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
    from unittest.mock import AsyncMock, patch

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
