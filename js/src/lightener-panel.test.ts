// @vitest-environment jsdom

import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

beforeAll(async () => {
  if (!customElements.get('lightener-curve-card')) {
    class FakeCurveCard extends HTMLElement {
      config?: { type: string; entity: string; embedded?: boolean };

      hass?: unknown;

      setConfig(config: { type: string; entity: string; embedded?: boolean }) {
        this.config = config;
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

    expect(mount.children).toHaveLength(0);
    expect(panel._card).toBeNull();
    expect(panel.shadowRoot!.querySelector('#status-msg')!.textContent).toBe(
      'No Lightener entity found for this integration entry.'
    );
  });
});
