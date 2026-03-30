"""WebSocket API for Lightener curve editor."""

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity_registry import async_get as async_get_entity_registry

from .const import DOMAIN


def async_register_commands(hass: HomeAssistant) -> None:
    """Register WebSocket commands."""
    websocket_api.async_register_command(hass, ws_get_curves)
    websocket_api.async_register_command(hass, ws_save_curves)


@websocket_api.websocket_command(
    {
        vol.Required("type"): "lightener/get_curves",
        vol.Required("entity_id"): str,
    }
)
# Read access is intentionally not admin-gated: curve data is not sensitive,
# and non-admin users need to see curves on their dashboards.
@callback
def ws_get_curves(hass, connection, msg):
    """Return brightness curves for a Lightener entity."""
    entity_id = msg["entity_id"]

    # Find the config entry for this entity
    entity_registry = async_get_entity_registry(hass)
    entry = entity_registry.async_get(entity_id)

    if entry is None or entry.platform != DOMAIN:
        connection.send_error(
            msg["id"], "not_found", f"Entity {entity_id} is not a Lightener entity"
        )
        return

    config_entry = hass.config_entries.async_get_entry(entry.config_entry_id)
    if config_entry is None:
        connection.send_error(msg["id"], "not_found", "Config entry not found")
        return

    entities = config_entry.data.get("entities", {})

    connection.send_result(msg["id"], {"entities": entities})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "lightener/save_curves",
        vol.Required("entity_id"): str,
        vol.Required("curves"): dict,
    }
)
@websocket_api.async_response
async def ws_save_curves(hass, connection, msg):
    """Save brightness curves for a Lightener entity."""
    entity_id = msg["entity_id"]
    curves = msg["curves"]

    # Find the config entry
    entity_registry = async_get_entity_registry(hass)
    entry = entity_registry.async_get(entity_id)

    if entry is None or entry.platform != DOMAIN:
        connection.send_error(
            msg["id"],
            "not_found",
            f"Entity {entity_id} is not a Lightener entity",
        )
        return

    config_entry = hass.config_entries.async_get_entry(entry.config_entry_id)
    if config_entry is None:
        connection.send_error(msg["id"], "not_found", "Config entry not found")
        return

    # Validate curves
    for _controlled_entity_id, entity_data in curves.items():
        brightness = entity_data.get("brightness", {})
        for k, v in brightness.items():
            try:
                key = int(k)
                value = int(v)
            except (ValueError, TypeError):
                connection.send_error(
                    msg["id"],
                    "invalid_format",
                    f"Brightness values must be numeric: {k}: {v}",
                )
                return

            if key < 1 or key > 100:
                connection.send_error(
                    msg["id"],
                    "invalid_format",
                    f"Brightness level must be 1-100, got {key}",
                )
                return
            if value < 0 or value > 100:
                connection.send_error(
                    msg["id"],
                    "invalid_format",
                    f"Brightness value must be 0-100, got {value}",
                )
                return

    # Update config entry data
    new_data = dict(config_entry.data)
    new_entities = dict(new_data.get("entities", {}))

    # Reject unknown entity IDs instead of silently dropping them
    unknown = [eid for eid in curves if eid not in new_entities]
    if unknown:
        connection.send_error(
            msg["id"], "unknown_entities", f"Unknown entity IDs: {unknown}"
        )
        return

    for controlled_entity_id, entity_data in curves.items():
        if controlled_entity_id in new_entities:
            new_entity = dict(new_entities[controlled_entity_id])
            # Ensure all keys and values are strings
            new_entity["brightness"] = {
                str(k): str(v) for k, v in entity_data.get("brightness", {}).items()
            }
            new_entities[controlled_entity_id] = new_entity

    new_data["entities"] = new_entities

    hass.config_entries.async_update_entry(config_entry, data=new_data)
    await hass.config_entries.async_reload(config_entry.entry_id)

    connection.send_result(msg["id"])
