import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { LightCurve, Hass } from '../utils/types.js';
import { EntityPickerLoader } from '../utils/entity-picker-loader.js';
import { LEGEND_SHAPES, sampleCurveAt } from '../utils/graph-math.js';

export interface LegendPresetOption {
  value: string;
  label: string;
}

const DEFAULT_PRESET_OPTIONS: LegendPresetOption[] = [
  { value: 'linear', label: 'Linear' },
  { value: 'dim_accent', label: 'Dim accent' },
  { value: 'late_starter', label: 'Late starter' },
  { value: 'night_mode', label: 'Night mode' },
];

@customElement('curve-legend')
export class CurveLegend extends LitElement {
  @property({ type: Array }) curves: LightCurve[] = [];
  @property({ type: String }) selectedCurveId: string | null = null;
  @property({ type: Number }) scrubberPosition: number | null = null;
  @property({ type: Boolean }) canManage = false;
  @property({ type: Boolean }) managing = false;
  @property({ type: Array }) excludeEntityIds: string[] = [];
  @property({ type: Array }) presetOptions: LegendPresetOption[] = DEFAULT_PRESET_OPTIONS;
  @property({ type: Number }) closeAddSignal = 0;
  @property({ type: Number }) closeRemoveSignal = 0;
  @property({ attribute: false }) hass: Hass | null = null;

  @state() private _addingLight = false;
  @state() private _pendingAddEntity = '';
  @state() private _pendingPreset: string = DEFAULT_PRESET_OPTIONS[0].value;
  @state() private _confirmingRemove: string | null = null;
  private _picker = new EntityPickerLoader(
    () => this.isConnected,
    () => this.requestUpdate()
  );

  static styles = css`
    :host {
      display: block;
    }
    .legend-panel {
      border-radius: 12px;
      padding: 8px;
      background: color-mix(
        in srgb,
        var(--ha-card-background, var(--card-background-color, #fff)) 95%,
        var(--secondary-text-color, #616161) 5%
      );
      border: 1px solid
        color-mix(in srgb, var(--divider-color, rgba(127, 127, 127, 0.2)) 80%, transparent);
    }
    .legend-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--secondary-text-color, #616161);
      padding: 6px 10px 4px;
    }
    .legend {
      display: flex;
      flex-direction: column;
      gap: 2px;
      max-height: var(--curve-legend-max-height, none);
      overflow: auto;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      user-select: none;
      padding: 8px 10px;
      border-radius: 8px;
      transition:
        background 0.15s ease,
        opacity 0.2s ease;
      font-size: var(--text-md, 13px);
      font-weight: 500;
      color: var(--primary-text-color, #212121);
      position: relative;
    }
    .legend-item:hover {
      background: color-mix(in srgb, var(--primary-color, #2563eb) 8%, transparent);
    }
    .legend-item:focus {
      outline: none;
    }
    .legend-item:focus-visible {
      background: color-mix(in srgb, var(--primary-color, #2563eb) 10%, transparent);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary-color, #2563eb) 50%, transparent);
    }
    .legend-item.hidden {
      opacity: 0.4;
    }
    .legend-item.selected {
      background: color-mix(in srgb, var(--primary-color, #2563eb) 12%, transparent);
    }
    .legend-item.selected:hover {
      background: color-mix(in srgb, var(--primary-color, #2563eb) 16%, transparent);
    }
    .legend-item.confirming {
      background: color-mix(in srgb, var(--error-color, #db4437) 10%, transparent);
      cursor: default;
    }
    .legend-item.confirming:hover {
      background: color-mix(in srgb, var(--error-color, #db4437) 12%, transparent);
    }
    .color-dot {
      width: 10px;
      height: 10px;
      flex-shrink: 0;
    }
    .color-dot.shape-circle {
      border-radius: 50%;
    }
    .color-dot.shape-square {
      border-radius: 2px;
    }
    .color-dot.shape-diamond {
      border-radius: 2px;
      transform: rotate(45deg);
      width: 9px;
      height: 9px;
    }
    .color-dot.shape-triangle {
      width: 0;
      height: 0;
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-bottom: 10px solid var(--dot-color);
      background: transparent !important;
    }
    .color-dot.shape-bar {
      border-radius: 2px;
      width: 10px;
      height: 6px;
      margin: 2px 0;
    }
    .eye-icon {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
      opacity: 0.35;
      transition: opacity 0.15s ease;
      padding: 4px;
      box-sizing: content-box;
    }
    .legend-item:hover .eye-icon,
    .legend-item.hidden .eye-icon {
      opacity: 0.7;
    }
    .eye-icon:focus {
      outline: none;
    }
    .eye-icon:focus-visible {
      outline: 2px solid var(--primary-color, #2563eb);
      outline-offset: 2px;
      border-radius: 4px;
      opacity: 0.9;
    }
    .remove-icon {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
      opacity: 0;
      transition:
        opacity 0.15s ease,
        color 0.15s ease;
      padding: 4px;
      box-sizing: content-box;
      color: var(--secondary-text-color, #616161);
      background: transparent;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .legend-item:hover .remove-icon,
    .legend-item:focus-within .remove-icon {
      opacity: 0.7;
    }
    .remove-icon:hover {
      opacity: 1 !important;
      color: var(--error-color, #db4437);
    }
    .remove-icon:focus {
      outline: none;
    }
    .remove-icon:focus-visible {
      outline: 2px solid var(--error-color, #db4437);
      outline-offset: 2px;
      border-radius: 4px;
      opacity: 1;
    }
    .remove-icon:disabled {
      cursor: not-allowed;
      opacity: 0.3 !important;
    }
    .remove-icon svg {
      width: 16px;
      height: 16px;
      display: block;
    }
    .name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
      min-width: 0;
    }
    .brightness-value {
      font-size: 11px;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
      color: var(--secondary-text-color, #616161);
      flex-shrink: 0;
      min-width: 2.8ch;
      text-align: right;
    }
    .editing-chip {
      flex-shrink: 0;
      padding: 2px 6px;
      border-radius: 4px;
      background: color-mix(in srgb, var(--primary-color, #2563eb) 12%, transparent);
      color: var(--primary-color, #2563eb);
      font-size: 10px;
      font-weight: 700;
      line-height: 1.4;
    }
    .clear-edit-icon {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
      padding: 4px;
      box-sizing: content-box;
      color: var(--primary-color, #2563eb);
      background: transparent;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.7;
      transition:
        opacity 0.15s ease,
        background 0.15s ease;
    }
    .clear-edit-icon:hover {
      opacity: 1;
      background: color-mix(in srgb, var(--primary-color, #2563eb) 10%, transparent);
      border-radius: 4px;
    }
    .clear-edit-icon:focus {
      outline: none;
    }
    .clear-edit-icon:focus-visible {
      outline: 2px solid var(--primary-color, #2563eb);
      outline-offset: 2px;
      border-radius: 4px;
      opacity: 1;
    }
    .clear-edit-icon svg {
      width: 16px;
      height: 16px;
      display: block;
    }
    .confirm-row {
      display: flex;
      align-items: center;
      gap: 6px;
      flex: 1;
      min-width: 0;
    }
    .confirm-text {
      flex: 1;
      min-width: 0;
      word-break: break-word;
      font-size: 12px;
      color: var(--error-color, #db4437);
      font-weight: 500;
    }
    .confirm-btn {
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 500;
      border-radius: 6px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
      background: transparent;
      color: var(--secondary-text-color, #616161);
      cursor: pointer;
      font-family: inherit;
      flex-shrink: 0;
    }
    .confirm-btn.danger {
      background: var(--error-color, #db4437);
      border-color: var(--error-color, #db4437);
      color: #fff;
    }
    .confirm-btn.danger:hover {
      opacity: 0.9;
    }
    .confirm-btn:focus-visible {
      outline: 2px solid var(--primary-color, #2563eb);
      outline-offset: 2px;
    }
    .add-divider {
      height: 1px;
      margin: 6px 10px;
      background: var(--divider-color, rgba(127, 127, 127, 0.2));
    }
    .add-row {
      padding: 6px 10px 8px;
    }
    .add-light-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      background: transparent;
      border: 1px dashed var(--divider-color, rgba(127, 127, 127, 0.3));
      border-radius: 8px;
      color: var(--secondary-text-color, #616161);
      font-family: inherit;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      width: 100%;
      transition:
        border-color 0.15s ease,
        color 0.15s ease,
        background 0.15s ease;
    }
    .add-light-btn:hover:not(:disabled) {
      border-color: var(--primary-color, #2563eb);
      border-style: solid;
      color: var(--primary-color, #2563eb);
      background: color-mix(in srgb, var(--primary-color, #2563eb) 6%, transparent);
    }
    .add-light-btn:focus-visible {
      outline: 2px solid var(--primary-color, #2563eb);
      outline-offset: 2px;
    }
    .add-light-btn:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
    .add-light-btn svg {
      width: 14px;
      height: 14px;
      flex-shrink: 0;
    }
    .add-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .add-form input[type='text'] {
      padding: 6px 10px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
      border-radius: 8px;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #212121);
      font-family: inherit;
      font-size: 13px;
      width: 100%;
      box-sizing: border-box;
    }
    .add-form input[type='text']:focus {
      outline: none;
      border-color: var(--primary-color, #2563eb);
      box-shadow: 0 0 0 1px var(--primary-color, #2563eb);
    }
    .add-form label {
      font-size: 11px;
      color: var(--secondary-text-color, #616161);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .preset-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .preset-field select {
      padding: 6px 10px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
      border-radius: 8px;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #212121);
      font-family: inherit;
      font-size: 13px;
    }
    .preset-field select:focus {
      outline: none;
      border-color: var(--primary-color, #2563eb);
      box-shadow: 0 0 0 1px var(--primary-color, #2563eb);
    }
    .add-form-actions {
      display: flex;
      gap: 6px;
      justify-content: flex-end;
    }
    .add-form-actions button {
      padding: 4px 12px;
      min-height: 44px;
      font-size: 12px;
      font-weight: 500;
      border-radius: 6px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
      background: transparent;
      color: var(--secondary-text-color, #616161);
      cursor: pointer;
      font-family: inherit;
      transition:
        border-color 0.15s ease,
        color 0.15s ease,
        background 0.15s ease;
    }
    .add-form-actions button:hover:not(:disabled) {
      border-color: var(--primary-color, #2563eb);
      color: var(--primary-color, #2563eb);
    }
    .add-form-actions button.primary {
      background: var(--primary-color, #2563eb);
      border-color: var(--primary-color, #2563eb);
      color: #fff;
    }
    .add-form-actions button.primary:hover:not(:disabled) {
      opacity: 0.9;
      color: #fff;
    }
    .add-form-actions button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .managing-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 8px 10px;
      color: var(--secondary-text-color, #616161);
      font-size: 12px;
    }
    .spinner {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 2px solid color-mix(in srgb, var(--secondary-text-color, #616161) 30%, transparent);
      border-top-color: var(--primary-color, #2563eb);
      animation: spin 0.8s linear infinite;
      flex-shrink: 0;
    }
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
    @media (max-width: 500px) {
      .legend-item {
        padding: 10px 10px;
        font-size: 14px;
        min-height: 44px;
        box-sizing: border-box;
      }
      .eye-icon {
        width: 20px;
        height: 20px;
        min-width: 32px;
        min-height: 32px;
        padding: 6px;
        margin-left: auto;
        box-sizing: content-box;
      }
      .remove-icon {
        opacity: 0.6;
        width: 20px;
        height: 20px;
        min-width: 32px;
        min-height: 32px;
        padding: 6px;
        box-sizing: content-box;
      }
      .remove-icon svg {
        width: 18px;
        height: 18px;
      }
      .editing-chip {
        display: none;
      }
      .clear-edit-icon {
        width: 20px;
        height: 20px;
        min-width: 32px;
        min-height: 32px;
        padding: 6px;
        box-sizing: content-box;
      }
      .clear-edit-icon svg {
        width: 18px;
        height: 18px;
      }
    }
  `;

  private _select(entityId: string) {
    if (this._confirmingRemove === entityId) return;
    this.dispatchEvent(
      new CustomEvent('select-curve', {
        detail: { entityId },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _toggle(e: Event, entityId: string) {
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent('toggle-curve', {
        detail: { entityId },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _clearSelection(e: Event, entityId: string) {
    e.stopPropagation();
    this._select(entityId);
  }

  protected willUpdate(changed: Map<PropertyKey, unknown>): void {
    super.willUpdate(changed);
    // If management is revoked or a WS call starts, drop any pending confirm so
    // the destructive row can't emit remove-light after the gate closes.
    if (
      (changed.has('canManage') || changed.has('managing')) &&
      (!this.canManage || this.managing)
    ) {
      this._confirmingRemove = null;
    }
    if (changed.has('closeAddSignal')) {
      this._cancelAdd();
    }
    if (changed.has('closeRemoveSignal')) {
      this._confirmingRemove = null;
    }
  }

  private _startRemove(e: Event, entityId: string) {
    e.stopPropagation();
    if (!this.canManage || this.managing) return;
    if (this.curves.length <= 1) return;
    this._cancelAdd();
    this._confirmingRemove = entityId;
    this.dispatchEvent(new CustomEvent('remove-panel-open', { bubbles: true, composed: true }));
  }

  private _cancelRemove(e: Event) {
    e.stopPropagation();
    this._confirmingRemove = null;
  }

  private _confirmRemove(e: Event, entityId: string) {
    e.stopPropagation();
    if (!this.canManage || this.managing) {
      this._confirmingRemove = null;
      return;
    }
    this._confirmingRemove = null;
    this.dispatchEvent(
      new CustomEvent('remove-light', {
        detail: { entityId },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _onItemKeyDown(e: KeyboardEvent, entityId: string) {
    if (this._confirmingRemove === entityId) return;
    if (e.target !== e.currentTarget) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this._select(entityId);
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const items = [...this.renderRoot.querySelectorAll<HTMLElement>('.legend-item')];
      const idx = items.indexOf(e.currentTarget as HTMLElement);
      const next = e.key === 'ArrowDown' ? idx + 1 : idx - 1;
      items[next]?.focus();
    }
  }

  private _onToggleKeyDown(e: KeyboardEvent, entityId: string) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this._toggle(e, entityId);
    }
  }

  connectedCallback(): void {
    super.connectedCallback();
    this._picker.ensureLoaded();
  }

  protected updated(changed: Map<string, unknown>): void {
    if (changed.has('hass') && this.hass) this._picker.ensureLoaded();
  }

  private _onFallbackAddEntityInput(e: Event): void {
    this._pendingAddEntity = (e.target as HTMLInputElement).value.trim();
  }

  private _startAdd() {
    this._confirmingRemove = null;
    this._addingLight = true;
    this._pendingAddEntity = '';
    this._pendingPreset = this.presetOptions[0]?.value ?? 'linear';
    this.dispatchEvent(
      new CustomEvent('add-panel-open', {
        bubbles: true,
        composed: true,
      })
    );
  }

  private _cancelAdd() {
    this._addingLight = false;
    this._pendingAddEntity = '';
  }

  private _onAddEntityChange(e: CustomEvent) {
    this._pendingAddEntity = (e.detail?.value as string) ?? '';
  }

  private _onPresetChange(e: Event) {
    this._pendingPreset = (e.target as HTMLSelectElement).value;
  }

  private _confirmAdd() {
    const entityId = this._pendingAddEntity.trim();
    if (!entityId) return;
    this.dispatchEvent(
      new CustomEvent('add-light', {
        detail: { entityId, preset: this._pendingPreset },
        bubbles: true,
        composed: true,
      })
    );
    this._addingLight = false;
    this._pendingAddEntity = '';
  }

  private static readonly _shapes = LEGEND_SHAPES;

  private _renderAddForm() {
    const excluded = [
      ...this.curves.map((c) => c.entityId),
      ...this.excludeEntityIds.filter(Boolean),
    ];
    return html`
      <div class="add-form">
        ${this._picker.ready
          ? html`<ha-entity-picker
              .hass=${this.hass}
              .value=${this._pendingAddEntity}
              .includeDomains=${['light']}
              .excludeEntities=${excluded}
              allow-custom-entity
              @value-changed=${this._onAddEntityChange}
            ></ha-entity-picker>`
          : html`<input
              type="text"
              .value=${this._pendingAddEntity}
              placeholder="light.entity_id"
              @input=${this._onFallbackAddEntityInput}
            />`}
        <div class="preset-field">
          <label for="preset-select">Starting curve</label>
          <select id="preset-select" .value=${this._pendingPreset} @change=${this._onPresetChange}>
            ${this.presetOptions.map(
              (opt) => html`
                <option value=${opt.value} ?selected=${opt.value === this._pendingPreset}>
                  ${opt.label}
                </option>
              `
            )}
          </select>
        </div>
        <div class="add-form-actions">
          <button type="button" @click=${this._cancelAdd}>Cancel</button>
          <button
            type="button"
            class="primary"
            ?disabled=${!this._pendingAddEntity}
            @click=${this._confirmAdd}
          >
            Add
          </button>
        </div>
      </div>
    `;
  }

  private _renderConfirmRow(curve: LightCurve) {
    return html`
      <div class="confirm-row">
        <span class="confirm-text">Remove "${curve.friendlyName}"?</span>
        <button type="button" class="confirm-btn" @click=${(e: Event) => this._cancelRemove(e)}>
          Cancel
        </button>
        <button
          type="button"
          class="confirm-btn danger"
          @click=${(e: Event) => this._confirmRemove(e, curve.entityId)}
        >
          Remove
        </button>
      </div>
    `;
  }

  render() {
    return html`
      <div class="legend-panel">
        <div class="legend-label">Lights</div>
        <div class="legend" role="listbox" aria-label="Light curves">
          ${this.curves.map((curve, idx) => {
            const confirming =
              this.canManage && !this.managing && this._confirmingRemove === curve.entityId;
            return html`
              <div
                class="legend-item ${curve.visible ? '' : 'hidden'} ${this.selectedCurveId ===
                curve.entityId
                  ? 'selected'
                  : ''} ${confirming ? 'confirming' : ''}"
                role="option"
                tabindex="0"
                aria-selected=${this.selectedCurveId === curve.entityId}
                @click=${() => this._select(curve.entityId)}
                @keydown=${(e: KeyboardEvent) => this._onItemKeyDown(e, curve.entityId)}
                style="--accent-color: ${curve.color}"
              >
                <span
                  class="color-dot shape-${CurveLegend._shapes[idx % CurveLegend._shapes.length]}"
                  style="background: ${curve.color}; --dot-color: ${curve.color}"
                ></span>
                ${confirming
                  ? this._renderConfirmRow(curve)
                  : html`
                      <span class="name" title=${curve.friendlyName}>${curve.friendlyName}</span>
                      ${this.scrubberPosition !== null
                        ? html`<span class="brightness-value"
                            >${Math.round(
                              sampleCurveAt(curve.controlPoints, Math.round(this.scrubberPosition))
                            )}%</span
                          >`
                        : nothing}
                      ${this.selectedCurveId === curve.entityId
                        ? html`
                            <span class="editing-chip">Editing</span>
                            <button
                              type="button"
                              class="clear-edit-icon"
                              aria-label="Stop editing ${curve.friendlyName}"
                              title="Stop editing ${curve.friendlyName}"
                              @click=${(e: Event) => this._clearSelection(e, curve.entityId)}
                            >
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              >
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </button>
                          `
                        : nothing}
                      <svg
                        class="eye-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        role="button"
                        tabindex="0"
                        aria-label="${curve.visible ? 'Hide' : 'Show'} ${curve.friendlyName}"
                        aria-pressed=${!curve.visible}
                        @click=${(e: Event) => this._toggle(e, curve.entityId)}
                        @keydown=${(e: KeyboardEvent) => this._onToggleKeyDown(e, curve.entityId)}
                      >
                        ${curve.visible
                          ? html`
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            `
                          : html`
                              <path
                                d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"
                              />
                              <path
                                d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"
                              />
                              <line x1="1" y1="1" x2="23" y2="23" />
                            `}
                      </svg>
                      ${this.canManage && this.curves.length > 1
                        ? html`<button
                            type="button"
                            class="remove-icon"
                            aria-label="Remove ${curve.friendlyName}"
                            title="Remove ${curve.friendlyName}"
                            ?disabled=${this.managing}
                            @click=${(e: Event) => this._startRemove(e, curve.entityId)}
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            >
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path
                                d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                              ></path>
                            </svg>
                          </button>`
                        : nothing}
                    `}
              </div>
            `;
          })}
        </div>
        ${this.canManage || this.managing
          ? html`
              <div class="add-divider"></div>
              <div class="add-row">
                ${this.managing
                  ? html`<div class="managing-row" role="status" aria-live="polite">
                      <span class="spinner" aria-hidden="true"></span>
                      Updating lights…
                    </div>`
                  : this._addingLight
                    ? this._renderAddForm()
                    : html`<button
                        type="button"
                        class="add-light-btn"
                        ?disabled=${this.managing}
                        @click=${this._startAdd}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Add light
                      </button>`}
              </div>
            `
          : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'curve-legend': CurveLegend;
  }
}
