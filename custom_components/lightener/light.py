"""Platform for Lightener lights."""

from __future__ import annotations

import asyncio
import logging
from time import monotonic
from types import MappingProxyType
from typing import Any

import homeassistant.helpers.config_validation as cv
import voluptuous as vol
from homeassistant.components.group.light import FORWARDED_ATTRIBUTES, LightGroup
from homeassistant.components.light import (
    ATTR_BRIGHTNESS,
    ATTR_TRANSITION,
    ColorMode,
)
from homeassistant.components.light import DOMAIN as LIGHT_DOMAIN
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import (
    ATTR_ENTITY_ID,
    CONF_ENTITIES,
    CONF_FRIENDLY_NAME,
    CONF_LIGHTS,
    SERVICE_TURN_OFF,
    SERVICE_TURN_ON,
    STATE_ON,
)
from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers.config_validation import PLATFORM_SCHEMA
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.typing import ConfigType, DiscoveryInfoType

from . import async_migrate_data
from .brightness import (
    build_brightness_maps,
    create_brightness_map,
    create_reverse_brightness_map,
    create_reverse_brightness_map_on_off,
    prepare_brightness_config,
    scale_ranged_value_to_int_range,
    translate_config_to_brightness,
)
from .const import DOMAIN, TYPE_ONOFF
from .observability import end_span, entity_ref, log_event, metric, start_span
from .util import get_light_type

# Re-exports so existing callers and tests that reference
# ``custom_components.lightener.light.<helper>`` continue to resolve.
# The ``@lru_cache`` decorator is applied once in ``brightness.py``; this
# module binds the same object — do not re-decorate.
__all__ = [
    "LightenerControlledLight",
    "LightenerLight",
    "async_setup_entry",
    "async_setup_platform",
    "build_brightness_maps",
    "create_brightness_map",
    "create_reverse_brightness_map",
    "create_reverse_brightness_map_on_off",
    "prepare_brightness_config",
    "scale_ranged_value_to_int_range",
    "translate_config_to_brightness",
]

_LOGGER = logging.getLogger(__name__)

ENTITY_SCHEMA = vol.All(
    vol.DefaultTo({1: 1, 100: 100}),
    {
        vol.All(vol.Coerce(int), vol.Range(min=1, max=100)): vol.All(
            vol.Coerce(int), vol.Range(min=0, max=100)
        )
    },
)

LIGHT_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_ENTITIES): {cv.entity_id: ENTITY_SCHEMA},
        vol.Optional(CONF_FRIENDLY_NAME): cv.string,
    }
)

PLATFORM_SCHEMA = PLATFORM_SCHEMA.extend(
    {vol.Required(CONF_LIGHTS): cv.schema_with_slug_keys(LIGHT_SCHEMA)}
)


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up entities for config entries."""
    unique_id = config_entry.entry_id

    entity = LightenerLight(hass, config_entry.data, unique_id)
    # Store a reference so ws_save_curves can do a targeted curve refresh
    # without triggering a full config entry reload.
    hass.data.setdefault(DOMAIN, {})[config_entry.entry_id] = entity
    async_add_entities([entity])


async def async_setup_platform(
    hass: HomeAssistant,
    config: ConfigType,
    async_add_entities: AddEntitiesCallback,
    discovery_info: DiscoveryInfoType | None = None,  # pylint: disable=unused-argument
) -> None:
    """Set up entities for configuration.yaml entries."""

    lights = []

    for object_id, entity_config in config[CONF_LIGHTS].items():
        data = dict(await async_migrate_data(entity_config, 1))
        data["entity_id"] = object_id

        lights.append(LightenerLight(hass, data))

    async_add_entities(lights)


class LightenerLight(LightGroup):
    """Represents a Lightener light."""

    _is_frozen = False
    _prefered_brightness = None

    def __init__(
        self,
        hass: HomeAssistant,
        config_data: MappingProxyType,
        unique_id: str | None = None,
    ) -> None:
        """Initialize the light using the config entry information."""

        ## Add all entities that are managed by this lightened.
        entities: list[LightenerControlledLight] = []
        entity_ids: list[str] = []

        if config_data.get(CONF_ENTITIES) is not None:
            for entity_id, entity_config in config_data[CONF_ENTITIES].items():
                entity_ids.append(entity_id)
                entities.append(
                    LightenerControlledLight(entity_id, entity_config, hass=hass)
                )

        super().__init__(
            unique_id=unique_id,
            name=config_data[CONF_FRIENDLY_NAME] if unique_id is None else None,
            entity_ids=entity_ids,
            mode=None,
        )

        self._attr_has_entity_name = unique_id is not None

        if self._attr_has_entity_name:
            self._attr_device_info = DeviceInfo(
                identifiers={(DOMAIN, self.unique_id)},
                name=config_data[CONF_FRIENDLY_NAME],
            )

        self._entities = entities
        self._entities_by_id = {entity.entity_id: entity for entity in entities}

        _LOGGER.debug(
            "Created lightener `%s`",
            config_data[CONF_FRIENDLY_NAME],
        )

    def reload_curves(self, entities_data: dict) -> None:
        """Update brightness curve maps in-place without a full platform reload.

        Called by ws_save_curves when only curve data changes (no entity add/remove).
        """
        new_entities = []
        new_entities_by_id = {}
        for entity_id, entity_config in entities_data.items():
            controlled = LightenerControlledLight(
                entity_id, entity_config, hass=self.hass
            )
            new_entities.append(controlled)
            new_entities_by_id[entity_id] = controlled
        self._entities = new_entities
        self._entities_by_id = new_entities_by_id

    @property
    def color_mode(self) -> str | None:
        """Return the color mode of the light."""

        if not self.is_on:
            return None

        # If the controlled lights are on/off only, we force the color mode to BRIGHTNESS
        # since Lightner always support it.
        if self._attr_color_mode == ColorMode.ONOFF:
            return ColorMode.BRIGHTNESS

        # The group may calculate the color mode as UNKNOWN if any of the controlled lights is UNKNOWN.
        # We don't want that, so we force it to BRIGHTNESS.
        if self._attr_color_mode == ColorMode.UNKNOWN:
            return ColorMode.BRIGHTNESS

        return self._attr_color_mode

    @property
    def supported_color_modes(self) -> set[str] | None:
        """Flag supported color modes."""

        color_modes = super().supported_color_modes or set()

        # We support BRIGHNESS if the controlled lights are not on/off only.
        color_modes.discard(ColorMode.ONOFF)

        if len(color_modes) == 0:
            # As a minimum, we support the current color mode, or default to BRIGHTNESS.
            if (
                self.color_mode
                and self.color_mode != ColorMode.UNKNOWN
                and self.color_mode != ColorMode.ONOFF
            ):
                color_modes.add(self.color_mode)
            else:
                color_modes.add(ColorMode.BRIGHTNESS)

        return color_modes

    async def async_turn_on(self, **kwargs: Any) -> None:
        """Forward the turn_on command to all controlled lights."""

        # This is basically a copy of LightGroup::async_turn_on but it has been changed
        # so we can pass different brightness to each light.

        # List all attributes we want to forward.
        data = {
            key: value for key, value in kwargs.items() if key in FORWARDED_ATTRIBUTES
        }

        # Retrieve the brightness being set to the Lightener
        brightness = kwargs.get(ATTR_BRIGHTNESS)

        # If the brightness is not being set, check if it was set in the Lightener.
        if brightness is None and self._attr_brightness:
            brightness = self._attr_brightness
        else:
            # Update the Lightener brightness level to the one being set.
            self._attr_brightness = brightness

        if brightness is None:
            brightness = self._prefered_brightness
        else:
            self._prefered_brightness = brightness

        operation_start = monotonic()
        root_span = start_span(
            _LOGGER,
            "lightener.turn_on",
            lightener_entity_ref=entity_ref(self.entity_id or "unknown"),
            managed_entities=len(self._entities),
            requested_brightness=brightness,
        )

        metric(
            _LOGGER,
            "lightener.turn_on.requests_total",
            "counter",
            1,
            lightener_entity_ref=entity_ref(self.entity_id or "unknown"),
        )
        metric(
            _LOGGER,
            "lightener.turn_on.target_entities",
            "gauge",
            len(self._entities),
            lightener_entity_ref=entity_ref(self.entity_id or "unknown"),
        )
        log_event(
            _LOGGER,
            logging.INFO,
            "lightener.turn_on.start",
            trace_id=root_span.trace_id,
            span_id=root_span.span_id,
            lightener_entity_ref=entity_ref(self.entity_id or "unknown"),
            managed_entities=len(self._entities),
            requested_brightness=brightness,
        )

        self._is_frozen = True
        service_failures = 0
        operation_error: Exception | None = None

        async def _safe_service_call(
            entity: LightenerControlledLight, service: str, entity_data: dict
        ) -> None:
            """Call a service for an entity, logging success and guarding failures."""
            nonlocal service_failures
            child_span = (
                start_span(
                    _LOGGER,
                    "lightener.turn_on.service_call",
                    trace_id=root_span.trace_id,
                    parent_span_id=root_span.span_id,
                    sampled=root_span.sampled,
                    service=service,
                    controlled_entity_ref=entity_ref(entity.entity_id),
                )
                if root_span.sampled
                else root_span
            )
            call_started = monotonic()
            try:
                await self.hass.services.async_call(
                    LIGHT_DOMAIN,
                    service,
                    entity_data,
                    blocking=True,
                    context=self._context,
                )
                duration_ms = (monotonic() - call_started) * 1000
                metric(
                    _LOGGER,
                    "lightener.turn_on.service_call.duration_ms",
                    "histogram",
                    round(duration_ms, 2),
                    service=service,
                )
                log_event(
                    _LOGGER,
                    logging.DEBUG,
                    "lightener.turn_on.service_call.success",
                    trace_id=root_span.trace_id,
                    span_id=child_span.span_id,
                    service=service,
                    controlled_entity_ref=entity_ref(entity.entity_id),
                    controlled_light_type=entity.type,
                    duration_ms=round(duration_ms, 2),
                )
                end_span(
                    _LOGGER,
                    child_span,
                    status="ok",
                    controlled_entity_ref=entity_ref(entity.entity_id),
                )
            except Exception as exc:
                service_failures += 1
                metric(
                    _LOGGER,
                    "lightener.turn_on.service_call.failures_total",
                    "counter",
                    1,
                    service=service,
                )
                log_event(
                    _LOGGER,
                    logging.ERROR,
                    "lightener.turn_on.service_call.failure",
                    trace_id=root_span.trace_id,
                    span_id=child_span.span_id,
                    service=service,
                    controlled_entity_ref=entity_ref(entity.entity_id),
                    controlled_light_type=entity.type,
                    error_type=type(exc).__name__,
                )
                _LOGGER.exception("lightener service call failure")
                end_span(
                    _LOGGER,
                    child_span,
                    status="error",
                    controlled_entity_ref=entity_ref(entity.entity_id),
                    error_type=type(exc).__name__,
                )

        try:
            async with asyncio.TaskGroup() as group:
                for entity in self._entities:
                    service = SERVICE_TURN_ON
                    entity_brightness = None

                    # If the brightness is being set in the lightener, translate it to the entity level.
                    if brightness is not None:
                        entity_brightness = entity.translate_brightness(brightness)

                    # If the light brightness level is zero, we turn it off instead.
                    if entity_brightness == 0:
                        service = SERVICE_TURN_OFF
                        entity_data = {}

                        # "Transition" is the only additional data allowed with the turn_off service.
                        if ATTR_TRANSITION in data:
                            entity_data[ATTR_TRANSITION] = data[ATTR_TRANSITION]
                    else:
                        # Make a copy of the data being sent to the lightener call so we can modify it.
                        entity_data = data.copy()

                        # Set the translated brightness level.
                        if brightness is not None:
                            entity_data[ATTR_BRIGHTNESS] = entity_brightness

                    # Set the proper entity ID.
                    entity_data[ATTR_ENTITY_ID] = entity.entity_id

                    # Submit the service call concurrently, guarded to avoid cancelling siblings on failure.
                    group.create_task(_safe_service_call(entity, service, entity_data))
        except Exception as exc:
            operation_error = exc
            raise
        finally:
            self._is_frozen = False

            duration_ms = (monotonic() - operation_start) * 1000
            metric(
                _LOGGER,
                "lightener.turn_on.duration_ms",
                "histogram",
                round(duration_ms, 2),
                lightener_entity_ref=entity_ref(self.entity_id or "unknown"),
            )
            log_event(
                _LOGGER,
                logging.INFO,
                "lightener.turn_on.complete",
                trace_id=root_span.trace_id,
                span_id=root_span.span_id,
                lightener_entity_ref=entity_ref(self.entity_id or "unknown"),
                service_failures=service_failures,
                duration_ms=round(duration_ms, 2),
                error_type=type(operation_error).__name__ if operation_error else None,
            )
            end_span(
                _LOGGER,
                root_span,
                status="error" if service_failures or operation_error else "ok",
                service_failures=service_failures,
                error_type=type(operation_error).__name__ if operation_error else None,
            )

        # Define a coroutine as a ha task.
        async def _async_refresh() -> None:
            """Turn on all lights controlled by this Lightener."""
            self.async_update_group_state()
            self.async_write_ha_state()

        # Schedule the task to run.
        self.hass.async_create_task(
            _async_refresh(), name="Lightener [turn_on refresh]"
        )

    async def async_turn_off(self, **kwargs: Any) -> None:
        """Turn off all lights controlled by this Lightener."""
        root_span = start_span(
            _LOGGER,
            "lightener.turn_off",
            lightener_entity_ref=entity_ref(self.entity_id or "unknown"),
            managed_entities=len(self._entities),
        )
        op_started = monotonic()
        op_error: Exception | None = None
        self._is_frozen = True

        self._prefered_brightness = self._attr_brightness

        try:
            await super().async_turn_off(**kwargs)
        except Exception as exc:
            op_error = exc
            raise
        finally:
            self._is_frozen = False

            self.async_update_group_state()
            self.async_write_ha_state()
            duration_ms = (monotonic() - op_started) * 1000
            metric(
                _LOGGER,
                "lightener.turn_off.duration_ms",
                "histogram",
                round(duration_ms, 2),
                lightener_entity_ref=entity_ref(self.entity_id or "unknown"),
            )
            log_event(
                _LOGGER,
                logging.INFO,
                "lightener.turn_off.complete",
                trace_id=root_span.trace_id,
                span_id=root_span.span_id,
                lightener_entity_ref=entity_ref(self.entity_id or "unknown"),
                duration_ms=round(duration_ms, 2),
                error_type=type(op_error).__name__ if op_error else None,
            )
            end_span(
                _LOGGER,
                root_span,
                status="error" if op_error else "ok",
                error_type=type(op_error).__name__ if op_error else None,
            )

    async def turn_on(self, **kwargs: Any) -> None:
        """Turn the lights controlled by this Lightener on."""
        await self.async_turn_on(**kwargs)

    async def turn_off(self, **kwargs: Any) -> None:
        """Turn the lights controlled by this Lightener off."""
        await self.async_turn_off(**kwargs)

    @callback
    def async_update_group_state(self) -> None:
        """Update the Lightener state based on the controlled entities."""

        if self._is_frozen:
            return

        was_off = not self.is_on
        current_brightness = self._attr_brightness

        # Flag is this update is caused by this Lightener when calling turn_on.
        is_lightener_change = False

        # Let the Group integration make its magic, which includes recalculating the brightness.
        super().async_update_group_state()

        common_level: set = None

        if self.is_on:
            # Calculates the brighteness by checking if the current levels in al controlled lights
            # preciselly match one of the possible values for this lightener.
            common_levels: set[int] | None = None
            _levels_cache: dict[tuple[str, int], set[int]] = {}
            for entity_id in self._entity_ids:
                state = self.hass.states.get(entity_id)

                # State may return None if the entity is not available, so we ignore it.
                if state is not None:
                    entity = self._entities_by_id.get(state.entity_id)
                    if entity is None:
                        continue

                    # Check if the entity state change is caused by this Lightener.
                    # Always checked — independent of the levels early-exit below.
                    is_lightener_change = (
                        True
                        if is_lightener_change
                        else (
                            state.context
                            and self._context
                            and state.context.id == self._context.id
                        )
                    )

                    # Skip levels computation once we know there's no common level.
                    if common_levels is not None and not common_levels:
                        continue

                    if state.state == STATE_ON:
                        entity_brightness = state.attributes.get(ATTR_BRIGHTNESS, 255)
                    else:
                        entity_brightness = 0

                    _LOGGER.debug(
                        "Current brightness of `%s` is `%s`",
                        entity.entity_id,
                        entity_brightness,
                    )

                    if entity_brightness is not None:
                        cache_key = (entity.entity_id, entity_brightness)
                        entity_levels = _levels_cache.get(cache_key)
                        if entity_levels is None:
                            entity_levels = set(
                                entity.translate_brightness_back(entity_brightness)
                            )
                            _levels_cache[cache_key] = entity_levels
                    else:
                        entity_levels = set()

                    if common_levels is None:
                        common_levels = entity_levels
                    else:
                        common_levels.intersection_update(entity_levels)

            if common_levels:
                # If the current lightener level is not present in the possible levels of the controlled lights.
                if self._prefered_brightness in common_levels:
                    common_level = {self._prefered_brightness}
                else:
                    common_level = common_levels

        if common_level:
            # Use the common level if any was found.
            self._attr_brightness = common_level.pop()
        else:
            self._attr_brightness = (
                self._prefered_brightness
                if is_lightener_change
                else current_brightness
                if self.is_on or was_off
                else None
            )

        _LOGGER.debug(
            "Setting the brightness of `%s` to `%s`",
            self.entity_id,
            self._attr_brightness,
        )

    @callback
    def async_write_ha_state(self) -> None:
        """Write the state to the state machine."""

        if self._is_frozen:
            return

        _LOGGER.debug(
            "Writing state of `%s` with brightness `%s`",
            self.entity_id,
            self._attr_brightness,
        )

        super().async_write_ha_state()


class LightenerControlledLight:
    """Represents a light entity managed by a LightnerLight."""

    def __init__(
        self: LightenerControlledLight,
        entity_id: str,
        config: dict,
        hass: HomeAssistant,
    ) -> None:
        """Create and instance of this class."""

        self.entity_id = entity_id
        self.hass = hass

        # Get the brightness configuration and prepare it for processing,
        brightness_config = prepare_brightness_config(config.get("brightness", {}))

        # Create the brightness conversion maps (from lightener to entity and from entity to lightener).
        self.levels, self.to_lightener_levels, self.to_lightener_levels_on_off = (
            build_brightness_maps(tuple(brightness_config))
        )

    @property
    def type(self) -> str | None:
        """The entity type."""

        try:
            return get_light_type(self.hass, self.entity_id)
        except HomeAssistantError:
            return None

    def translate_brightness(self, brightness: int) -> int | None:
        """Calculate the entitiy brightness for the give Lightener brightness level."""

        level = self.levels.get(int(brightness))

        if self.type == TYPE_ONOFF:
            return 0 if level == 0 else 255

        return level

    def translate_brightness_back(self, brightness: int | None) -> list[int]:
        """Calculate all possible Lightener brightness levels for a give entity brightness."""

        if brightness is None:
            return []

        levels = self.to_lightener_levels.get(int(brightness))

        if self.type == TYPE_ONOFF:
            return self.to_lightener_levels_on_off[int(brightness)]

        return levels or []
