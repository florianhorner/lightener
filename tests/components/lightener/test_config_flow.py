"""Tests for config_flow."""

from typing import Any
from uuid import uuid4

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.const import CONF_BRIGHTNESS, CONF_ENTITIES, CONF_FRIENDLY_NAME
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResult
from homeassistant.helpers.entity_registry import async_get as async_get_entity_registry
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.lightener import const
from custom_components.lightener.config_flow import LightenerConfigFlow
from custom_components.lightener.const import CURVE_PRESETS, DEFAULT_BRIGHTNESS


async def test_config_flow_steps(hass: HomeAssistant) -> None:
    """Test if the full config flow works — name, select lights, done with default curves."""

    result = await hass.config_entries.flow.async_init(
        const.DOMAIN, context={"source": config_entries.SOURCE_USER}
    )

    assert result["type"] == "form"
    assert result["step_id"] == "user"
    assert result["last_step"] is False

    assert get_required(result, "name") is True

    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], user_input={"name": "Test Name"}
    )

    assert result["type"] == "form"
    assert result["step_id"] == "area"
    assert result["last_step"] is False

    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], user_input={}
    )

    assert result["type"] == "form"
    assert result["step_id"] == "lights"
    assert result["last_step"] is True

    assert get_required(result, "controlled_entities") is True

    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        user_input={"controlled_entities": ["light.test1"]},
    )

    assert result["type"] == "create_entry"
    assert result["title"] == "Test Name"
    assert result["data"] == {
        CONF_FRIENDLY_NAME: "Test Name",
        CONF_ENTITIES: {"light.test1": {CONF_BRIGHTNESS: dict(DEFAULT_BRIGHTNESS)}},
    }


async def test_config_flow_multiple_lights(hass: HomeAssistant) -> None:
    """Test config flow with multiple lights — all get default curves."""

    result = await hass.config_entries.flow.async_init(
        const.DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], user_input={"name": "Test Name"}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], user_input={}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        user_input={"controlled_entities": ["light.test1", "light.test2"]},
    )

    assert result["type"] == "create_entry"
    assert result["data"] == {
        CONF_FRIENDLY_NAME: "Test Name",
        CONF_ENTITIES: {
            "light.test1": {CONF_BRIGHTNESS: dict(DEFAULT_BRIGHTNESS)},
            "light.test2": {CONF_BRIGHTNESS: dict(DEFAULT_BRIGHTNESS)},
        },
    }


async def test_config_flow_applies_selected_preset_to_new_lights(
    hass: HomeAssistant,
) -> None:
    """Test config flow applies selected preset to newly configured lights."""

    result = await hass.config_entries.flow.async_init(
        const.DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], user_input={"name": "Preset Test"}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], user_input={}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        user_input={
            "controlled_entities": ["light.test1", "light.test2"],
            "curve_preset": "night_mode",
        },
    )

    assert result["type"] == "create_entry"
    assert result["data"][CONF_ENTITIES] == {
        "light.test1": {CONF_BRIGHTNESS: dict(CURVE_PRESETS["night_mode"])},
        "light.test2": {CONF_BRIGHTNESS: dict(CURVE_PRESETS["night_mode"])},
    }


async def test_options_flow_preserves_existing_curves(hass: HomeAssistant) -> None:
    """Test that the options flow preserves existing curves and assigns defaults to new lights."""

    entry = MockConfigEntry(
        domain="lightener",
        version=LightenerConfigFlow.VERSION,
        unique_id=str(uuid4()),
        data={
            CONF_ENTITIES: {
                "light.test1": {CONF_BRIGHTNESS: {"10": "20", "80": "90"}},
                "light.test2": {CONF_BRIGHTNESS: {"30": "40"}},
            }
        },
    )
    entry.add_to_hass(hass)

    result = await hass.config_entries.options.async_init(entry.entry_id)

    assert result["type"] == "form"
    assert result["step_id"] == "init"
    assert result["last_step"] is True

    assert get_default(result, "controlled_entities") == ["light.test1", "light.test2"]

    # Keep test1 (existing curves preserved), drop test2, add test3 (gets defaults)
    result = await hass.config_entries.options.async_configure(
        result["flow_id"],
        user_input={
            "controlled_entities": ["light.test1", "light.test3"],
            "curve_preset": "linear",
        },
    )

    assert result["type"] == "create_entry"
    assert result["title"] == ""
    assert result["data"] == {}

    assert dict(entry.data) == {
        CONF_ENTITIES: {
            "light.test1": {CONF_BRIGHTNESS: {"10": "20", "80": "90"}},
            "light.test3": {CONF_BRIGHTNESS: dict(DEFAULT_BRIGHTNESS)},
        }
    }
    assert entry.options == {}


async def test_options_flow_applies_preset_only_to_new_lights(
    hass: HomeAssistant,
) -> None:
    """Test options flow keeps existing curves and uses preset for added lights."""

    entry = MockConfigEntry(
        domain="lightener",
        version=LightenerConfigFlow.VERSION,
        unique_id=str(uuid4()),
        data={
            CONF_ENTITIES: {
                "light.test1": {CONF_BRIGHTNESS: {"10": "20", "80": "90"}},
            }
        },
    )
    entry.add_to_hass(hass)

    result = await hass.config_entries.options.async_init(entry.entry_id)
    result = await hass.config_entries.options.async_configure(
        result["flow_id"],
        user_input={
            "controlled_entities": ["light.test1", "light.test2"],
            "curve_preset": "late_starter",
        },
    )

    assert result["type"] == "create_entry"
    assert dict(entry.data)[CONF_ENTITIES] == {
        "light.test1": {CONF_BRIGHTNESS: {"10": "20", "80": "90"}},
        "light.test2": {CONF_BRIGHTNESS: dict(CURVE_PRESETS["late_starter"])},
    }


async def test_step_lights_no_lightener(hass: HomeAssistant) -> None:
    """Test if the list of lights to select doesn't include the lightener being configured."""

    entry = MockConfigEntry(
        domain="lightener",
        unique_id=str(uuid4()),
        data={CONF_ENTITIES: {"light.test1": {CONF_BRIGHTNESS: {"10": "20"}}}},
    )
    entry.add_to_hass(hass)

    entity_registry = async_get_entity_registry(hass)

    entity_registry.async_get_or_create(
        domain="light",
        platform="lightener",
        unique_id=str(uuid4()),
        config_entry=entry,
        suggested_object_id="test_lightener",
    )

    result = await hass.config_entries.options.async_init(entry.entry_id)

    assert get_default(result, "controlled_entities") == ["light.test1"]


async def test_step_lights_error_no_selection(hass: HomeAssistant) -> None:
    """Test that submitting with no lights selected shows an error."""

    result = await hass.config_entries.flow.async_init(
        const.DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], user_input={"name": "Test Name"}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], user_input={}
    )

    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        user_input={"controlled_entities": []},
    )

    assert result["step_id"] == "lights"
    assert result["errors"]["controlled_entities"] == "controlled_entities_empty"


def get_default(form: FlowResult, key: str) -> Any:
    """Get default value for key in voluptuous schema."""

    for schema_key in form["data_schema"].schema:
        if schema_key == key:
            if schema_key.default != vol.UNDEFINED:
                return schema_key.default()
            return None

    raise KeyError(f"Key '{key}' not found")


def get_required(form: FlowResult, key: str) -> Any:
    """Return True if the given key is vol.Required in the form schema."""

    for schema_key in form["data_schema"].schema:
        if schema_key == key:
            return isinstance(schema_key, vol.Required)

    raise KeyError(f"Key '{key}' not found")
