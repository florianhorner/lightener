"""WebSocket API for Lightener curve editor."""

import logging
from time import monotonic

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity_registry import async_get as async_get_entity_registry

from .const import CURVE_PRESETS, DEFAULT_CURVE_PRESET, DOMAIN
from .observability import end_span, entity_ref, log_event, metric, start_span

_LOGGER = logging.getLogger(__name__)


def async_register_commands(hass: HomeAssistant) -> None:
    """Register WebSocket commands."""
    websocket_api.async_register_command(hass, ws_get_curves)
    websocket_api.async_register_command(hass, ws_save_curves)
    websocket_api.async_register_command(hass, ws_list_entities)
    websocket_api.async_register_command(hass, ws_add_light)
    websocket_api.async_register_command(hass, ws_remove_light)


@websocket_api.websocket_command(
    {
        vol.Required("type"): "lightener/get_curves",
        vol.Required("entity_id"): str,
    }
)
# Read access is intentionally not admin-gated: curve data is not sensitive,
# and non-admin users need to see curves on their dashboards.
@callback
def ws_get_curves(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Return brightness curves for a Lightener entity."""
    entity_id = msg["entity_id"]
    op_started = monotonic()
    span = start_span(
        _LOGGER,
        "lightener.ws.get_curves",
        message_id=msg["id"],
        lightener_entity_ref=entity_ref(entity_id),
    )

    # Find the config entry for this entity
    entity_registry = async_get_entity_registry(hass)
    entry = entity_registry.async_get(entity_id)

    if entry is None or entry.platform != DOMAIN:
        metric(
            _LOGGER,
            "lightener.ws.get_curves.not_found_total",
            "counter",
            1,
        )
        log_event(
            _LOGGER,
            logging.WARNING,
            "lightener.ws.get_curves.not_found",
            trace_id=span.trace_id,
            span_id=span.span_id,
            lightener_entity_ref=entity_ref(entity_id),
        )
        end_span(_LOGGER, span, status="error", error_code="not_found")
        connection.send_error(
            msg["id"], "not_found", f"Entity {entity_id} is not a Lightener entity"
        )
        return

    config_entry = hass.config_entries.async_get_entry(entry.config_entry_id)
    if config_entry is None:
        metric(
            _LOGGER,
            "lightener.ws.get_curves.not_found_total",
            "counter",
            1,
            cause="missing_config_entry",
        )
        end_span(_LOGGER, span, status="error", error_code="missing_config_entry")
        connection.send_error(msg["id"], "not_found", "Config entry not found")
        return

    entities = config_entry.data.get("entities", {})
    duration_ms = (monotonic() - op_started) * 1000

    connection.send_result(msg["id"], {"entities": entities})
    metric(
        _LOGGER,
        "lightener.ws.get_curves.duration_ms",
        "histogram",
        round(duration_ms, 2),
    )
    metric(
        _LOGGER,
        "lightener.ws.get_curves.entities_returned",
        "gauge",
        len(entities),
    )
    end_span(
        _LOGGER,
        span,
        status="ok",
        entities_returned=len(entities),
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): "lightener/list_entities",
    }
)
@callback
def ws_list_entities(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Return all Lightener light entities.

    Access control: intentionally not admin-restricted. The sidebar panel uses this
    endpoint with require_admin=False so non-admin users can view curves in read-only
    mode. The config_entry_id field is included because the panel filters by it when
    opened from a specific config entry context. This data (entity IDs, friendly names,
    config entry IDs) is already accessible to any authenticated user via HA's own
    config/config_entries/get websocket endpoint.
    """
    op_started = monotonic()
    span = start_span(_LOGGER, "lightener.ws.list_entities", message_id=msg["id"])
    entity_registry = async_get_entity_registry(hass)
    entities = []

    for entry in entity_registry.entities.values():
        if entry.platform != DOMAIN or entry.domain != "light":
            continue

        state = hass.states.get(entry.entity_id)
        friendly_name = (
            state.attributes.get("friendly_name")
            if state is not None
            else entry.original_name or entry.entity_id
        )

        entities.append(
            {
                "entity_id": entry.entity_id,
                "name": friendly_name or entry.entity_id,
                "config_entry_id": entry.config_entry_id,
            }
        )

    entities.sort(key=lambda item: item["name"])
    connection.send_result(msg["id"], {"entities": entities})
    duration_ms = (monotonic() - op_started) * 1000
    metric(
        _LOGGER,
        "lightener.ws.list_entities.duration_ms",
        "histogram",
        round(duration_ms, 2),
    )
    metric(
        _LOGGER,
        "lightener.ws.list_entities.returned",
        "gauge",
        len(entities),
    )
    end_span(
        _LOGGER,
        span,
        status="ok",
        returned_entities=len(entities),
    )


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "lightener/save_curves",
        vol.Required("entity_id"): str,
        vol.Required("curves"): dict,
    }
)
@websocket_api.async_response
async def ws_save_curves(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Save brightness curves for a Lightener entity."""
    entity_id = msg["entity_id"]
    curves = msg["curves"]
    op_started = monotonic()
    span = start_span(
        _LOGGER,
        "lightener.ws.save_curves",
        message_id=msg["id"],
        lightener_entity_ref=entity_ref(entity_id),
        input_curve_entities=len(curves),
    )
    metric(_LOGGER, "lightener.ws.save_curves.requests_total", "counter", 1)

    # Find the config entry
    entity_registry = async_get_entity_registry(hass)
    entry = entity_registry.async_get(entity_id)

    if entry is None or entry.platform != DOMAIN:
        metric(
            _LOGGER,
            "lightener.ws.save_curves.validation_errors_total",
            "counter",
            1,
            error_code="not_found",
        )
        end_span(_LOGGER, span, status="error", error_code="not_found")
        connection.send_error(
            msg["id"],
            "not_found",
            f"Entity {entity_id} is not a Lightener entity",
        )
        return

    config_entry = hass.config_entries.async_get_entry(entry.config_entry_id)
    if config_entry is None:
        metric(
            _LOGGER,
            "lightener.ws.save_curves.validation_errors_total",
            "counter",
            1,
            error_code="missing_config_entry",
        )
        end_span(_LOGGER, span, status="error", error_code="missing_config_entry")
        connection.send_error(msg["id"], "not_found", "Config entry not found")
        return

    # Validate curves
    for controlled_entity_id, entity_data in curves.items():
        if not isinstance(entity_data, dict):
            metric(
                _LOGGER,
                "lightener.ws.save_curves.validation_errors_total",
                "counter",
                1,
                error_code="invalid_entity_payload",
            )
            connection.send_error(
                msg["id"],
                "invalid_format",
                f"Curve payload for {controlled_entity_id} must be an object",
            )
            end_span(
                _LOGGER,
                span,
                status="error",
                error_code="invalid_entity_payload",
            )
            return
        brightness = entity_data.get("brightness", {})
        if not isinstance(brightness, dict):
            metric(
                _LOGGER,
                "lightener.ws.save_curves.validation_errors_total",
                "counter",
                1,
                error_code="invalid_brightness_payload",
            )
            connection.send_error(
                msg["id"],
                "invalid_format",
                f"Brightness payload for {controlled_entity_id} must be an object",
            )
            end_span(
                _LOGGER,
                span,
                status="error",
                error_code="invalid_brightness_payload",
            )
            return
        for k, v in brightness.items():
            try:
                key = int(k)
                value = int(v)
            except (ValueError, TypeError):
                metric(
                    _LOGGER,
                    "lightener.ws.save_curves.validation_errors_total",
                    "counter",
                    1,
                    error_code="non_numeric_curve_value",
                )
                connection.send_error(
                    msg["id"],
                    "invalid_format",
                    f"Brightness values must be numeric: {k}: {v}",
                )
                end_span(
                    _LOGGER,
                    span,
                    status="error",
                    error_code="non_numeric_curve_value",
                )
                return

            if key < 1 or key > 100:
                metric(
                    _LOGGER,
                    "lightener.ws.save_curves.validation_errors_total",
                    "counter",
                    1,
                    error_code="curve_level_out_of_range",
                )
                connection.send_error(
                    msg["id"],
                    "invalid_format",
                    f"Brightness level must be 1-100, got {key}",
                )
                end_span(
                    _LOGGER,
                    span,
                    status="error",
                    error_code="curve_level_out_of_range",
                )
                return
            if value < 0 or value > 100:
                metric(
                    _LOGGER,
                    "lightener.ws.save_curves.validation_errors_total",
                    "counter",
                    1,
                    error_code="curve_value_out_of_range",
                )
                connection.send_error(
                    msg["id"],
                    "invalid_format",
                    f"Brightness value must be 0-100, got {value}",
                )
                end_span(
                    _LOGGER,
                    span,
                    status="error",
                    error_code="curve_value_out_of_range",
                )
                return

    # Update config entry data
    new_data = dict(config_entry.data)
    new_entities = dict(new_data.get("entities", {}))

    # Reject unknown entity IDs instead of silently dropping them
    unknown = [eid for eid in curves if eid not in new_entities]
    if unknown:
        metric(
            _LOGGER,
            "lightener.ws.save_curves.validation_errors_total",
            "counter",
            1,
            error_code="unknown_entities",
        )
        log_event(
            _LOGGER,
            logging.WARNING,
            "lightener.ws.save_curves.unknown_entities",
            trace_id=span.trace_id,
            span_id=span.span_id,
            unknown_entities_count=len(unknown),
        )
        connection.send_error(
            msg["id"], "unknown_entities", f"Unknown entity IDs: {unknown}"
        )
        end_span(_LOGGER, span, status="error", error_code="unknown_entities")
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
    duration_ms = (monotonic() - op_started) * 1000
    metric(
        _LOGGER,
        "lightener.ws.save_curves.duration_ms",
        "histogram",
        round(duration_ms, 2),
    )
    metric(
        _LOGGER,
        "lightener.ws.save_curves.updated_entities",
        "gauge",
        len(curves),
    )
    log_event(
        _LOGGER,
        logging.INFO,
        "lightener.ws.save_curves.success",
        trace_id=span.trace_id,
        span_id=span.span_id,
        updated_entities=len(curves),
        duration_ms=round(duration_ms, 2),
    )
    end_span(
        _LOGGER,
        span,
        status="ok",
        updated_entities=len(curves),
    )


def _resolve_lightener_entry(hass: HomeAssistant, entity_id: str):
    """Return (entry, config_entry) for a Lightener entity, or (None, None) if invalid."""
    entity_registry = async_get_entity_registry(hass)
    entry = entity_registry.async_get(entity_id)
    if entry is None or entry.platform != DOMAIN:
        return None, None
    config_entry = hass.config_entries.async_get_entry(entry.config_entry_id)
    if config_entry is None:
        return entry, None
    return entry, config_entry


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "lightener/add_light",
        vol.Required("entity_id"): str,
        vol.Required("controlled_entity_id"): str,
        vol.Optional("preset"): str,
    }
)
@websocket_api.async_response
async def ws_add_light(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Add a controlled light to a Lightener entity with a default curve."""
    entity_id = msg["entity_id"]
    controlled_entity_id = msg["controlled_entity_id"]
    preset_id = msg.get("preset", DEFAULT_CURVE_PRESET)
    op_started = monotonic()
    span = start_span(
        _LOGGER,
        "lightener.ws.add_light",
        message_id=msg["id"],
        lightener_entity_ref=entity_ref(entity_id),
        controlled_entity_ref=entity_ref(controlled_entity_id),
    )
    metric(_LOGGER, "lightener.ws.add_light.requests_total", "counter", 1)

    entry, config_entry = _resolve_lightener_entry(hass, entity_id)
    if entry is None or entry.platform != DOMAIN:
        metric(
            _LOGGER,
            "lightener.ws.add_light.validation_errors_total",
            "counter",
            1,
            error_code="not_found",
        )
        end_span(_LOGGER, span, status="error", error_code="not_found")
        connection.send_error(
            msg["id"], "not_found", f"Entity {entity_id} is not a Lightener entity"
        )
        return
    if config_entry is None:
        end_span(_LOGGER, span, status="error", error_code="missing_config_entry")
        connection.send_error(msg["id"], "not_found", "Config entry not found")
        return

    # Validate the light to add
    if not controlled_entity_id.startswith("light."):
        connection.send_error(
            msg["id"],
            "invalid_format",
            f"{controlled_entity_id} is not a light entity",
        )
        end_span(_LOGGER, span, status="error", error_code="not_a_light")
        return

    if controlled_entity_id == entity_id:
        connection.send_error(
            msg["id"],
            "invalid_format",
            "Cannot add a Lightener to itself",
        )
        end_span(_LOGGER, span, status="error", error_code="self_reference")
        return

    # Note: nested Lighteners (one Lightener controlling another) are allowed here,
    # matching the config flow's behaviour. The setup wizard only excludes the
    # current Lightener from the picker, not other Lighteners.

    if preset_id not in CURVE_PRESETS:
        connection.send_error(
            msg["id"],
            "invalid_format",
            f"Unknown preset: {preset_id}",
        )
        end_span(_LOGGER, span, status="error", error_code="unknown_preset")
        return

    new_data = dict(config_entry.data)
    new_entities = dict(new_data.get("entities", {}))

    if controlled_entity_id in new_entities:
        connection.send_error(
            msg["id"],
            "already_exists",
            f"{controlled_entity_id} is already controlled by this Lightener",
        )
        end_span(_LOGGER, span, status="error", error_code="already_exists")
        return

    new_entities[controlled_entity_id] = {"brightness": dict(CURVE_PRESETS[preset_id])}
    new_data["entities"] = new_entities

    hass.config_entries.async_update_entry(config_entry, data=new_data)
    await hass.config_entries.async_reload(config_entry.entry_id)

    connection.send_result(msg["id"], {"entities": new_entities})
    duration_ms = (monotonic() - op_started) * 1000
    metric(
        _LOGGER,
        "lightener.ws.add_light.duration_ms",
        "histogram",
        round(duration_ms, 2),
    )
    log_event(
        _LOGGER,
        logging.INFO,
        "lightener.ws.add_light.success",
        trace_id=span.trace_id,
        span_id=span.span_id,
        duration_ms=round(duration_ms, 2),
        total_entities=len(new_entities),
    )
    end_span(
        _LOGGER,
        span,
        status="ok",
        total_entities=len(new_entities),
    )


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "lightener/remove_light",
        vol.Required("entity_id"): str,
        vol.Required("controlled_entity_id"): str,
    }
)
@websocket_api.async_response
async def ws_remove_light(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Remove a controlled light from a Lightener entity."""
    entity_id = msg["entity_id"]
    controlled_entity_id = msg["controlled_entity_id"]
    op_started = monotonic()
    span = start_span(
        _LOGGER,
        "lightener.ws.remove_light",
        message_id=msg["id"],
        lightener_entity_ref=entity_ref(entity_id),
        controlled_entity_ref=entity_ref(controlled_entity_id),
    )
    metric(_LOGGER, "lightener.ws.remove_light.requests_total", "counter", 1)

    entry, config_entry = _resolve_lightener_entry(hass, entity_id)
    if entry is None or entry.platform != DOMAIN:
        metric(
            _LOGGER,
            "lightener.ws.remove_light.validation_errors_total",
            "counter",
            1,
            error_code="not_found",
        )
        end_span(_LOGGER, span, status="error", error_code="not_found")
        connection.send_error(
            msg["id"], "not_found", f"Entity {entity_id} is not a Lightener entity"
        )
        return
    if config_entry is None:
        end_span(_LOGGER, span, status="error", error_code="missing_config_entry")
        connection.send_error(msg["id"], "not_found", "Config entry not found")
        return

    new_data = dict(config_entry.data)
    new_entities = dict(new_data.get("entities", {}))

    if controlled_entity_id not in new_entities:
        connection.send_error(
            msg["id"],
            "not_found",
            f"{controlled_entity_id} is not controlled by this Lightener",
        )
        end_span(_LOGGER, span, status="error", error_code="not_controlled")
        return

    if len(new_entities) <= 1:
        connection.send_error(
            msg["id"],
            "last_light",
            "Cannot remove the last light. Delete the Lightener entity instead.",
        )
        end_span(_LOGGER, span, status="error", error_code="last_light")
        return

    del new_entities[controlled_entity_id]
    new_data["entities"] = new_entities

    hass.config_entries.async_update_entry(config_entry, data=new_data)
    await hass.config_entries.async_reload(config_entry.entry_id)

    connection.send_result(msg["id"], {"entities": new_entities})
    duration_ms = (monotonic() - op_started) * 1000
    metric(
        _LOGGER,
        "lightener.ws.remove_light.duration_ms",
        "histogram",
        round(duration_ms, 2),
    )
    log_event(
        _LOGGER,
        logging.INFO,
        "lightener.ws.remove_light.success",
        trace_id=span.trace_id,
        span_id=span.span_id,
        duration_ms=round(duration_ms, 2),
        total_entities=len(new_entities),
    )
    end_span(
        _LOGGER,
        span,
        status="ok",
        total_entities=len(new_entities),
    )
