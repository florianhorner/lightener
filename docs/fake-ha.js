export const LIGHTENER_ENTITY = 'light.preview_lightener';

const COLORS = [
  '#42a5f5',
  '#ef5350',
  '#5c6bc0',
  '#ffa726',
  '#ab47bc',
  '#26c6da',
  '#ec407a',
  '#8d6e63',
  '#ffca28',
  '#7e57c2',
];

const PRESETS = {
  linear: { 1: '1', 100: '100' },
  dim_accent: { 1: '1', 25: '8', 50: '20', 100: '45' },
  late_starter: { 1: '1', 45: '1', 70: '45', 100: '100' },
  night_mode: { 1: '1', 20: '3', 50: '10', 100: '25' },
};

const AVAILABLE_LIGHTS = [
  {
    entityId: 'light.available_floor_lamp',
    friendlyName: 'Available Floor Lamp',
    areaId: 'living_room',
  },
  {
    entityId: 'light.available_wall_sconce',
    friendlyName: 'Available Wall Sconce',
    areaId: 'living_room',
  },
  {
    entityId: 'light.available_kitchen_spot',
    friendlyName: 'Available Kitchen Spot',
    areaId: 'kitchen',
  },
  {
    entityId: 'light.unavailable_spare',
    friendlyName: 'Unavailable Spare',
    state: 'unavailable',
    areaId: 'garage',
  },
];

function makeCurve(id, name, points, colorIdx) {
  return {
    entityId: id,
    friendlyName: name,
    controlPoints: points.map(([lightener, target]) => ({ lightener, target })),
    visible: true,
    color: COLORS[colorIdx % COLORS.length],
  };
}

const names = [
  'Ceiling',
  'Floor Lamp',
  'LED Strip',
  'Desk Lamp',
  'Wall Sconce',
  'Pendant',
  'Spotlight A',
  'Spotlight B',
  'Under Cabinet',
  'Accent Left',
  'Accent Right',
  'Hallway',
  'Bathroom',
  'Mirror Light',
  'Closet',
  'Reading Lamp',
  'TV Backlight',
  'Kitchen Island',
  'Dining Table',
  'Entry',
];

export const scenarios = {
  default: [
    makeCurve(
      'light.ceiling_light',
      'Ceiling Light',
      [
        [0, 0],
        [25, 4],
        [58, 78],
        [100, 100],
      ],
      0
    ),
    makeCurve(
      'light.sofa_lamp',
      'Sofa Lamp',
      [
        [0, 12],
        [12, 48],
        [42, 100],
        [82, 88],
        [100, 64],
      ],
      1
    ),
    makeCurve(
      'light.led_strip',
      'LED Strip',
      [
        [0, 0],
        [8, 4],
        [34, 32],
        [72, 84],
        [100, 96],
      ],
      2
    ),
  ],
  two: [
    makeCurve(
      'light.bedroom_main',
      'Bedroom Main',
      [
        [0, 0],
        [30, 20],
        [70, 90],
        [100, 100],
      ],
      0
    ),
    makeCurve(
      'light.bedside_lamp',
      'Bedside Lamp',
      [
        [0, 20],
        [10, 58],
        [50, 100],
        [100, 80],
      ],
      1
    ),
  ],
  many: names.map((name, i) =>
    makeCurve(
      `light.room_${name.toLowerCase().replace(/\s+/g, '_')}`,
      name,
      [
        [0, i % 5 === 0 ? 8 : 0],
        [18 + ((i * 7) % 46), 18 + ((i * 13) % 76)],
        [64 + ((i * 5) % 28), 44 + ((i * 11) % 52)],
        [100, 58 + ((i * 9) % 42)],
      ],
      i
    )
  ),
  'long-ids': [
    makeCurve(
      'light.ground_floor_living_room_main_ceiling_chandelier_warm_white',
      'Ground Floor Living Room Main Ceiling Chandelier (Warm White)',
      [
        [0, 0],
        [25, 10],
        [50, 60],
        [75, 90],
        [100, 100],
      ],
      0
    ),
    makeCurve(
      'light.second_floor_master_bedroom_bedside_table_lamp_left_side',
      'Second Floor Master Bedroom Bedside Table Lamp (Left)',
      [
        [0, 18],
        [10, 40],
        [60, 100],
        [100, 80],
      ],
      1
    ),
    makeCurve(
      'light.basement_home_theater_ambient_led_strip_behind_screen',
      'Basement Home Theater Ambient LED Strip (Behind Screen)',
      [
        [0, 0],
        [5, 80],
        [30, 100],
        [100, 100],
      ],
      2
    ),
  ],
  empty: [],
};

export function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function titleCase(value) {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

function curveToBrightness(curve) {
  const brightness = {};
  for (const point of curve.controlPoints) {
    if (point.lightener === 0 && point.target === 0) continue;
    brightness[String(point.lightener)] = String(point.target);
  }
  return brightness;
}

function curvesToEntities(curves) {
  return Object.fromEntries(
    curves.map((curve) => [curve.entityId, { brightness: curveToBrightness(curve) }])
  );
}

function lightState(friendlyName, options = {}) {
  return {
    state: options.state ?? 'off',
    attributes: {
      friendly_name: friendlyName,
      ...(options.brightness === undefined ? {} : { brightness: options.brightness }),
      ...(options.areaId ? { area_id: options.areaId } : {}),
    },
  };
}

function buildStates(curves) {
  const states = {
    [LIGHTENER_ENTITY]: lightState('Preview Lightener', { state: 'on' }),
  };
  for (const curve of curves) {
    states[curve.entityId] = lightState(curve.friendlyName, {
      state: 'on',
      brightness: 180,
    });
  }
  for (const light of AVAILABLE_LIGHTS) {
    states[light.entityId] = lightState(light.friendlyName, {
      state: light.state,
      areaId: light.areaId,
    });
  }
  return states;
}

function replaceStates(target, states) {
  for (const entityId of Object.keys(target)) {
    delete target[entityId];
  }
  Object.assign(target, states);
}

function isLightEntity(entityId) {
  return entityId.startsWith('light.');
}

function isAvailableState(stateObj) {
  return stateObj && stateObj.state !== 'unavailable';
}

function areaMatches(stateObj, areaId) {
  if (!areaId) return true;
  return stateObj?.attributes?.area_id === areaId;
}

function eligibleLightIds(states, backendEntities, lightenerEntityIds, areaId) {
  return Object.keys(states)
    .filter((entityId) => isLightEntity(entityId))
    .filter((entityId) => !lightenerEntityIds.has(entityId))
    .filter((entityId) => !Object.prototype.hasOwnProperty.call(backendEntities, entityId))
    .filter((entityId) => isAvailableState(states[entityId]))
    .filter((entityId) => areaMatches(states[entityId], areaId))
    .sort();
}

export function createPreviewHass(options = {}) {
  let backendEntities = {};
  const lightenerEntityIds = new Set([LIGHTENER_ENTITY, ...(options.lightenerEntityIds ?? [])]);
  const hass = {
    user: { is_admin: options.admin !== false },
    states: buildStates([]),
    language: 'en',
    themes: { default_theme: 'default' },
    callService: async (domain, service, data) => {
      console.info('[preview callService]', domain, service, data);
    },
    callApi: async (method, path) => {
      console.info('[preview callApi]', method, path);
      return {};
    },
    callWS: async (msg) => {
      console.info('[preview callWS]', msg);
      await new Promise((resolve) => setTimeout(resolve, options.delayMs ?? 180));
      if (options.failLoad && msg.type === 'lightener/get_curves') {
        throw new Error('Preview load failure');
      }
      if (msg.type === 'lightener/get_curves') {
        return { entities: clone(backendEntities) };
      }
      if (msg.type === 'lightener/save_curves') {
        backendEntities = clone(msg.curves);
        options.onChange?.();
        return {};
      }
      if (msg.type === 'lightener/add_light') {
        const id = msg.controlled_entity_id;
        const label = id.replace(/^light\./, '').replace(/_/g, ' ');
        hass.states[id] = hass.states[id] ?? lightState(titleCase(label));
        backendEntities[id] = {
          brightness: { ...(PRESETS[msg.preset] ?? PRESETS.linear) },
        };
        options.onChange?.();
        return { entities: clone(backendEntities) };
      }
      if (msg.type === 'lightener/remove_light') {
        delete backendEntities[msg.controlled_entity_id];
        options.onChange?.();
        return { entities: clone(backendEntities) };
      }
      if (msg.type === 'lightener/list_eligible_lights') {
        return {
          entities: eligibleLightIds(hass.states, backendEntities, lightenerEntityIds, msg.area_id),
        };
      }
      if (msg.type === 'config/entity_registry/get') {
        return {
          platform: lightenerEntityIds.has(msg.entity_id) ? 'lightener' : 'template',
          config_entry_id: lightenerEntityIds.has(msg.entity_id) ? 'preview-config-entry' : null,
        };
      }
      return {};
    },
  };

  return {
    hass,
    loadCurves(curves) {
      backendEntities = curvesToEntities(curves);
      replaceStates(hass.states, buildStates(curves));
    },
  };
}

function normalizeEntityList(value) {
  return Array.isArray(value) ? value.filter(Boolean) : undefined;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function entityName(hass, entityId) {
  return hass?.states?.[entityId]?.attributes?.friendly_name ?? entityId;
}

export function definePreviewEntityPicker() {
  if (customElements.get('ha-entity-picker')) return;

  customElements.define(
    'ha-entity-picker',
    class extends HTMLElement {
      _hass = null;
      _includeDomains = undefined;
      _includeEntities = undefined;
      _excludeEntities = undefined;
      _allowCustomEntity = false;
      _value = '';
      _listId = `preview-entity-picker-${Math.random().toString(36).slice(2)}`;

      static get observedAttributes() {
        return ['allow-custom-entity'];
      }

      attributeChangedCallback() {
        this._allowCustomEntity = this.hasAttribute('allow-custom-entity');
      }

      connectedCallback() {
        this._allowCustomEntity = this.hasAttribute('allow-custom-entity');
        this.render();
      }

      set value(value) {
        this._value = value || '';
        this.render();
      }

      get value() {
        return this._value;
      }

      set hass(hass) {
        this._hass = hass;
        this.render();
      }

      set includeDomains(domains) {
        this._includeDomains = normalizeEntityList(domains);
        this.render();
      }

      set includeEntities(entities) {
        this._includeEntities = normalizeEntityList(entities);
        this.render();
      }

      set excludeEntities(entities) {
        this._excludeEntities = normalizeEntityList(entities);
        this.render();
      }

      set allowCustomEntity(value) {
        this._allowCustomEntity = Boolean(value);
      }

      _candidateEntityIds() {
        const excluded = new Set(this._excludeEntities ?? []);
        const states = this._hass?.states ?? {};
        const sourceIds = this._includeEntities ?? Object.keys(states);
        return sourceIds
          .filter((entityId) => !excluded.has(entityId))
          .filter((entityId) => this._isIncludedDomain(entityId))
          .filter((entityId) => !states[entityId] || isAvailableState(states[entityId]))
          .sort((a, b) => entityName(this._hass, a).localeCompare(entityName(this._hass, b)));
      }

      _isIncludedDomain(entityId) {
        if (!this._includeDomains?.length) return true;
        const domain = entityId.split('.')[0];
        return this._includeDomains.includes(domain);
      }

      _isAllowedSelection(entityId) {
        if (!entityId) return true;
        if (this._excludeEntities?.includes(entityId)) return false;
        if (!this._isIncludedDomain(entityId)) return false;
        if (this._includeEntities) return this._candidateEntityIds().includes(entityId);
        return this._candidateEntityIds().includes(entityId) || this._allowCustomEntity;
      }

      _dispatchSelection(value) {
        this.dispatchEvent(
          new CustomEvent('value-changed', {
            detail: { value },
            bubbles: true,
            composed: true,
          })
        );
      }

      _onInput(event) {
        this._value = event.target.value.trim();
        if (this._isAllowedSelection(this._value)) {
          event.target.setCustomValidity('');
          this._dispatchSelection(this._value);
        } else {
          event.target.setCustomValidity('Entity is filtered out by the preview picker.');
        }
      }

      render() {
        const options = this._candidateEntityIds()
          .map((entityId) => {
            const label = entityName(this._hass, entityId);
            return `<option value="${escapeHtml(entityId)}">${escapeHtml(label)}</option>`;
          })
          .join('');
        this.innerHTML = `
          <input
            type="text"
            list="${this._listId}"
            placeholder="light.entity_id"
            value="${escapeHtml(this._value)}"
            style="
              width: 100%;
              padding: 8px 10px;
              border-radius: 8px;
              border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
              background: var(--card-background-color, #fff);
              color: var(--primary-text-color, #212121);
              font: inherit;
            "
          />
          <datalist id="${this._listId}">${options}</datalist>
        `;
        this.querySelector('input').addEventListener('input', (event) => this._onInput(event));
      }
    }
  );
}
