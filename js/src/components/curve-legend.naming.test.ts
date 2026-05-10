// @vitest-environment jsdom

/**
 * Wave 2 — Groups C & D: per-row name rendering and truncation contracts.
 *
 * Groups C/D documented in the test plan: friendly-name primary, entity_id
 * secondary, no concat-from-registry, common-prefix discriminator, min-width:0
 * for ellipsis, full value preserved in `title`, no auto-grow, no axis
 * rotation. Some pass today (title attr, friendlyName-as-source); others
 * fail and define the implementation work.
 */

import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { CurveLegend } from './curve-legend.js';
import { CurveLegend as CurveLegendClass } from './curve-legend.js';
import type { LightCurve } from '../utils/types.js';

beforeAll(async () => {
  if (typeof window !== 'undefined' && !window.matchMedia) {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: () => ({
        matches: false,
        addEventListener() {},
        removeEventListener() {},
      }),
    });
  }
  if (!customElements.get('ha-entity-picker')) {
    customElements.define(
      'ha-entity-picker',
      class extends HTMLElement {
        excludeEntities: string[] = [];
        value = '';
        hass: unknown = null;
        includeDomains: string[] = [];
      }
    );
  }
  await import('./curve-legend.js');
});

function makeLegend(curves: LightCurve[]): CurveLegend {
  const el = document.createElement('curve-legend') as CurveLegend;
  el.curves = curves;
  document.body.appendChild(el);
  return el;
}

const longName = 'Kleiderschrank - Magic Area Akzent';
const longEntityId = 'light.kleiderschrank_magic_area_akzent';

const sampleCurves: LightCurve[] = [
  {
    entityId: longEntityId,
    friendlyName: longName,
    controlPoints: [
      { lightener: 0, target: 0 },
      { lightener: 100, target: 100 },
    ],
    visible: true,
    color: '#2563eb',
  },
];

describe('Group C — friendly-name and entity_id rendering', () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it('C.9 renders entity_id as a secondary muted line below the friendly_name', async () => {
    const el = makeLegend(sampleCurves);
    await el.updateComplete;

    const root = el.renderRoot as ShadowRoot;
    const primary = root.querySelector('.name');
    expect(primary?.textContent?.trim()).toBe(longName);

    // Contract: a separate node carries the entity_id, with a class that
    // visually distinguishes it as muted secondary text.
    const secondary =
      root.querySelector('.entity-id') ??
      root.querySelector('.row-subtext') ??
      root.querySelector('[data-row="entity-id"]');
    expect(secondary, 'a secondary entity_id line must render').not.toBeNull();
    expect(secondary?.textContent?.trim()).toBe(longEntityId);
  });

  it('C.10 renders the friendly_name verbatim — never concatenates device.name + entity.name', async () => {
    // HA core 2026.4 changed the device-vs-entity name convention. Cards
    // that synthesize "DeviceName EntityName" duplicate labels for users
    // who renamed only one of the two. Lightener must read friendly_name
    // off the curve object as-is.
    const exact: LightCurve = {
      entityId: 'light.exact_label',
      friendlyName: 'My Custom Light',
      controlPoints: [
        { lightener: 0, target: 0 },
        { lightener: 100, target: 100 },
      ],
      visible: true,
      color: '#2563eb',
    };
    const el = makeLegend([exact]);
    await el.updateComplete;

    const primary = (el.renderRoot as ShadowRoot).querySelector('.name')!;
    expect(primary.textContent?.trim()).toBe('My Custom Light');
  });

  it('C.11 with N>1 sharing a prefix, the discriminator becomes the primary text and the prefix is shown muted', async () => {
    const curves: LightCurve[] = [
      {
        entityId: 'light.kl_akzent',
        friendlyName: 'Kleiderschrank - Magic Area Akzent',
        controlPoints: [
          { lightener: 0, target: 0 },
          { lightener: 100, target: 100 },
        ],
        visible: true,
        color: '#2563eb',
      },
      {
        entityId: 'light.kl_decke',
        friendlyName: 'Kleiderschrank - Magic Area Decke',
        controlPoints: [
          { lightener: 0, target: 0 },
          { lightener: 100, target: 100 },
        ],
        visible: true,
        color: '#ef5350',
      },
    ];
    const el = makeLegend(curves);
    await el.updateComplete;

    const root = el.renderRoot as ShadowRoot;
    const items = [...root.querySelectorAll('.legend-item')];
    expect(items).toHaveLength(2);

    // Pin the DOM contract specifically: .discriminator carries the unique
    // suffix as the primary line. Using `.discriminator, .name` would silently
    // pass via .name even if the discriminator class is dropped — TC6 from the
    // pre-ship test-coverage audit.
    const primaryTexts = items.map(
      (it) => it.querySelector('.discriminator')?.textContent?.trim() ?? ''
    );
    expect(primaryTexts).toEqual(['Akzent', 'Decke']);

    // .prefix must be a sibling of .discriminator inside .name-block, not a
    // descendant. Future refactors that nest them would invert the visual
    // hierarchy without breaking the textContent assertion.
    items.forEach((item) => {
      const block = item.querySelector('.name-block');
      expect(
        block,
        'every legend row must wrap name+prefix+entity_id in .name-block'
      ).not.toBeNull();
      const disc = block!.querySelector('.discriminator');
      const prefix = block!.querySelector('.prefix');
      expect(disc).not.toBeNull();
      expect(prefix).not.toBeNull();
      expect(prefix!.parentElement).toBe(block);
      expect(disc!.contains(prefix!)).toBe(false);
    });

    const prefixTexts = items.map((it) => it.querySelector('.prefix')?.textContent?.trim() ?? '');
    expect(prefixTexts).toEqual(['Kleiderschrank - Magic Area', 'Kleiderschrank - Magic Area']);
  });

  it('C.12 .name-block specifically declares min-width:0 (not just any selector)', () => {
    // CSS contract — protects against the ha-frontend #27570 regression class
    // where a long entity_id stretches its container instead of truncating.
    // Scope to the .name-block rule so unrelated rules can't satisfy this
    // assertion by coincidence (TC5 from the pre-ship coverage audit).
    const css = CurveLegendClass.styles.cssText.replace(/\s+/g, ' ');
    const blockRule = css.match(/\.name-block\s*\{[^}]*\}/);
    expect(blockRule, '.name-block CSS rule must exist').not.toBeNull();
    expect(blockRule![0]).toMatch(/min-width:\s*0/);
  });
});

describe('Group D — truncation, no-overflow, no axis rotation', () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it('D.13 long entity_id is preserved verbatim in the row title attribute', async () => {
    const el = makeLegend(sampleCurves);
    await el.updateComplete;

    const root = el.renderRoot as ShadowRoot;
    // Title can be on .name, .entity-id, or the row container — accept any.
    const candidates = [
      root.querySelector('.name'),
      root.querySelector('.entity-id'),
      root.querySelector('.legend-item'),
    ].filter(Boolean) as Element[];
    const titles = candidates.map((el) => el.getAttribute('title') ?? '').filter(Boolean);
    expect(titles, 'at least one row element must carry a title attr').not.toHaveLength(0);
    // The full friendly_name OR full entity_id must be present so the user
    // can recover the full text on long-press / hover.
    const haveFull = titles.some((t) => t.includes(longName) || t.includes(longEntityId));
    expect(haveFull, 'title must preserve the full name or full entity_id').toBe(true);
  });

  it('D.14 brightness-value badge does not auto-grow on overflow; it relies on text-overflow', () => {
    // T-Bubble #2138: 100% must not get clipped to "1" or auto-shrink the
    // numeric font-size. CSS contract: .brightness-value uses ellipsis on
    // overflow, not auto-shrink, and reserves enough width for "100%".
    const css = CurveLegendClass.styles.cssText.replace(/\s+/g, ' ');
    const valueRule = css.match(/\.brightness-value\s*\{[^}]*\}/i);
    expect(valueRule, '.brightness-value rule must exist').not.toBeNull();
    // Either ellipsis OR an explicit min-width that fits "100%" (≥34px).
    const rule = valueRule![0];
    const usesEllipsis = /text-overflow:\s*ellipsis/.test(rule);
    const minWidthMatch = rule.match(/min-width:\s*(\d+)\s*px/);
    const fitsThreeDigits = !!minWidthMatch && parseInt(minWidthMatch[1], 10) >= 34;
    expect(usesEllipsis || fitsThreeDigits).toBe(true);
  });

  it('D.15 graph axis labels do not use transform: rotate as a narrow-viewport fallback (apex #953)', async () => {
    // Y-axis label is allowed to be rotated 90° in normal layout, but the
    // contract is that a SHORT label fallback or stacked text is used at
    // narrow widths instead of rotating arbitrary axis labels. Today the
    // y-axis "Light brightness" is rotated by design; this test guards
    // against accidentally rotating tick / x-axis labels too.
    await import('./curve-graph.js');
    const graph = document.createElement('curve-graph') as unknown as CurveLegend;
    (graph as unknown as { curves: LightCurve[] }).curves = sampleCurves;
    document.body.appendChild(graph);
    await (graph as unknown as { updateComplete: Promise<void> }).updateComplete;

    const root = (graph as unknown as { shadowRoot: ShadowRoot }).shadowRoot;
    const ticks = [...root.querySelectorAll('text.tick-label')] as SVGTextElement[];
    expect(ticks.length).toBeGreaterThan(0);
    for (const t of ticks) {
      const transform = t.getAttribute('transform') ?? '';
      expect(transform, `tick label "${t.textContent}" must not be rotated`).not.toMatch(/rotate/i);
    }
  });
});
