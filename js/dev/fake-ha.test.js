// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';
import {
  createPreviewHass,
  definePreviewEntityPicker,
  LIGHTENER_ENTITY,
  scenarios,
} from './fake-ha.js';

describe('dev fake Home Assistant harness', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('lists eligible light ids and preserves exact empty area results', async () => {
    const preview = createPreviewHass({ delayMs: 0 });
    preview.loadCurves(scenarios.default);

    const all = await preview.hass.callWS({ type: 'lightener/list_eligible_lights' });
    expect(all.entities).toEqual([
      'light.available_floor_lamp',
      'light.available_kitchen_spot',
      'light.available_wall_sconce',
    ]);
    expect(all.entities).not.toContain(LIGHTENER_ENTITY);
    expect(all.entities).not.toContain('light.ceiling_light');
    expect(all.entities).not.toContain('light.unavailable_spare');

    const livingRoom = await preview.hass.callWS({
      type: 'lightener/list_eligible_lights',
      area_id: 'living_room',
    });
    expect(livingRoom.entities).toEqual([
      'light.available_floor_lamp',
      'light.available_wall_sconce',
    ]);

    const emptyArea = await preview.hass.callWS({
      type: 'lightener/list_eligible_lights',
      area_id: 'garage',
    });
    expect(emptyArea.entities).toEqual([]);
  });

  it('refreshes eligible ids after add and remove operations', async () => {
    const preview = createPreviewHass({ delayMs: 0 });
    preview.loadCurves(scenarios.default);

    await preview.hass.callWS({
      type: 'lightener/add_light',
      controlled_entity_id: 'light.available_floor_lamp',
      preset: 'linear',
    });
    const afterAdd = await preview.hass.callWS({
      type: 'lightener/list_eligible_lights',
      area_id: 'living_room',
    });
    expect(afterAdd.entities).toEqual(['light.available_wall_sconce']);

    await preview.hass.callWS({
      type: 'lightener/remove_light',
      controlled_entity_id: 'light.available_floor_lamp',
    });
    const afterRemove = await preview.hass.callWS({
      type: 'lightener/list_eligible_lights',
      area_id: 'living_room',
    });
    expect(afterRemove.entities).toEqual([
      'light.available_floor_lamp',
      'light.available_wall_sconce',
    ]);
  });

  it('filters the preview entity picker by includeEntities and excludeEntities', () => {
    definePreviewEntityPicker();
    const preview = createPreviewHass({ delayMs: 0 });
    preview.loadCurves(scenarios.default);

    const picker = document.createElement('ha-entity-picker');
    document.body.append(picker);
    picker.hass = preview.hass;
    picker.includeDomains = ['light'];
    picker.includeEntities = [
      'light.available_wall_sconce',
      'light.ceiling_light',
      'switch.not_a_light',
    ];
    picker.excludeEntities = ['light.ceiling_light'];

    const options = [...picker.querySelectorAll('option')].map((option) => option.value);
    expect(options).toEqual(['light.available_wall_sconce']);

    const selected = [];
    picker.addEventListener('value-changed', (event) => selected.push(event.detail.value));
    const input = picker.querySelector('input');

    input.value = 'light.ceiling_light';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(selected).toEqual([]);

    input.value = 'light.available_wall_sconce';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(selected).toEqual(['light.available_wall_sconce']);
  });
});
