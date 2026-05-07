"""The config flow for Lightener."""

import logging
from typing import Any

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.const import CONF_BRIGHTNESS, CONF_ENTITIES, CONF_FRIENDLY_NAME
from homeassistant.core import HomeAssistant, callback
from homeassistant.data_entry_flow import FlowHandler, FlowResult
from homeassistant.helpers.device_registry import (
    async_entries_for_area as devices_in_area,
)
from homeassistant.helpers.device_registry import async_get as async_get_device_registry
from homeassistant.helpers.entity_registry import (
    async_entries_for_area as entities_in_area,
)
from homeassistant.helpers.entity_registry import (
    async_entries_for_config_entry,
    async_entries_for_device,
    async_get,
)
from homeassistant.helpers.selector import selector

from .const import DEFAULT_BRIGHTNESS, DOMAIN

_LOGGER = logging.getLogger(__name__)


def _light_entity_ids_in_area(hass: HomeAssistant, area_id: str) -> list[str]:
    """Return the light entity_ids belonging to an area.

    Includes entities directly assigned to the area and entities of devices
    assigned to the area. The HA entity selector's `filter` schema rejects
    any area key, so we resolve area→entities here and pass the result via
    `include_entities`.
    """

    entity_registry = async_get(hass)
    device_registry = async_get_device_registry(hass)

    entity_ids: set[str] = set()

    for entry in entities_in_area(entity_registry, area_id):
        if entry.domain == "light":
            entity_ids.add(entry.entity_id)

    for device in devices_in_area(device_registry, area_id):
        for entry in async_entries_for_device(
            entity_registry, device.id, include_disabled_entities=False
        ):
            if entry.domain == "light" and entry.area_id in (None, area_id):
                entity_ids.add(entry.entity_id)

    return sorted(entity_ids)


class LightenerConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Lightener config flow."""

    # The schema version of the entries that it creates.
    # Home Assistant will call the migrate method if the version changes.
    VERSION = 2

    def __init__(self) -> None:
        """Initialize options flow."""
        self.lightener_flow = LightenerFlow(self, steps={"name": "user"})
        super().__init__()

    async def async_step_user(self, user_input: dict[str, Any] | None = None):
        """Configure the lightener device name."""

        return await self.lightener_flow.async_step_name(user_input)

    async def async_step_area(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Filter lights by area (optional step before light selection)."""
        return await self.lightener_flow.async_step_area(user_input)

    async def async_step_lights(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Manage the selection of the lights controlled by the Lightener light."""
        return await self.lightener_flow.async_step_lights(user_input)

    @staticmethod
    @callback
    def async_get_options_flow(
        config_entry: config_entries.ConfigEntry,
    ) -> config_entries.OptionsFlow:
        """Create the options flow."""

        return LightenerOptionsFlow(config_entry)


class LightenerOptionsFlow(config_entries.OptionsFlow):
    """The options flow handler for Lightener."""

    def __init__(self, config_entry: config_entries.ConfigEntry) -> None:
        """Initialize options flow."""
        self.lightener_flow = LightenerFlow(
            self, steps={"lights": "init"}, config_entry=config_entry
        )
        super().__init__()

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Manage the selection of the lights controlled by the Lightener light."""
        return await self.lightener_flow.async_step_lights(user_input)


class LightenerFlow:
    """Handle steps for both the config and the options flow."""

    def __init__(
        self,
        flow_handler: FlowHandler,
        steps: dict,
        config_entry: config_entries.ConfigEntry | None = None,
    ) -> None:
        """Initialize the LightenerFlow."""

        self.flow_handler = flow_handler
        self.config_entry = config_entry
        self.data = {} if config_entry is None else config_entry.data.copy()
        self.steps = steps

    async def async_step_name(self, user_input: dict[str, Any] | None = None):
        """Configure the lightener device name."""

        errors = {}

        if user_input is not None:
            name = user_input["name"]

            self.data[CONF_FRIENDLY_NAME] = name

            return await self.async_step_area()

        data_schema = {
            vol.Required("name"): str,
        }

        return self.flow_handler.async_show_form(
            step_id=self.steps.get("name", "name"),
            last_step=False,
            data_schema=vol.Schema(data_schema),
            errors=errors,
        )

    async def async_step_area(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Optionally filter lights by area before the light picker."""
        if user_input is not None:
            self.data["_area_filter"] = user_input.get("area_id")
            return await self.async_step_lights()

        return self.flow_handler.async_show_form(
            step_id=self.steps.get("area", "area"),
            last_step=False,
            data_schema=vol.Schema(
                {
                    vol.Optional("area_id"): selector({"area": {}}),
                }
            ),
        )

    async def async_step_lights(
        self,
        user_input: dict[str, Any] | None = None,
        errors: dict[str, str] | None = None,
    ) -> FlowResult:
        """Manage the selection of the lights controlled by the Lightener light."""

        errors = errors or {}

        lightener_entities = []
        controlled_entities = []

        if self.config_entry is not None:
            # Create a list with the ids of the Lightener entities we're configuring.
            # Most likely we'll have a single item in the list.
            entity_registry = async_get(self.flow_handler.hass)
            lightener_entities = async_entries_for_config_entry(
                entity_registry, self.config_entry.entry_id
            )
            lightener_entities = [e.entity_id for e in lightener_entities]

            # Load the previously configured list of entities controlled by this Lightener.
            controlled_entities = list(
                self.config_entry.data.get(CONF_ENTITIES, {}).keys()
            )

        if user_input is not None:
            selected = user_input.get("controlled_entities")

            if not selected:
                errors["controlled_entities"] = "controlled_entities_empty"
            else:
                # Build entities dict, preserving existing curves for lights
                # that were already configured, and assigning the default
                # (linear) curve to new ones. Curve choice happens visually
                # in the Lightener Editor panel after the flow completes —
                # the panel exposes presets as live curve thumbnails on the
                # actual graph rather than as text radio buttons here.
                existing_entities = self.data.get(CONF_ENTITIES, {})
                entities = {}

                for entity_id in selected:
                    if entity_id in existing_entities:
                        # Deep-copy to avoid mutating the live config proxy
                        entities[entity_id] = dict(existing_entities[entity_id])
                    else:
                        entities[entity_id] = {
                            CONF_BRIGHTNESS: dict(DEFAULT_BRIGHTNESS)
                        }

                self.data[CONF_ENTITIES] = entities
                return await self.async_save_data()

        # If an area was selected in the area step, narrow the picker to the
        # lights in that area via include_entities. The HA entity selector's
        # `filter` schema does not accept any area key — passing one raises a
        # schema validation error that surfaces as an "Unknown error" toast.
        entity_selector_config: dict[str, Any] = {
            "multiple": True,
            "filter": {"domain": "light"},
            "exclude_entities": lightener_entities,
        }
        area_id = self.data.get("_area_filter")
        if area_id:
            area_lights = _light_entity_ids_in_area(self.flow_handler.hass, area_id)
            if area_lights:
                # Drop already-configured Lightener entities so they can't be
                # picked recursively as members of another group.
                area_lights = [e for e in area_lights if e not in lightener_entities]
                if area_lights:
                    entity_selector_config["include_entities"] = area_lights

        return self.flow_handler.async_show_form(
            step_id=self.steps.get("lights", "lights"),
            last_step=True,
            data_schema=vol.Schema(
                {
                    vol.Required(
                        "controlled_entities", default=controlled_entities
                    ): selector({"entity": entity_selector_config}),
                }
            ),
            errors=errors,
        )

    async def async_save_data(self) -> FlowResult:
        """Save the configured data."""

        # We don't save it into the "options" key but always in "config",
        # no matter if the user called the config or the options flow.

        # Strip internal flow-only keys (prefixed with _) before persisting.
        persist_data = {k: v for k, v in self.data.items() if not k.startswith("_")}

        # If in a config flow, create the config entry. Hand the user off to
        # the Lightener Editor panel for visual curve tuning — the editor is
        # where presets are picked against the live graph rather than as text
        # radios, which is the actual product experience.
        if self.config_entry is None:
            return self.flow_handler.async_create_entry(
                title=persist_data.get(CONF_FRIENDLY_NAME),
                data=persist_data,
                description="open_editor",
                description_placeholders={"editor_url": "/lightener-editor"},
            )

        # In an options flow, update the config entry.
        previous_data = dict(self.config_entry.data)
        previous_options = self.config_entry.options
        self.flow_handler.hass.config_entries.async_update_entry(
            self.config_entry, data=persist_data, options=self.config_entry.options
        )

        try:
            reloaded = await self.flow_handler.hass.config_entries.async_reload(
                self.config_entry.entry_id
            )
        except Exception:
            _LOGGER.exception(
                "Failed to reload Lightener config entry after options update"
            )
            reloaded = False

        if reloaded is False:
            self.flow_handler.hass.config_entries.async_update_entry(
                self.config_entry, data=previous_data, options=previous_options
            )
            try:
                await self.flow_handler.hass.config_entries.async_reload(
                    self.config_entry.entry_id
                )
            except Exception:
                _LOGGER.exception(
                    "Failed to restore Lightener config entry after options rollback"
                )
            self.data = previous_data.copy()
            return await self.async_step_lights(None, errors={"base": "reload_failed"})

        return self.flow_handler.async_create_entry(title="", data={})
