// @vitest-environment jsdom

import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import type { LightenerCurveCard } from './lightener-curve-card.js';
import { CurveLegend as CurveLegendClass } from './components/curve-legend.js';
import { CURVE_COLORS } from './utils/graph-math.js';
import type { Hass, LightCurve } from './utils/types.js';

type CardInternals = {
  _curves: LightCurve[];
  _scrubberPosition: number | null;
};

type LitElementWithUpdate = Element & {
  updateComplete: Promise<unknown>;
};

type StressFixture = {
  curves: LightCurve[];
  entities: Record<string, { brightness: Record<string, string> }>;
  states: Hass['states'];
};

let _mqlMatches = false;
const mqlListeners: ((e: MediaQueryListEvent) => void)[] = [];
const mockMql = {
  get matches() {
    return _mqlMatches;
  },
  set matches(value: boolean) {
    _mqlMatches = value;
  },
  media: '(max-width: 500px)',
  onchange: null,
  addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => {
    mqlListeners.push(cb);
  },
  removeEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => {
    const i = mqlListeners.indexOf(cb);
    if (i >= 0) mqlListeners.splice(i, 1);
  },
  dispatchEvent: (event: Event) => {
    for (const listener of [...mqlListeners]) {
      listener(event as MediaQueryListEvent);
    }
    return true;
  },
} as MediaQueryList;

afterEach(() => {
  document.body.querySelectorAll('lightener-curve-card').forEach((el) => el.remove());
  vi.restoreAllMocks();
  _mqlMatches = false;
  mqlListeners.splice(0, mqlListeners.length);
});

beforeAll(async () => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: () => mockMql,
  });
  await import('./lightener-curve-card.js');
});

function makeStressFixture(count = 20): StressFixture {
  const curves = Array.from({ length: count }, (_, idx): LightCurve => {
    const nnn = String(idx + 1).padStart(3, '0');
    const entityId = `light.living_room_overhead_ambient_controller_zone_${nnn}`;
    return {
      entityId,
      friendlyName: `Living Room Overhead Ambient Controller Zone ${nnn}`,
      controlPoints: [
        { lightener: 0, target: 0 },
        { lightener: 100, target: 100 },
      ],
      visible: true,
      color: CURVE_COLORS[idx % CURVE_COLORS.length],
    };
  });

  const entities = Object.fromEntries(
    curves.map((curve) => [
      curve.entityId,
      {
        brightness: Object.fromEntries(
          curve.controlPoints.map((cp) => [String(cp.lightener), String(cp.target)])
        ),
      },
    ])
  ) as StressFixture['entities'];

  const states = Object.fromEntries(
    curves.map((curve) => [
      curve.entityId,
      {
        state: 'on',
        attributes: {
          friendly_name: curve.friendlyName,
          brightness: 255,
        },
      },
    ])
  ) as Hass['states'];

  return { curves, entities, states };
}

function makeHass(states: Hass['states']): Hass {
  return {
    user: { is_admin: true },
    callWS: async () => ({ entities: {} }),
    callApi: async () => undefined,
    callService: async () => undefined,
    states: {
      'light.lightener': { state: 'on', attributes: { friendly_name: 'Lightener' } },
      ...states,
    },
  } as Hass;
}

async function drainUpdates(card: LightenerCurveCard): Promise<{
  graph: LitElementWithUpdate;
  legend: LitElementWithUpdate;
}> {
  await card.updateComplete;
  const graph = card.renderRoot.querySelector('curve-graph') as LitElementWithUpdate | null;
  expect(graph).not.toBeNull();
  await graph!.updateComplete;

  const legend = card.renderRoot.querySelector('curve-legend') as LitElementWithUpdate | null;
  expect(legend).not.toBeNull();
  await legend!.updateComplete;

  await new Promise((r) => setTimeout(r, 0));
  return { graph: graph!, legend: legend! };
}

async function mountStressCard(count = 20): Promise<{
  card: LightenerCurveCard;
  fixture: StressFixture;
  graph: LitElementWithUpdate;
  legend: LitElementWithUpdate;
}> {
  const fixture = makeStressFixture(count);
  const hass = makeHass(fixture.states);
  vi.spyOn(hass, 'callWS').mockImplementation(async <T>(msg: Record<string, unknown>) => {
    if (msg.type === 'lightener/get_curves') {
      return { entities: fixture.entities } as T;
    }
    if (msg.type === 'lightener/list_eligible_lights') {
      return { entities: [] } as T;
    }
    return undefined as T;
  });

  const card = document.createElement('lightener-curve-card') as LightenerCurveCard;
  card.setConfig({ entity: 'light.lightener' });
  card.hass = hass;
  document.body.appendChild(card);

  const { graph, legend } = await drainUpdates(card);
  return { card, fixture, graph, legend };
}

function legendItems(legend: LitElementWithUpdate): HTMLElement[] {
  return Array.from(legend.shadowRoot!.querySelectorAll<HTMLElement>('.legend-item'));
}

function graphCurveLines(graph: LitElementWithUpdate): SVGPathElement[] {
  return Array.from(graph.shadowRoot!.querySelectorAll<SVGPathElement>('path.curve-line'));
}

function firstHitCircle(graph: LitElementWithUpdate): SVGCircleElement {
  const circle = graph.shadowRoot!.querySelector<SVGCircleElement>('circle.hit-circle');
  expect(circle).not.toBeNull();
  return circle!;
}

describe('lightener-curve-card stress fixture', () => {
  it('renders 20 legend items and 20 curve lines', async () => {
    const { graph, legend } = await mountStressCard();

    expect(legendItems(legend)).toHaveLength(20);
    expect(graphCurveLines(graph)).toHaveLength(20);
  });

  it('long friendly names propagate into legend title attributes', async () => {
    const { fixture, legend } = await mountStressCard();
    const items = legendItems(legend);

    const expectedNames = new Set(fixture.curves.map((c) => c.friendlyName));
    for (const item of items) {
      const title = item.querySelector<HTMLElement>('.name')?.getAttribute('title') ?? '';
      expect(title.length, `title "${title}" must be >40 chars`).toBeGreaterThan(40);
      expect(
        expectedNames.has(title),
        `title "${title}" must be one of the fixture friendly names`
      ).toBe(true);
    }
    // All 20 names must appear (completeness check)
    const seenTitles = new Set(
      items.map((item) => item.querySelector<HTMLElement>('.name')?.getAttribute('title') ?? '')
    );
    expect(seenTitles.size).toBe(20);
  });

  it('negative guard: hass.states must not fall back to entityId stripping', async () => {
    const { card, fixture } = await mountStressCard();
    const curves = (card as unknown as CardInternals)._curves;
    const expectedNames = new Set(fixture.curves.map((c) => c.friendlyName));

    expect(curves).toHaveLength(20);
    // Length alone is insufficient: entityId.replace('light.', '') also exceeds 40 chars for this fixture.
    // Assert actual friendly names were read from hass.states (capitalized, space-separated).
    for (const curve of curves) {
      expect(
        expectedNames.has(curve.friendlyName),
        `"${curve.friendlyName}" must be a fixture friendly name, not a stripped entityId`
      ).toBe(true);
    }
  });

  it('CSS overflow contracts declared on .name-block, .name and .entity-id', () => {
    // jsdom does not process Shadow DOM adoptedStyleSheets so getComputedStyle
    // returns auto. Read CSS source text from the Lit class instead.
    const css = CurveLegendClass.styles.cssText.replace(/\s+/g, ' ');

    // .name-block: flex container must have min-width:0 to allow children to truncate
    const nameBlockRule = css.match(/\.name-block\s*\{[^}]*\}/i);
    expect(nameBlockRule, '.name-block rule must exist').not.toBeNull();
    expect(nameBlockRule![0]).toMatch(/min-width:\s*0/);

    // .name: the primary text child carries overflow+ellipsis
    const nameRule = css.match(/\.name\s*\{[^}]*\}/i);
    expect(nameRule, '.name rule must exist').not.toBeNull();
    expect(nameRule![0]).toMatch(/overflow:\s*hidden/);
    expect(nameRule![0]).toMatch(/text-overflow:\s*ellipsis/);

    // .entity-id: secondary text line also must not overflow
    const entityIdRule = css.match(/\.entity-id\s*\{[^}]*\}/i);
    expect(entityIdRule, '.entity-id rule must exist').not.toBeNull();
    expect(entityIdRule![0]).toMatch(/overflow:\s*hidden/);
    expect(entityIdRule![0]).toMatch(/text-overflow:\s*ellipsis/);
  });

  it('desktop matchMedia: hint text contains double-click, control point radius = 22', async () => {
    _mqlMatches = false;
    const { graph } = await mountStressCard();

    const hint = graph.shadowRoot!.querySelector<SVGTextElement>('.hint-select');
    expect(hint?.textContent).toContain('double-click');
    expect(firstHitCircle(graph).getAttribute('r')).toBe('22');
  });

  it('mobile matchMedia: hint text contains double-tap, control point radius = 28', async () => {
    const { card, graph } = await mountStressCard();

    _mqlMatches = true;
    mqlListeners[0]({ matches: true } as MediaQueryListEvent);
    await drainUpdates(card);

    const hint = graph.shadowRoot!.querySelector<SVGTextElement>('.hint-select');
    expect(hint?.textContent).toContain('double-tap');
    expect(firstHitCircle(graph).getAttribute('r')).toBe('28');
  });

  it('partial entity load: 10-entity callWS renders 10 legend items', async () => {
    const { legend } = await mountStressCard(10);

    expect(legendItems(legend)).toHaveLength(10);
  });

  it('brightness badge CSS contract declared', () => {
    // jsdom does not process Shadow DOM adoptedStyleSheets — read CSS source text.
    const css = CurveLegendClass.styles.cssText.replace(/\s+/g, ' ');
    const valueRule = css.match(/\.brightness-value\s*\{[^}]*\}/i);
    expect(valueRule, '.brightness-value rule must exist').not.toBeNull();
    const rule = valueRule![0];
    const usesEllipsis = /text-overflow:\s*ellipsis/.test(rule);
    const minWidthMatch = rule.match(/min-width:\s*(\d+)\s*px/);
    const fitsThreeDigits = !!minWidthMatch && parseInt(minWidthMatch[1], 10) >= 34;
    expect(
      usesEllipsis || fitsThreeDigits,
      '.brightness-value must use ellipsis or reserve ≥34px'
    ).toBe(true);
    expect(rule).toMatch(/overflow:\s*hidden/);
  });
});
