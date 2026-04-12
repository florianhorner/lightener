"""The config flow for Lightener."""

from typing import Any

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.const import CONF_BRIGHTNESS, CONF_ENTITIES, CONF_FRIENDLY_NAME
from homeassistant.core import callback
from homeassistant.data_entry_flow import FlowHandler, FlowResult
from homeassistant.helpers.entity_registry import (
    async_entries_for_config_entry,
    async_get,
)
from homeassistant.helpers.selector import selector

from .const import CURVE_PRESETS, DEFAULT_BRIGHTNESS, DEFAULT_CURVE_PRESET, DOMAIN


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

    @staticmethod
    def _get_preset_curve(preset_id: str) -> dict[str, str]:
        """Return curve for the selected preset."""
        return dict(CURVE_PRESETS.get(preset_id, DEFAULT_BRIGHTNESS))

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
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Manage the selection of the lights controlled by the Lightener light."""

        errors = {}

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
            selected_preset = user_input.get("curve_preset", DEFAULT_CURVE_PRESET)
            preset_curve = self._get_preset_curve(selected_preset)

            if not selected:
                errors["controlled_entities"] = "controlled_entities_empty"
            else:
                # Build entities dict, preserving existing curves for lights
                # that were already configured, and assigning defaults to new ones.
                existing_entities = self.data.get(CONF_ENTITIES, {})
                entities = {}

                for entity_id in selected:
                    if entity_id in existing_entities:
                        # Deep-copy to avoid mutating the live config proxy
                        entities[entity_id] = dict(existing_entities[entity_id])
                    else:
                        # New light — assign selected preset curve.
                        entities[entity_id] = {CONF_BRIGHTNESS: dict(preset_curve)}

                self.data[CONF_ENTITIES] = entities
                return await self.async_save_data()

        # Build entity filter: filter by area if one was selected in the area step.
        entity_filter: dict = {"domain": "light"}
        area_id = self.data.get("_area_filter")
        if area_id:
            entity_filter["area"] = area_id

        return self.flow_handler.async_show_form(
            step_id=self.steps.get("lights", "lights"),
            last_step=True,
            data_schema=vol.Schema(
                {
                    vol.Required(
                        "controlled_entities", default=controlled_entities
                    ): selector(
                        {
                            "entity": {
                                "multiple": True,
                                "filter": entity_filter,
                                "exclude_entities": lightener_entities,
                            }
                        }
                    ),
                    vol.Optional(
                        "curve_preset", default=DEFAULT_CURVE_PRESET
                    ): selector(
                        {
                            "select": {
                                "mode": "list",
                                "options": [
                                    {"value": "linear", "label": "Linear"},
                                    {"value": "dim_accent", "label": "Dim accent"},
                                    {"value": "late_starter", "label": "Late starter"},
                                    {"value": "night_mode", "label": "Night mode"},
                                ],
                            }
                        }
                    ),
                }
            ),
            errors=errors,
        )

    async def async_save_data(self) -> FlowResult:
        """Save the configured data."""

        # We don't save it into the "options" key but always in "config",
        # no matter if the user called the config or the options flow.

        # If in a config flow, create the config entry.
        if self.config_entry is None:
            return self.flow_handler.async_create_entry(
                title=self.data.get(CONF_FRIENDLY_NAME), data=self.data
            )

        # In an options flow, update the config entry.
        self.flow_handler.hass.config_entries.async_update_entry(
            self.config_entry, data=self.data, options=self.config_entry.options
        )

        await self.flow_handler.hass.config_entries.async_reload(
            self.config_entry.entry_id
        )

        return self.flow_handler.async_create_entry(title="", data={})
