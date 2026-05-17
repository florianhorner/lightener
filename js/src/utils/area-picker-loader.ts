/** Lazy-loads <ha-area-picker> exactly once per instance. */
export class AreaPickerLoader {
  ready = false;
  private started = false;

  constructor(
    private readonly isConnected: () => boolean,
    private readonly requestUpdate: () => void
  ) {}

  ensureLoaded(): void {
    if (this.started) return;
    this.started = true;
    if (customElements.get('ha-area-picker')) {
      this.ready = true;
      return;
    }
    const kickLoaders = async () => {
      try {
        const loadHelpers = (window as unknown as { loadCardHelpers?: () => Promise<unknown> })
          .loadCardHelpers;
        if (typeof loadHelpers === 'function') await loadHelpers();
      } catch {
        /* ignore */
      }
      try {
        const entitiesCard = customElements.get('hui-entities-card') as
          | (CustomElementConstructor & { getConfigElement?: () => Promise<HTMLElement> })
          | undefined;
        await entitiesCard?.getConfigElement?.();
      } catch {
        /* ignore */
      }
    };
    kickLoaders();
    const ready = customElements.whenDefined('ha-area-picker');
    const timeout = new Promise<void>((r) => setTimeout(r, 1500));
    Promise.race([ready, timeout])
      .then(() => {
        this.ready = !!customElements.get('ha-area-picker');
        if (!this.ready) {
          customElements
            .whenDefined('ha-area-picker')
            .then(() => {
              this.ready = true;
              if (this.isConnected()) this.requestUpdate();
            })
            .catch(() => {
              /* area picker never registered — silently skip */
            });
        }
        if (this.isConnected()) this.requestUpdate();
      })
      .catch(() => {
        /* defensive */
      });
  }
}
