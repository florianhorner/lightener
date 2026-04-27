/** Lazy-loads <ha-entity-picker> exactly once per instance.
 *
 * HA registers ha-entity-picker lazily; the first component to reference it
 * must kick the load by instantiating a core card's config editor.  Falls back
 * to a plain <input> if the picker never becomes available.
 */
export class EntityPickerLoader {
  ready = false;
  private started = false;

  constructor(
    private readonly isConnected: () => boolean,
    private readonly requestUpdate: () => void
  ) {}

  ensureLoaded(): void {
    if (this.started) return;
    this.started = true;
    if (customElements.get('ha-entity-picker')) {
      this.ready = true;
      return;
    }
    const kickLoaders = async () => {
      try {
        const loadHelpers = (window as unknown as { loadCardHelpers?: () => Promise<unknown> })
          .loadCardHelpers;
        if (typeof loadHelpers === 'function') await loadHelpers();
      } catch {
        /* ignore — direct path below still runs */
      }
      try {
        const entitiesCard = customElements.get('hui-entities-card') as
          | (CustomElementConstructor & { getConfigElement?: () => Promise<HTMLElement> })
          | undefined;
        await entitiesCard?.getConfigElement?.();
      } catch {
        /* ignore — whenDefined below will time out and we fall back */
      }
    };
    kickLoaders();
    const ready = customElements.whenDefined('ha-entity-picker');
    const timeout = new Promise<void>((r) => setTimeout(r, 1500));
    Promise.race([ready, timeout])
      .then(() => {
        if (!this.isConnected()) return;
        this.ready = !!customElements.get('ha-entity-picker');
        if (!this.ready) {
          console.warn(
            '[lightener] <ha-entity-picker> not available — falling back to plain input.'
          );
          // Picker may register after the 1500ms window; upgrade when it does.
          customElements
            .whenDefined('ha-entity-picker')
            .then(() => {
              if (!this.isConnected()) return;
              this.ready = true;
              this.requestUpdate();
            })
            .catch(() => {
              /* picker registration failed — already using fallback input */
            });
        }
        this.requestUpdate();
      })
      .catch(() => {
        /* defensive: unexpected rejection from race — component stays in fallback state */
      });
  }
}
