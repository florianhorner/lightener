// @vitest-environment jsdom

import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import type { LightenerCurveCard } from './lightener-curve-card.js';
import type { Hass, LightCurve } from './utils/types.js';

// Tests reach private @state fields directly (instead of exposing a test-only
// setter on the card) because every production caller would have to ignore it.
// Read-only on the post-#70 source: _saving and _saveError are getters from _saveState.
type CardInternals = {
  _curves: LightCurve[];
  _selectedCurveId: string | null;
  _onSave: () => Promise<void>;
  _onCancel: () => void;
  _undo: () => void;
  _tryLoadCurves: () => Promise<void>;
  _undoStack: LightCurve[][];
  _loaded: boolean;
  _loading: boolean;
  _pendingReloadEntityId: string | undefined;
  _reloadAfterLoadEntityId: string | undefined;
  _dirtyVersion: number;
  _cleanVersion: number;
  _eligibleAddLightIds: string[] | null;
  _startPreview: () => void;
  _scrubberPosition: number | null;
  _lastPreviewTime: number;
  _onPointMove: (e: CustomEvent) => void;
  _onPointDrop: (e: CustomEvent) => void;
  _onPointAdd: (e: CustomEvent) => void;
  _onPointRemove: (e: CustomEvent) => void;
  _dragActive: boolean;
  _applyPreset: (preset: {
    id: string;
    name: string;
    description: string;
    controlPoints: LightCurve['controlPoints'];
  }) => void;
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
  callApi: ReturnType<typeof vi.fn>;
  callService: ReturnType<typeof vi.fn>;
} {
  return {
    user: { is_admin: true },
    callWS: vi.fn().mockResolvedValue({ entities: {} }),
    callApi: vi.fn().mockResolvedValue(undefined),
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
    callApi: ReturnType<typeof vi.fn>;
    callService: ReturnType<typeof vi.fn>;
  };
}

async function mountCard(
  initialEntities: Record<string, { brightness: Record<string, string> }>,
  hass?: Hass
): Promise<{
  card: LightenerCurveCard;
  hass: Hass & {
    callWS: ReturnType<typeof vi.fn>;
    callApi: ReturnType<typeof vi.fn>;
    callService: ReturnType<typeof vi.fn>;
  };
}> {
  const _hass =
    (hass as typeof hass & {
      callWS: ReturnType<typeof vi.fn>;
      callApi: ReturnType<typeof vi.fn>;
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

function mockImmediateRaf(): ReturnType<typeof vi.spyOn> {
  return vi
    .spyOn(window, 'requestAnimationFrame')
    .mockImplementation((cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    });
}

describe('lightener-curve-card module', () => {
  it('publishes its version marker for the panel stale-bundle check', () => {
    expect(
      (window as unknown as { __LIGHTENER_CURVE_CARD_VERSION__?: string })
        .__LIGHTENER_CURVE_CARD_VERSION__
    ).toBe('2.15.0-dev.7');
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

  it('loads eligible add-light ids when the add panel opens', async () => {
    const { card, hass } = await mountCard({
      'light.a': { brightness: { '100': '100' } },
    });
    hass.callWS.mockReset();
    hass.callWS.mockResolvedValueOnce({ entities: ['light.free_bulb'] });

    fireLegend(card, 'add-panel-open', {});
    await Promise.resolve();
    await Promise.resolve();
    await card.updateComplete;

    expect(hass.callWS).toHaveBeenCalledWith({
      type: 'lightener/list_eligible_lights',
    });
    const legend = card.renderRoot.querySelector('curve-legend') as unknown as {
      includeEntityIds: string[] | null;
    };
    expect(legend.includeEntityIds).toEqual(['light.free_bulb']);
  });

  it('clears cached eligible add-light ids after add and remove mutations', async () => {
    const { card, hass } = await mountCard({
      'light.a': { brightness: { '100': '100' } },
      'light.b': { brightness: { '100': '80' } },
    });
    const internal = card as unknown as CardInternals;

    internal._eligibleAddLightIds = ['light.free_bulb'];
    hass.callWS.mockReset();
    hass.callWS.mockResolvedValueOnce(undefined);
    hass.callWS.mockResolvedValueOnce({
      entities: {
        'light.a': { brightness: { '100': '100' } },
        'light.b': { brightness: { '100': '80' } },
        'light.new': { brightness: { '100': '100' } },
      },
    });
    fireLegend(card, 'add-light', { entityId: 'light.new' });
    await new Promise((r) => setTimeout(r, 0));
    await card.updateComplete;
    expect(internal._eligibleAddLightIds).toBeNull();

    internal._eligibleAddLightIds = ['light.other_bulb'];
    hass.callWS.mockReset();
    hass.callWS.mockResolvedValueOnce(undefined);
    hass.callWS.mockResolvedValueOnce({
      entities: {
        'light.b': { brightness: { '100': '80' } },
        'light.new': { brightness: { '100': '100' } },
      },
    });
    fireLegend(card, 'remove-light', { entityId: 'light.a' });
    await new Promise((r) => setTimeout(r, 0));
    await card.updateComplete;
    expect(internal._eligibleAddLightIds).toBeNull();
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

  describe('delete group via curve card', () => {
    it('happy path: registry lookup then DELETE entry via callApi', async () => {
      const { card, hass } = await mountCard({
        'light.a': { brightness: { '100': '100' } },
      });
      const deletedEvents: CustomEvent[] = [];
      card.addEventListener('lightener-group-deleted', (event) => {
        deletedEvents.push(event as CustomEvent);
      });

      hass.callWS.mockReset();
      hass.callWS.mockResolvedValueOnce({
        platform: 'lightener',
        config_entry_id: 'E1',
      });
      hass.callApi.mockResolvedValueOnce(undefined);

      await (card as unknown as { _onDeleteGroup: () => Promise<void> })._onDeleteGroup();

      expect(hass.callWS).toHaveBeenCalledWith({
        type: 'config/entity_registry/get',
        entity_id: 'light.lightener',
      });
      expect(hass.callApi).toHaveBeenCalledTimes(1);
      expect(hass.callApi).toHaveBeenCalledWith('DELETE', 'config/config_entries/entry/E1');
      expect(
        hass.callWS.mock.calls.filter(
          ([msg]) => (msg as { type?: string } | undefined)?.type === 'config_entries/remove'
        )
      ).toHaveLength(0);
      expect(deletedEvents).toHaveLength(1);
      expect(deletedEvents[0].detail.configEntryId).toBe('E1');
    });
  });
});

describe('lightener-curve-card — save flow', () => {
  it('defers curve overwrite when dirty', async () => {
    const { card, hass } = await mountCard({
      'light.a': { brightness: { '1': '1', '100': '100' } },
    });
    const internal = card as unknown as CardInternals;
    const graph = card.renderRoot.querySelector('curve-graph')!;
    let resolveReload: (value: {
      entities: Record<string, { brightness: Record<string, string> }>;
    }) => void = () => {};
    const reloadPromise = new Promise<{
      entities: Record<string, { brightness: Record<string, string> }>;
    }>((resolve) => {
      resolveReload = resolve;
    });

    hass.callWS.mockReset();
    hass.callWS.mockReturnValueOnce(reloadPromise);
    internal._loaded = false;
    const load = internal._tryLoadCurves();

    graph.dispatchEvent(
      new CustomEvent('point-move', {
        detail: { curveIndex: 0, pointIndex: 1, lightener: 50, target: 60 },
        bubbles: true,
        composed: true,
      })
    );

    resolveReload({ entities: { 'light.b': { brightness: { '1': '5', '100': '10' } } } });
    await load;
    await card.updateComplete;

    expect(internal._curves.map((curve) => curve.entityId)).toEqual(['light.a']);
    expect(internal._curves[0].controlPoints).toContainEqual({ lightener: 50, target: 60 });
    expect(internal._loading).toBe(false);
    expect(internal._loaded).toBe(true);
    expect(internal._pendingReloadEntityId).toBe('light.lightener');
  });

  it('hass state push during drag does not reload curves', async () => {
    const { card, hass } = await mountCard({
      'light.a': { brightness: { '1': '1', '100': '100' } },
    });
    const internal = card as unknown as CardInternals;

    hass.callWS.mockReset();
    hass.callWS.mockResolvedValue({ entities: {} });
    internal._loaded = false;

    internal._onPointMove(
      new CustomEvent('point-move', {
        detail: { curveIndex: 0, pointIndex: 1, lightener: 50, target: 60 },
      })
    );
    card.hass = hass;

    expect(hass.callWS).not.toHaveBeenCalled();
    expect(internal._curves[0].controlPoints[1]).toEqual({ lightener: 50, target: 60 });

    internal._onPointDrop(new CustomEvent('point-drop'));
    card.hass = hass;

    expect(hass.callWS).toHaveBeenCalledWith({
      type: 'lightener/get_curves',
      entity_id: 'light.lightener',
    });
  });

  it('applies reload when clean after dirty state clears', async () => {
    const { card, hass } = await mountCard({
      'light.a': { brightness: { '1': '1', '100': '100' } },
    });
    const internal = card as unknown as CardInternals;
    const graph = card.renderRoot.querySelector('curve-graph')!;
    let resolveDirtyReload: (value: {
      entities: Record<string, { brightness: Record<string, string> }>;
    }) => void = () => {};
    const dirtyReloadPromise = new Promise<{
      entities: Record<string, { brightness: Record<string, string> }>;
    }>((resolve) => {
      resolveDirtyReload = resolve;
    });

    hass.callWS.mockReset();
    hass.callWS.mockReturnValueOnce(dirtyReloadPromise);
    internal._loaded = false;
    const dirtyLoad = internal._tryLoadCurves();
    graph.dispatchEvent(
      new CustomEvent('point-move', {
        detail: { curveIndex: 0, pointIndex: 1, lightener: 50, target: 60 },
        bubbles: true,
        composed: true,
      })
    );
    resolveDirtyReload({ entities: { 'light.b': { brightness: { '1': '5', '100': '10' } } } });
    await dirtyLoad;

    // Simulate the save path: _saveCurves() resets _loaded before calling _tryLoadCurves().
    // Without this reset, the early-out guard correctly blocks re-loading.
    internal._cleanVersion = internal._dirtyVersion;
    internal._loaded = false;
    hass.callWS.mockResolvedValueOnce({
      entities: { 'light.b': { brightness: { '1': '5', '100': '10' } } },
    });

    await internal._tryLoadCurves();
    await card.updateComplete;

    expect(internal._curves.map((curve) => curve.entityId)).toEqual(['light.b']);
    expect(internal._loading).toBe(false);
    expect(internal._pendingReloadEntityId).toBeUndefined();
  });

  it('refetches a dirty-deferred reload after cancel restores the clean snapshot', async () => {
    const { card, hass } = await mountCard({
      'light.a': { brightness: { '1': '1', '100': '100' } },
    });
    const internal = card as unknown as CardInternals;
    const graph = card.renderRoot.querySelector('curve-graph')!;
    let resolveDirtyReload: (value: {
      entities: Record<string, { brightness: Record<string, string> }>;
    }) => void = () => {};
    const dirtyReloadPromise = new Promise<{
      entities: Record<string, { brightness: Record<string, string> }>;
    }>((resolve) => {
      resolveDirtyReload = resolve;
    });

    hass.callWS.mockReset();
    hass.callWS.mockReturnValueOnce(dirtyReloadPromise);
    internal._loaded = false;
    const dirtyLoad = internal._tryLoadCurves();
    graph.dispatchEvent(
      new CustomEvent('point-move', {
        detail: { curveIndex: 0, pointIndex: 1, lightener: 50, target: 60 },
        bubbles: true,
        composed: true,
      })
    );
    resolveDirtyReload({ entities: { 'light.b': { brightness: { '1': '5', '100': '10' } } } });
    await dirtyLoad;

    hass.callWS.mockResolvedValueOnce({
      entities: { 'light.b': { brightness: { '1': '5', '100': '10' } } },
    });
    const rafSpy = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb: FrameRequestCallback) => {
        cb(performance.now() + 301);
        return 1;
      });

    internal._onCancel();
    await Promise.resolve();
    await Promise.resolve();
    await card.updateComplete;
    rafSpy.mockRestore();

    expect(internal._curves.map((curve) => curve.entityId)).toEqual(['light.b']);
    expect(internal._pendingReloadEntityId).toBeUndefined();
    expect(internal._loaded).toBe(true);
  });

  it('refetches a dirty-deferred reload after undo restores the clean snapshot', async () => {
    const { card, hass } = await mountCard({
      'light.a': { brightness: { '1': '1', '100': '100' } },
    });
    const internal = card as unknown as CardInternals;
    const graph = card.renderRoot.querySelector('curve-graph')!;
    let resolveDirtyReload: (value: {
      entities: Record<string, { brightness: Record<string, string> }>;
    }) => void = () => {};
    const dirtyReloadPromise = new Promise<{
      entities: Record<string, { brightness: Record<string, string> }>;
    }>((resolve) => {
      resolveDirtyReload = resolve;
    });

    hass.callWS.mockReset();
    hass.callWS.mockReturnValueOnce(dirtyReloadPromise);
    internal._loaded = false;
    const dirtyLoad = internal._tryLoadCurves();
    graph.dispatchEvent(
      new CustomEvent('point-move', {
        detail: { curveIndex: 0, pointIndex: 1, lightener: 50, target: 60 },
        bubbles: true,
        composed: true,
      })
    );
    resolveDirtyReload({ entities: { 'light.b': { brightness: { '1': '5', '100': '10' } } } });
    await dirtyLoad;

    hass.callWS.mockResolvedValueOnce({
      entities: { 'light.b': { brightness: { '1': '5', '100': '10' } } },
    });
    const rafSpy = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb: FrameRequestCallback) => {
        cb(performance.now() + 301);
        return 1;
      });

    internal._undo();
    await Promise.resolve();
    await Promise.resolve();
    await card.updateComplete;
    rafSpy.mockRestore();

    expect(internal._curves.map((curve) => curve.entityId)).toEqual(['light.b']);
    expect(internal._pendingReloadEntityId).toBeUndefined();
    expect(internal._loaded).toBe(true);
  });

  it('queues the post-save reload when an older curve load is still in flight', async () => {
    const { card, hass } = await mountCard({
      'light.a': { brightness: { '1': '1', '100': '100' } },
    });
    const internal = card as unknown as CardInternals;
    const graph = card.renderRoot.querySelector('curve-graph')!;
    let resolveStaleReload: (value: {
      entities: Record<string, { brightness: Record<string, string> }>;
    }) => void = () => {};
    const staleReloadPromise = new Promise<{
      entities: Record<string, { brightness: Record<string, string> }>;
    }>((resolve) => {
      resolveStaleReload = resolve;
    });
    let getCurveCalls = 0;

    hass.callWS.mockReset();
    hass.callWS.mockImplementation((msg: { type: string }) => {
      if (msg.type === 'lightener/get_curves') {
        getCurveCalls++;
        if (getCurveCalls === 1) return staleReloadPromise;
        return Promise.resolve({
          entities: { 'light.fresh': { brightness: { '1': '9', '100': '90' } } },
        });
      }
      if (msg.type === 'lightener/save_curves') return Promise.resolve(undefined);
      return Promise.resolve({ entities: {} });
    });

    internal._loaded = false;
    const staleLoad = internal._tryLoadCurves();
    graph.dispatchEvent(
      new CustomEvent('point-move', {
        detail: { curveIndex: 0, pointIndex: 1, lightener: 50, target: 60 },
        bubbles: true,
        composed: true,
      })
    );

    await internal._onSave();
    expect(internal._reloadAfterLoadEntityId).toBe('light.lightener');

    resolveStaleReload({
      entities: { 'light.stale': { brightness: { '1': '2', '100': '20' } } },
    });
    await staleLoad;
    await Promise.resolve();
    await Promise.resolve();
    await card.updateComplete;

    expect(getCurveCalls).toBe(2);
    expect(internal._curves.map((curve) => curve.entityId)).toEqual(['light.fresh']);
    expect(internal._reloadAfterLoadEntityId).toBeUndefined();
  });

  it('clears stale undo history when switching entities with unsaved edits', async () => {
    const { card, hass } = await mountCard({
      'light.a': { brightness: { '1': '1', '100': '100' } },
    });
    const internal = card as unknown as CardInternals;
    const graph = card.renderRoot.querySelector('curve-graph')!;

    graph.dispatchEvent(
      new CustomEvent('point-move', {
        detail: { curveIndex: 0, pointIndex: 1, lightener: 50, target: 60 },
        bubbles: true,
        composed: true,
      })
    );
    await card.updateComplete;
    expect(card.dirty).toBe(true);
    expect(internal._undoStack.length).toBeGreaterThan(0);

    hass.callWS.mockResolvedValueOnce({
      entities: { 'light.b': { brightness: { '1': '5', '100': '10' } } },
    });
    card.setConfig({ entity: 'light.lightener_two' });

    expect(card.dirty).toBe(false);
    expect(internal._selectedCurveId).toBeNull();
    expect(internal._undoStack).toHaveLength(0);
  });

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
    const msg = saveCall![0] as {
      entity_id: string;
      curves: Record<string, { brightness: Record<string, string> }>;
    };
    expect(msg.entity_id).toBe('light.lightener');
    // forceDirty appended {lightener:75, target:90}; assert the round-trip into
    // the WS payload so a regression that drops the mutation (or breaks
    // curvesToWsPayload's serialization) fails this test, not just one that
    // forgets to populate `curves` at all.
    expect(msg.curves['light.a'].brightness['75']).toBe('90');
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
    // until the user reloads the panel. The error string is the user-visible
    // contract — leaking the raw exception ("ws transport failed") would
    // satisfy a `not.toBeNull()` assertion but expose internals to users.
    const view = card as unknown as { _saving: boolean; _saveError: string | null };
    expect(view._saving).toBe(false);
    expect(view._saveError).toBe('Save failed. Check connection.');
  });
});

describe('lightener-curve-card — onboarding handoff (preset auto-open)', () => {
  // The freshly-created group's curves arrive as the linear default
  // ({0,0}, {1,1}, {100,100} after wsPayloadToCurves seeds (0,0)). The card
  // is the new "pick a preset visually" surface that replaced the form-based
  // preset radio in the config flow — if this auto-open regresses, fresh
  // groups land on a blank graph with no signposting.

  it('auto-opens the presets panel when all loaded curves are at the linear default', async () => {
    const { card } = await mountCard({
      'light.a': { brightness: { '1': '1', '100': '100' } },
    });
    expect(card.renderRoot.querySelector('.presets-panel')).not.toBeNull();
  });

  it('does not auto-open the presets panel when curves are non-default', async () => {
    const { card } = await mountCard({
      'light.a': { brightness: { '1': '1', '50': '20', '100': '100' } },
    });
    expect(card.renderRoot.querySelector('.presets-panel')).toBeNull();
  });

  it('does not re-open after dismissal on the same entity', async () => {
    const { card, hass } = await mountCard({
      'light.a': { brightness: { '1': '1', '100': '100' } },
    });
    expect(card.renderRoot.querySelector('.presets-panel')).not.toBeNull();

    // Dismiss via the side-rail toggle — same path the user takes.
    const presetsBtn = card.renderRoot.querySelector('.presets-btn') as HTMLButtonElement;
    expect(presetsBtn).not.toBeNull();
    presetsBtn.click();
    await card.updateComplete;
    expect(card.renderRoot.querySelector('.presets-panel')).toBeNull();

    // A subsequent load for the SAME entity must not re-open the panel.
    hass.callWS.mockResolvedValueOnce({
      entities: { 'light.a': { brightness: { '1': '1', '100': '100' } } },
    });
    (card as unknown as { _loaded: boolean })._loaded = false;
    card.hass = hass;
    await card.updateComplete;
    await Promise.resolve();
    await card.updateComplete;
    expect(card.renderRoot.querySelector('.presets-panel')).toBeNull();
  });

  it('does not re-open after navigating to another fresh group and back', async () => {
    const { card, hass } = await mountCard({
      'light.a': { brightness: { '1': '1', '100': '100' } },
    });
    // Initial auto-open for entity 1, then user dismisses.
    (card.renderRoot.querySelector('.presets-btn') as HTMLButtonElement).click();
    await card.updateComplete;
    expect(card.renderRoot.querySelector('.presets-panel')).toBeNull();

    // Switch to a different fresh group — should auto-open for the new one.
    hass.callWS.mockResolvedValueOnce({
      entities: { 'light.b': { brightness: { '1': '1', '100': '100' } } },
    });
    card.setConfig({ entity: 'light.lightener_two' });
    await card.updateComplete;
    await Promise.resolve();
    await card.updateComplete;
    expect(card.renderRoot.querySelector('.presets-panel')).not.toBeNull();

    // User dismisses the second auto-open.
    (card.renderRoot.querySelector('.presets-btn') as HTMLButtonElement).click();
    await card.updateComplete;
    expect(card.renderRoot.querySelector('.presets-panel')).toBeNull();

    // Switch back to the first fresh group — must NOT re-open even though
    // _showPresets and _loaded are reset by setConfig.
    hass.callWS.mockResolvedValueOnce({
      entities: { 'light.a': { brightness: { '1': '1', '100': '100' } } },
    });
    card.setConfig({ entity: 'light.lightener' });
    await card.updateComplete;
    await Promise.resolve();
    await card.updateComplete;
    expect(card.renderRoot.querySelector('.presets-panel')).toBeNull();
  });
});

describe('lightener-curve-card — selection (_onSelectCurve wiring)', () => {
  // These tests cover the card's integration with canSelectCurve + toggleSelection
  // helpers in card-logic.ts. The helpers are unit-tested in isolation; here we
  // verify the wiring: dispatching select-curve events from a child component
  // mutates _selectedCurveId in the documented ways.

  it('selects a visible curve and toggles deselect on second event', async () => {
    const { card } = await mountCard({
      'light.a': { brightness: { '1': '1', '100': '100' } },
      'light.b': { brightness: { '1': '1', '100': '100' } },
    });
    const internal = card as unknown as CardInternals;
    expect(internal._selectedCurveId).toBeNull();

    fireLegend(card, 'select-curve', { entityId: 'light.a' });
    await card.updateComplete;
    expect(internal._selectedCurveId).toBe('light.a');

    fireLegend(card, 'select-curve', { entityId: 'light.a' });
    await card.updateComplete;
    expect(internal._selectedCurveId).toBeNull();
  });

  it('switches selection when a different visible curve is clicked', async () => {
    const { card } = await mountCard({
      'light.a': { brightness: { '1': '1', '100': '100' } },
      'light.b': { brightness: { '1': '1', '100': '100' } },
    });
    const internal = card as unknown as CardInternals;

    fireLegend(card, 'select-curve', { entityId: 'light.a' });
    await card.updateComplete;
    expect(internal._selectedCurveId).toBe('light.a');

    fireLegend(card, 'select-curve', { entityId: 'light.b' });
    await card.updateComplete;
    expect(internal._selectedCurveId).toBe('light.b');
  });

  it('blocks selection of a hidden curve', async () => {
    const { card } = await mountCard({
      'light.a': { brightness: { '1': '1', '100': '100' } },
      'light.b': { brightness: { '1': '1', '100': '100' } },
    });
    const internal = card as unknown as CardInternals;
    // Hide light.b
    internal._curves = internal._curves.map((c) =>
      c.entityId === 'light.b' ? { ...c, visible: false } : c
    );
    await card.updateComplete;

    fireLegend(card, 'select-curve', { entityId: 'light.b' });
    await card.updateComplete;
    expect(internal._selectedCurveId).toBeNull();
  });

  it('blocks selection of an unknown entityId (the post-refactor behavior tightening)', async () => {
    const { card } = await mountCard({
      'light.a': { brightness: { '1': '1', '100': '100' } },
    });
    const internal = card as unknown as CardInternals;

    fireLegend(card, 'select-curve', { entityId: 'light.does-not-exist' });
    await card.updateComplete;
    expect(internal._selectedCurveId).toBeNull();
  });

  // ── Group A: selection state contract (Wave 1, plan groups A.1–A.4) ──
  // These document the intended four-way visual contract. Some currently fail
  // against master — that is the point. Each failing test is the work
  // definition for the corresponding fix.

  it('A.1 hides the in-graph "Select a light" hint while a curve is selected', async () => {
    const { card } = await mountCard({
      'light.a': { brightness: { '1': '1', '50': '40', '100': '100' } },
    });
    const graph = card.renderRoot.querySelector('curve-graph')!;
    await graph.updateComplete;

    // No selection: the hint is rendered.
    const hintBefore = graph.shadowRoot?.querySelector('.hint-select');
    expect(hintBefore, 'hint-select should render when nothing is selected').not.toBeNull();
    expect(hintBefore?.textContent ?? '').toMatch(/select a light/i);

    // After selecting, the hint must be gone (replaced by editing-label).
    fireLegend(card, 'select-curve', { entityId: 'light.a' });
    await card.updateComplete;
    await graph.updateComplete;
    expect(
      graph.shadowRoot?.querySelector('.hint-select'),
      'hint-select must not render when a curve is selected'
    ).toBeNull();
    expect(graph.shadowRoot?.querySelector('.editing-label')).not.toBeNull();
  });

  it('A.2 selected curve has solid stroke; unselected curves are dashed', async () => {
    const { card } = await mountCard({
      'light.a': { brightness: { '1': '1', '100': '100' } },
      'light.b': { brightness: { '1': '1', '100': '100' } },
    });
    const internal = card as unknown as CardInternals;
    // Select light.b deliberately. light.a is curveIdx=0 and the legacy
    // DASH_PATTERNS lookup makes idx-0 solid by coincidence; selecting light.b
    // forces the test to actually depend on selection, not index.
    fireLegend(card, 'select-curve', { entityId: 'light.b' });
    await card.updateComplete;
    const graph = card.renderRoot.querySelector('curve-graph')!;
    await graph.updateComplete;

    const lines = Array.from(
      graph.shadowRoot?.querySelectorAll('path.curve-line') ?? []
    ) as SVGPathElement[];
    expect(lines.length).toBe(2);
    const selectedColor = internal._curves.find((c) => c.entityId === 'light.b')!.color;
    const selectedLine = lines.find((line) => line.getAttribute('stroke') === selectedColor);
    const unselectedLines = lines.filter((line) => line !== selectedLine);
    expect(selectedLine, 'selected curve line must render').not.toBeUndefined();

    // Contract: exactly one line is solid (the selected curve). Solid is
    // either no dasharray attribute, "0", "none", or a single "0 0" pattern.
    const isSolid = (el: SVGPathElement): boolean => {
      const v = (el.getAttribute('stroke-dasharray') ?? '').trim();
      return v === '' || v === '0' || v === 'none' || /^0(\s+0)*$/.test(v);
    };
    expect(isSolid(selectedLine!), 'the selected curve-line itself must be solid').toBe(true);
    expect(
      unselectedLines.every((line) => !isSolid(line)),
      'all unselected curve-lines must be dashed'
    ).toBe(true);
  });

  it('A.3 only the selected curve renders a filled area; others are line-only', async () => {
    const { card } = await mountCard({
      'light.a': { brightness: { '1': '1', '100': '100' } },
      'light.b': { brightness: { '1': '1', '100': '100' } },
      'light.c': { brightness: { '1': '1', '100': '100' } },
    });
    fireLegend(card, 'select-curve', { entityId: 'light.b' });
    await card.updateComplete;
    const graph = card.renderRoot.querySelector('curve-graph')!;
    await graph.updateComplete;

    // Fill paths are <path fill="url(#grad-…)"> rendered alongside curve-line.
    const fillPaths = Array.from(
      graph.shadowRoot?.querySelectorAll('path[fill^="url(#grad-"]') ?? []
    ) as SVGPathElement[];
    expect(
      fillPaths.length,
      'with N curves and one selected, exactly 1 fill polygon must render'
    ).toBe(1);
  });

  it('A.4 clear-edit affordance toggles the selection off', async () => {
    const { card } = await mountCard({
      'light.a': { brightness: { '1': '1', '100': '100' } },
      'light.b': { brightness: { '1': '1', '100': '100' } },
    });
    const internal = card as unknown as CardInternals;

    fireLegend(card, 'select-curve', { entityId: 'light.a' });
    await card.updateComplete;
    expect(internal._selectedCurveId).toBe('light.a');

    const legend = card.renderRoot.querySelector('curve-legend')!;
    await (legend as unknown as { updateComplete: Promise<void> }).updateComplete;
    const clearBtn = legend.shadowRoot?.querySelector<HTMLButtonElement>('.clear-edit-icon');
    expect(clearBtn, 'clear-edit-icon must render on the selected legend row').not.toBeNull();

    let dispatched: CustomEvent | null = null;
    card.addEventListener('select-curve', (e) => {
      dispatched = e as CustomEvent;
    });
    clearBtn!.click();
    await card.updateComplete;

    expect(dispatched, 'clicking clear-edit must dispatch a select-curve event').not.toBeNull();
    expect((dispatched as unknown as CustomEvent).detail).toEqual({ entityId: 'light.a' });
    expect(internal._selectedCurveId, 'selection must clear after the toggle').toBeNull();
  });

  it('still allows deselect when the currently-selected curve has gone missing (race during reload)', async () => {
    const { card } = await mountCard({
      'light.a': { brightness: { '1': '1', '100': '100' } },
      'light.b': { brightness: { '1': '1', '100': '100' } },
    });
    const internal = card as unknown as CardInternals;

    // Simulate the user having selected light.b, then a reload that drops it
    // from _curves (e.g. it was removed by another tab).
    internal._selectedCurveId = 'light.b';
    internal._curves = internal._curves.filter((c) => c.entityId !== 'light.b');
    await card.updateComplete;

    // User clicks the now-stale row again. The card should let them dismiss
    // it instead of trapping them in a "nothing matches" dimmed state.
    fireLegend(card, 'select-curve', { entityId: 'light.b' });
    await card.updateComplete;
    expect(internal._selectedCurveId).toBeNull();
  });
});

describe('lightener-curve-card — live preview propagation', () => {
  it('refreshes physical lights when a light row is selected while preview is active', async () => {
    const rafSpy = mockImmediateRaf();
    const { card, hass } = await mountCard({
      'light.a': { brightness: { '100': '100' } },
    });
    const internal = card as unknown as CardInternals;
    internal._scrubberPosition = 70;
    internal._startPreview();
    hass.callService.mockClear();

    fireLegend(card, 'select-curve', { entityId: 'light.a' });
    await card.updateComplete;

    expect(hass.callService).toHaveBeenCalledTimes(1);
    expect(hass.callService).toHaveBeenCalledWith('light', 'turn_on', {
      entity_id: 'light.a',
      brightness: 179,
    });

    rafSpy.mockRestore();
  });

  it('refreshes preview from the changed curve value when a control point moves', async () => {
    const rafSpy = mockImmediateRaf();
    const { card, hass } = await mountCard({
      'light.a': { brightness: { '100': '100' } },
    });
    const internal = card as unknown as CardInternals;
    internal._scrubberPosition = 50;
    internal._startPreview();
    hass.callService.mockClear();
    internal._lastPreviewTime = 0;

    internal._onPointMove(
      new CustomEvent('point-move', {
        detail: { curveIndex: 0, pointIndex: 1, lightener: 100, target: 50 },
      })
    );

    expect(hass.callService).toHaveBeenCalledTimes(1);
    expect(hass.callService).toHaveBeenCalledWith('light', 'turn_on', {
      entity_id: 'light.a',
      brightness: 64,
    });

    rafSpy.mockRestore();
  });

  it('refreshes preview after discrete curve edits without moving the scrubber', async () => {
    const rafSpy = mockImmediateRaf();
    const { card, hass } = await mountCard({
      'light.a': { brightness: { '100': '100' } },
    });
    const internal = card as unknown as CardInternals;
    internal._scrubberPosition = 50;
    internal._startPreview();
    hass.callService.mockClear();

    internal._applyPreset({
      id: 'test_low',
      name: 'Test low',
      description: 'Test preset',
      controlPoints: [
        { lightener: 0, target: 0 },
        { lightener: 100, target: 40 },
      ],
    });
    expect(hass.callService).toHaveBeenLastCalledWith('light', 'turn_on', {
      entity_id: 'light.a',
      brightness: 51,
    });

    hass.callService.mockClear();
    internal._onPointAdd(
      new CustomEvent('point-add', {
        detail: { entityId: 'light.a', lightener: 50, target: 80 },
      })
    );
    expect(hass.callService).toHaveBeenLastCalledWith('light', 'turn_on', {
      entity_id: 'light.a',
      brightness: 204,
    });

    hass.callService.mockClear();
    internal._onPointRemove(
      new CustomEvent('point-remove', {
        detail: { curveIndex: 0, pointIndex: 1 },
      })
    );
    expect(hass.callService).toHaveBeenLastCalledWith('light', 'turn_on', {
      entity_id: 'light.a',
      brightness: 51,
    });

    rafSpy.mockRestore();
  });

  it('does not let a stale queued preview frame override a forced refresh', async () => {
    const queuedFrames: FrameRequestCallback[] = [];
    const rafSpy = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb: FrameRequestCallback) => {
        queuedFrames.push(cb);
        return queuedFrames.length;
      });
    const { card, hass } = await mountCard({
      'light.a': { brightness: { '100': '100' } },
    });
    const internal = card as unknown as CardInternals;
    internal._scrubberPosition = 20;
    internal._startPreview();
    expect(queuedFrames).toHaveLength(1);

    internal._scrubberPosition = 70;
    fireLegend(card, 'select-curve', { entityId: 'light.a' });
    expect(queuedFrames).toHaveLength(2);

    queuedFrames[0](0);
    expect(hass.callService).not.toHaveBeenCalled();

    queuedFrames[1](16);
    expect(hass.callService).toHaveBeenCalledTimes(1);
    expect(hass.callService).toHaveBeenCalledWith('light', 'turn_on', {
      entity_id: 'light.a',
      brightness: 179,
    });

    rafSpy.mockRestore();
  });
});
