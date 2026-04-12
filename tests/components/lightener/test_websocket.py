"""Tests for WebSocket API."""

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
