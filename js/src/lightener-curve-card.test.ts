// @vitest-environment jsdom

import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import type { LightenerCurveCard } from './lightener-curve-card.js';
import type { Hass, LightCurve } from './utils/types.js';

// Tests reach private @state fields directly (instead of exposing a test-only
// setter on the card) because every production caller would have to ignore it.
// Read-only on the post-#70 source: _saving and _saveError are getters from _saveState.
type CardInternals = {
  _curves: LightCurve[];
  _onSave: () => Promise<void>;
};

function forceDirty(card: LightenerCurveCard): void {
  const internal = card as unknown as CardInternals;
  internal._curves = internal._curves.map((c) => ({
    ...c,
    controlPoints: [...c.controlPoints, { lightener: 75, target: 90 }],
  }));
}

// LightenerCurveCard.connectedCallback adds global keydown + beforeunload listeners
// on `window`. Without cleanup they accumulate across tests and can make this suite
// order-dependent. Unmounting every card between tests runs disconnectedCallback,
// which removes those listeners.
afterEach(() => {
  document.body.querySelectorAll('lightener-curve-card').forEach((el) => el.remove());
});

beforeAll(async () => {
  // curve-graph reads window.matchMedia during connectedCallback; jsdom doesn't ship it.
  if (typeof window !== 'undefined' && !window.matchMedia) {
    (window as unknown as { matchMedia: (q: string) => MediaQueryList }).matchMedia = (
      query: string
    ) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList;
  }
  await import('./lightener-curve-card.js');
});

function makeHass(overrides?: Partial<Hass>): Hass & {
  callWS: ReturnType<typeof vi.fn>;
  callService: ReturnType<typeof vi.fn>;
} {
  return {
    user: { is_admin: true },
    callWS: vi.fn().mockResolvedValue({ entities: {} }),
    callService: vi.fn().mockResolvedValue(undefined),
    states: {
      'light.lightener': { state: 'on', attributes: { friendly_name: 'Lightener' } },
      'light.a': { state: 'on', attributes: { friendly_name: 'Alpha' } },
      'light.b': { state: 'on', attributes: { friendly_name: 'Beta' } },
      'light.new': { state: 'off', attributes: { friendly_name: 'New' } },
    },
    ...overrides,
  } as Hass & {
    callWS: ReturnType<typeof vi.fn>;
    callService: ReturnType<typeof vi.fn>;
  };
}

async function mountCard(
  initialEntities: Record<string, { brightness: Record<string, string> }>,
  hass?: Hass
): Promise<{
  card: LightenerCurveCard;
  hass: Hass & { callWS: ReturnType<typeof vi.fn>; callService: ReturnType<typeof vi.fn> };
}> {
  const _hass =
    (hass as typeof hass & {
      callWS: ReturnType<typeof vi.fn>;
      callService: ReturnType<typeof vi.fn>;
    }) ?? makeHass();
  if (!hass) {
    (_hass.callWS as ReturnType<typeof vi.fn>).mockResolvedValue({ entities: initialEntities });
  }
  const card = document.createElement('lightener-curve-card') as LightenerCurveCard;
  card.setConfig({ entity: 'light.lightener' });
  card.hass = _hass;
  document.body.appendChild(card);
  // Wait for the initial WS load to settle
  await card.updateComplete;
  await Promise.resolve();
  await card.updateComplete;
  return { card, hass: _hass };
}

function fireLegend(card: LightenerCurveCard, event: string, detail: Record<string, unknown>) {
  const legend = card.renderRoot.querySelector('curve-legend')!;
  legend.dispatchEvent(new CustomEvent(event, { detail, bubbles: true, composed: true }));
}

describe('lightener-curve-card module', () => {
  it('publishes its version marker for the panel stale-bundle check', () => {
    expect(
      (window as unknown as { __LIGHTENER_CURVE_CARD_VERSION__?: string })
        .__LIGHTENER_CURVE_CARD_VERSION__
    ).toBe('2.15.0-dev.5');
  });
});

describe('lightener-curve-card — light management', () => {
  it('_onAddLight calls lightener/add_light with entity + preset', async () => {
    const { card, hass } = await mountCard({
      'light.a': { brightness: { '100': '100' } },
    });
    const afterAdd = {
      'light.a': { brightness: { '100': '100' } },
      'light.new': { brightness: { '1': '1', '100': '100' } },
    };
    hass.callWS.mockReset();
    hass.callWS.mockResolvedValueOnce(undefined); // add_light response
    hass.callWS.mockResolvedValueOnce({ entities: afterAdd }); // subsequent get_curves

    fireLegend(card, 'add-light', { entityId: 'light.new', preset: 'night_mode' });
    // Wait for the add + reload chain
    await new Promise((r) => setTimeout(r, 0));
    await card.updateComplete;
    await new Promise((r) => setTimeout(r, 0));
    await card.updateComplete;

    const addCall = hass.callWS.mock.calls.find(
      (c) => (c[0] as Record<string, unknown>)?.type === 'lightener/add_light'
    );
    expect(addCall).toBeDefined();
    expect(addCall![0]).toEqual({
      type: 'lightener/add_light',
      entity_id: 'light.lightener',
      controlled_entity_id: 'light.new',
      preset: 'night_mode',
    });
  });

  it('_onAddLight omits preset when not provided', async () => {
    const { card, hass } = await mountCard({
      'light.a': { brightness: { '100': '100' } },
    });
    hass.callWS.mockReset();
    hass.callWS.mockResolvedValueOnce(undefined);
    hass.callWS.mockResolvedValueOnce({ entities: {} });

    fireLegend(card, 'add-light', { entityId: 'light.new' });
    await new Promise((r) => setTimeout(r, 0));
    await card.updateComplete;

    const addCall = hass.callWS.mock.calls.find(
      (c) => (c[0] as Record<string, unknown>)?.type === 'lightener/add_light'
    );
    expect(addCall![0]).not.toHaveProperty('preset');
  });

  it('_onRemoveLight calls lightener/remove_light and reloads curves', async () => {
    const { card, hass } = await mountCard({
      'light.a': { brightness: { '100': '100' } },
      'light.b': { brightness: { '100': '80' } },
    });
    const afterRemove = { 'light.b': { brightness: { '100': '80' } } };
    hass.callWS.mockReset();
    hass.callWS.mockResolvedValueOnce(undefined);
    hass.callWS.mockResolvedValueOnce({ entities: afterRemove });

    fireLegend(card, 'remove-light', { entityId: 'light.a' });
    await new Promise((r) => setTimeout(r, 0));
    await card.updateComplete;
    await new Promise((r) => setTimeout(r, 0));
    await card.updateComplete;

    const removeCall = hass.callWS.mock.calls.find(
      (c) => (c[0] as Record<string, unknown>)?.type === 'lightener/remove_light'
    );
    expect(removeCall![0]).toEqual({
      type: 'lightener/remove_light',
      entity_id: 'light.lightener',
      controlled_entity_id: 'light.a',
    });
    const reloadCall = hass.callWS.mock.calls.find(
      (c) => (c[0] as Record<string, unknown>)?.type === 'lightener/get_curves'
    );
    expect(reloadCall).toBeDefined();
  });

  it('surfaces backend error message via _manageError on add failure', async () => {
    const { card, hass } = await mountCard({
      'light.a': { brightness: { '100': '100' } },
    });
    hass.callWS.mockReset();
    hass.callWS.mockRejectedValueOnce({ code: 'already_exists', message: 'Dup!' });

    fireLegend(card, 'add-light', { entityId: 'light.a' });
    await new Promise((r) => setTimeout(r, 0));
    await card.updateComplete;

    const err = card.renderRoot.querySelector('.side-rail .error');
    expect(err?.textContent).toContain('Dup!');
  });

  it('does nothing when remove-light fires with no entityId', async () => {
    const { card, hass } = await mountCard({
      'light.a': { brightness: { '100': '100' } },
      'light.b': { brightness: { '100': '80' } },
    });
    hass.callWS.mockReset();
    fireLegend(card, 'remove-light', {});
    await card.updateComplete;
    expect(hass.callWS).not.toHaveBeenCalled();
  });

  it('passes the current entity to excludeEntityIds on the legend', async () => {
    const { card } = await mountCard({
      'light.a': { brightness: { '100': '100' } },
    });
    const legend = card.renderRoot.querySelector('curve-legend') as unknown as {
      excludeEntityIds: string[];
    };
    expect(legend.excludeEntityIds).toEqual(['light.lightener']);
  });

  it('flips managing=true on the legend during the WS round trip', async () => {
    const { card, hass } = await mountCard({
      'light.a': { brightness: { '100': '100' } },
    });
    let resolveAdd: () => void = () => {};
    const addPromise = new Promise<void>((r) => {
      resolveAdd = r;
    });
    hass.callWS.mockReset();
    hass.callWS.mockImplementationOnce(() => addPromise);
    hass.callWS.mockResolvedValueOnce({ entities: {} });

    fireLegend(card, 'add-light', { entityId: 'light.new' });
    await card.updateComplete;

    const legend = card.renderRoot.querySelector('curve-legend') as unknown as {
      managing: boolean;
    };
    expect(legend.managing).toBe(true);

    resolveAdd();
    await new Promise((r) => setTimeout(r, 0));
    await card.updateComplete;
    await new Promise((r) => setTimeout(r, 0));
    await card.updateComplete;
    expect(legend.managing).toBe(false);
  });

  it('hides presets, scrubber, and live preview controls when no lights are configured', async () => {
    const { card } = await mountCard({});

    const buttons = [...card.renderRoot.querySelectorAll('button')].map((button) =>
      button.textContent?.trim()
    );
    expect(buttons).not.toContain('Presets');
    expect(buttons).not.toContain('Preview all lights');
    expect(card.renderRoot.querySelector('curve-scrubber')).toBeNull();

    const graph = card.renderRoot.querySelector('curve-graph')!;
    await graph.updateComplete;
    expect(graph.shadowRoot?.textContent).toContain('Add a light below to get started');
  });

  it('keeps Presets and Add light mutually exclusive', async () => {
    const { card } = await mountCard({
      'light.a': { brightness: { '100': '100' } },
    });

    card.renderRoot.querySelector<HTMLButtonElement>('.presets-btn')!.click();
    await card.updateComplete;
    expect(card.renderRoot.querySelector('.presets-panel')).not.toBeNull();

    fireLegend(card, 'add-panel-open', {});
    await card.updateComplete;
    expect(card.renderRoot.querySelector('.presets-panel')).toBeNull();

    card.renderRoot.querySelector<HTMLButtonElement>('.presets-btn')!.click();
    await card.updateComplete;
    const legend = card.renderRoot.querySelector('curve-legend') as unknown as {
      closeAddSignal: number;
    };
    expect(legend.closeAddSignal).toBeGreaterThan(0);
  });
});

describe('lightener-curve-card — save flow', () => {
  it('_onSave dispatches lightener/save_curves with the current curves payload', async () => {
    const { card, hass } = await mountCard({
      'light.a': { brightness: { '100': '100' } },
    });
    hass.callWS.mockReset();
    hass.callWS.mockImplementation((msg: { type: string }) =>
      msg.type === 'lightener/save_curves'
        ? Promise.resolve(undefined)
        : Promise.resolve({ entities: { 'light.a': { brightness: { '100': '100' } } } })
    );

    forceDirty(card);
    await (card as unknown as CardInternals)._onSave();

    const saveCall = hass.callWS.mock.calls.find(
      (c) => (c[0] as Record<string, unknown>)?.type === 'lightener/save_curves'
    );
    expect(saveCall).toBeDefined();
    const msg = saveCall![0] as { entity_id: string; curves: Record<string, unknown> };
    expect(msg.entity_id).toBe('light.lightener');
    expect(msg.curves).toBeDefined();
    expect(Object.keys(msg.curves)).toContain('light.a');
  });

  it('_onSave clears _saving and surfaces _saveError when the WS save rejects', async () => {
    const { card, hass } = await mountCard({
      'light.a': { brightness: { '100': '100' } },
    });
    hass.callWS.mockReset();
    hass.callWS.mockRejectedValueOnce(new Error('ws transport failed'));

    forceDirty(card);
    await (card as unknown as CardInternals)._onSave();
    await card.updateComplete;

    // The card MUST recover: a stuck _saving=true freezes the save button
    // until the user reloads the panel.
    const view = card as unknown as { _saving: boolean; _saveError: string | null };
    expect(view._saving).toBe(false);
    expect(view._saveError).not.toBeNull();
  });
});
