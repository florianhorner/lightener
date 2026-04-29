// @vitest-environment jsdom

import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

beforeAll(async () => {
  if (!customElements.get('lightener-curve-card')) {
    class FakeCurveCard extends HTMLElement {
      config?: { type: string; entity: string; embedded?: boolean };
      hass?: unknown;
      dirty = false;
      saveShouldSucceed = true;

      setConfig(config: { type: string; entity: string; embedded?: boolean }) {
        this.config = config;
      }

      emitDirtyState(dirty: boolean) {
        this.dirty = dirty;
        this.dispatchEvent(
          new CustomEvent('curve-dirty-state', {
            detail: { dirty },
            bubbles: true,
            composed: true,
          })
        );
      }

      async saveCurves() {
        if (this.saveShouldSucceed) {
          this.emitDirtyState(false);
        }
        return this.saveShouldSucceed;
      }
    }

    customElements.define('lightener-curve-card', FakeCurveCard);
  }

  // @ts-expect-error Runtime JS asset imported directly for the custom panel test.
  await import('../../custom_components/lightener/frontend/lightener-panel.js');
});

describe('lightener-editor-panel', () => {
  beforeEach(() => {
    document.body.replaceChildren();
    window.localStorage.clear();
    window.sessionStorage.clear();
    // Use the panel's own published CARD_VERSION so this doesn't drift on version bumps.
    const panelVer = (window as unknown as { __LIGHTENER_PANEL_CARD_VERSION__?: string })
      .__LIGHTENER_PANEL_CARD_VERSION__;
    (
      window as unknown as { __LIGHTENER_CURVE_CARD_VERSION__?: string }
    ).__LIGHTENER_CURVE_CARD_VERSION__ = panelVer ?? '0.0.0';
  });

  it('clears the mounted curve card when no valid entity remains', async () => {
    const Panel = customElements.get('lightener-editor-panel');
    if (!Panel) {
      throw new Error('lightener-editor-panel was not defined');
    }
    const panel = new Panel() as HTMLElement & {
      hass: unknown;
      _card: HTMLElement | null;
      _lightenerEntities: Array<{ entity_id: string; name: string; config_entry_id?: string }>;
      _requestedConfigEntryId: string | null;
    };

    document.body.appendChild(panel);

    panel._requestedConfigEntryId = 'entry-1';
    panel._lightenerEntities = [
      { entity_id: 'light.test', name: 'Test Light', config_entry_id: 'entry-1' },
    ];
    panel.hass = { states: {}, callWS: async () => ({ entities: [] }) };
    await Promise.resolve();

    const mount = panel.shadowRoot!.querySelector('#card-mount')!;
    expect(mount.children).toHaveLength(1);
    expect(panel._card).not.toBeNull();
    expect((panel._card as HTMLElement & { config?: { embedded?: boolean } }).config).toMatchObject(
      {
        entity: 'light.test',
        embedded: true,
      }
    );

    panel._lightenerEntities = [];
    panel.hass = { states: {}, callWS: async () => ({ entities: [] }) };
    await Promise.resolve();

    expect(mount.children).toHaveLength(1);
    expect(panel._card).toBeNull();
    expect(panel.shadowRoot!.querySelector('#status-msg')!.textContent).toBe(
      'This Lightener integration does not have an editable group yet.'
    );
    expect(mount.textContent).toContain('No editable Lightener group yet');
  });

  it('reloads once instead of reusing a pre-registered stale curve card class', async () => {
    const Panel = customElements.get('lightener-editor-panel');
    if (!Panel) {
      throw new Error('lightener-editor-panel was not defined');
    }
    const panel = new Panel() as HTMLElement & {
      _ensureCardScriptLoaded: () => Promise<void>;
      _reloadForStaleCard: () => void;
    };
    let reloadRequested = false;
    (
      window as unknown as { __LIGHTENER_CURVE_CARD_VERSION__?: string }
    ).__LIGHTENER_CURVE_CARD_VERSION__ = '2.14.0';
    panel._reloadForStaleCard = () => {
      reloadRequested = true;
    };

    await panel._ensureCardScriptLoaded();

    expect(reloadRequested).toBe(true);
  });

  it('does not reload when the registered card class version matches CARD_VERSION', async () => {
    const Panel = customElements.get('lightener-editor-panel');
    if (!Panel) {
      throw new Error('lightener-editor-panel was not defined');
    }
    const panel = new Panel() as HTMLElement & {
      _ensureCardScriptLoaded: () => Promise<void>;
      _reloadForStaleCard: () => void;
    };
    let reloadRequested = false;
    const w = window as unknown as {
      __LIGHTENER_CURVE_CARD_VERSION__?: string;
      __LIGHTENER_PANEL_CARD_VERSION__?: string;
    };
    const prev = w.__LIGHTENER_CURVE_CARD_VERSION__;
    // Derive the expected version from the panel's own published constant rather
    // than hardcoding it — scripts/sync-version keeps it in sync with manifest.json.
    const panelCardVersion = w.__LIGHTENER_PANEL_CARD_VERSION__;
    if (!panelCardVersion)
      throw new Error('__LIGHTENER_PANEL_CARD_VERSION__ not set by panel module');
    w.__LIGHTENER_CURVE_CARD_VERSION__ = panelCardVersion;
    panel._reloadForStaleCard = () => {
      reloadRequested = true;
    };

    try {
      await panel._ensureCardScriptLoaded();
      expect(reloadRequested).toBe(false);
    } finally {
      if (prev === undefined) {
        delete w.__LIGHTENER_CURVE_CARD_VERSION__;
      } else {
        w.__LIGHTENER_CURVE_CARD_VERSION__ = prev;
      }
    }
  });

  it('builds a path-stamped card module URL without a ?v= query string', async () => {
    const Panel = customElements.get('lightener-editor-panel');
    if (!Panel) {
      throw new Error('lightener-editor-panel was not defined');
    }
    const panel = new Panel() as HTMLElement & {
      _ensureCardScriptLoaded: () => Promise<void>;
      _reloadForStaleCard: () => void;
      _cardModuleUrl?: string;
      _cardScriptPromise?: Promise<unknown>;
    };
    // Clear any previous promise so the URL is re-computed.
    panel._cardScriptPromise = undefined;
    // Unregister the fake card temporarily so the URL-construction branch runs.
    const savedGet = customElements.get.bind(customElements);
    vi.spyOn(customElements, 'get').mockImplementationOnce((name) => {
      if (name === 'lightener-curve-card') return undefined;
      return savedGet(name);
    });

    // Do not await: the assignment to _cardModuleUrl is synchronous (before the
    // import() call), so we can read it immediately. import() itself will reject in
    // jsdom (no real module loader) but we only need the URL here.
    panel._ensureCardScriptLoaded().catch(() => {});

    expect(panel._cardModuleUrl).toBeDefined();
    expect(panel._cardModuleUrl).toMatch(/\/lightener\/lightener-curve-card\.[^/]+\.js$/);
    expect(panel._cardModuleUrl).not.toContain('?v=');
  });

  it('reloads after fallback import when the fallback-loaded card version is stale', async () => {
    const Panel = customElements.get('lightener-editor-panel');
    if (!Panel) {
      throw new Error('lightener-editor-panel was not defined');
    }
    const panel = new Panel() as HTMLElement & {
      _ensureCardScriptLoaded: () => Promise<void>;
      _reloadForStaleCard: () => void;
      _cardUsedFallback: boolean;
      _cardScriptPromise?: Promise<unknown>;
    };
    let reloadRequested = false;
    panel._reloadForStaleCard = () => {
      reloadRequested = true;
    };
    // Simulate: fallback was used and the fallback-loaded card reported an old version.
    panel._cardUsedFallback = true;
    panel._cardScriptPromise = Promise.resolve();
    (
      window as unknown as { __LIGHTENER_CURVE_CARD_VERSION__?: string }
    ).__LIGHTENER_CURVE_CARD_VERSION__ = '2.14.0';

    await panel._ensureCardScriptLoaded();

    expect(reloadRequested).toBe(true);
  });

  it('shows an inline save or discard guard before switching entities with unsaved changes', async () => {
    const Panel = customElements.get('lightener-editor-panel');
    if (!Panel) {
      throw new Error('lightener-editor-panel was not defined');
    }
    const panel = new Panel() as HTMLElement & {
      hass: unknown;
      _card: HTMLElement & { emitDirtyState: (dirty: boolean) => void };
      _lightenerEntities: Array<{ entity_id: string; name: string }>;
      _pendingEntity: string | null;
    };

    document.body.appendChild(panel);
    panel._lightenerEntities = [
      { entity_id: 'light.alpha', name: 'Alpha' },
      { entity_id: 'light.beta', name: 'Beta' },
    ];
    panel.hass = { states: {}, callWS: async () => ({ entities: [] }) };
    await Promise.resolve();

    panel._card.emitDirtyState(true);

    const select = panel.shadowRoot!.querySelector('#entity-select') as HTMLSelectElement;
    select.value = 'light.beta';
    select.dispatchEvent(new Event('change'));

    expect(panel._pendingEntity).toBe('light.beta');
    expect(select.value).toBe('light.alpha');
    expect(panel.shadowRoot!.querySelector('#switch-guard')!.hasAttribute('hidden')).toBe(false);
    expect(panel.shadowRoot!.querySelector('#switch-guard-text')!.textContent).toContain(
      'Unsaved changes in Alpha'
    );
  });

  it('saves pending edits before switching entities when the inline guard save action is used', async () => {
    const Panel = customElements.get('lightener-editor-panel');
    if (!Panel) {
      throw new Error('lightener-editor-panel was not defined');
    }
    const panel = new Panel() as HTMLElement & {
      hass: unknown;
      _card: HTMLElement & {
        emitDirtyState: (dirty: boolean) => void;
        saveShouldSucceed: boolean;
        config?: { entity: string };
      };
      _lightenerEntities: Array<{ entity_id: string; name: string }>;
    };

    document.body.appendChild(panel);
    panel._lightenerEntities = [
      { entity_id: 'light.alpha', name: 'Alpha' },
      { entity_id: 'light.beta', name: 'Beta' },
    ];
    panel.hass = { states: {}, callWS: async () => ({ entities: [] }) };
    await Promise.resolve();

    panel._card.emitDirtyState(true);
    panel._card.saveShouldSucceed = true;

    const select = panel.shadowRoot!.querySelector('#entity-select') as HTMLSelectElement;
    select.value = 'light.beta';
    select.dispatchEvent(new Event('change'));

    (panel.shadowRoot!.querySelector('#switch-save') as HTMLButtonElement).click();
    await Promise.resolve();
    await Promise.resolve();

    expect(panel._card.config).toMatchObject({ entity: 'light.beta' });
    expect(select.value).toBe('light.beta');
    expect(panel.shadowRoot!.querySelector('#switch-guard')!.hasAttribute('hidden')).toBe(true);
  });

  it('completes a pending switch when the current card becomes clean outside the guard actions', async () => {
    const Panel = customElements.get('lightener-editor-panel');
    if (!Panel) {
      throw new Error('lightener-editor-panel was not defined');
    }
    const panel = new Panel() as HTMLElement & {
      hass: unknown;
      _card: HTMLElement & {
        emitDirtyState: (dirty: boolean) => void;
        config?: { entity: string };
      };
      _lightenerEntities: Array<{ entity_id: string; name: string }>;
      _pendingEntity: string | null;
    };

    document.body.appendChild(panel);
    panel._lightenerEntities = [
      { entity_id: 'light.alpha', name: 'Alpha' },
      { entity_id: 'light.beta', name: 'Beta' },
    ];
    panel.hass = { states: {}, callWS: async () => ({ entities: [] }) };
    await Promise.resolve();

    panel._card.emitDirtyState(true);

    const select = panel.shadowRoot!.querySelector('#entity-select') as HTMLSelectElement;
    select.value = 'light.beta';
    select.dispatchEvent(new Event('change'));

    expect(panel._pendingEntity).toBe('light.beta');
    expect(select.value).toBe('light.alpha');

    panel._card.emitDirtyState(false);
    await Promise.resolve();

    expect(panel._pendingEntity).toBeNull();
    expect(panel._card.config).toMatchObject({ entity: 'light.beta' });
    expect(select.value).toBe('light.beta');
    expect(panel.shadowRoot!.querySelector('#switch-guard')!.hasAttribute('hidden')).toBe(true);
  });
});
