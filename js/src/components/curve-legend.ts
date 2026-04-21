import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { LightCurve, Hass } from '../utils/types.js';
import { LEGEND_SHAPES, sampleCurveAt } from '../utils/graph-math.js';

@customElement('curve-legend')
export class CurveLegend extends LitElement {
  @property({ type: Array }) curves: LightCurve[] = [];
  @property({ type: String }) selectedCurveId: string | null = null;
  @property({ type: Number }) scrubberPosition: number | null = null;
  @property({ type: Boolean }) canManage = false;
  @property({ attribute: false }) hass: Hass | null = null;

  @state() private _addingLight = false;
  @state() private _pendingAddEntity = '';

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
    .add-light-btn:hover {
      border-color: var(--primary-color, #2563eb);
      border-style: solid;
      color: var(--primary-color, #2563eb);
      background: color-mix(in srgb, var(--primary-color, #2563eb) 6%, transparent);
    }
    .add-light-btn:focus-visible {
      outline: 2px solid var(--primary-color, #2563eb);
      outline-offset: 2px;
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
    .add-form-actions {
      display: flex;
      gap: 6px;
      justify-content: flex-end;
    }
    .add-form-actions button {
      padding: 4px 12px;
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
        padding: 12px;
        margin: -12px;
        margin-left: auto;
        box-sizing: content-box;
      }
      .remove-icon {
        opacity: 0.6;
      }
      .remove-icon svg {
        width: 18px;
        height: 18px;
      }
    }
  `;

  private _select(entityId: string) {
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

  private _remove(e: Event, curve: LightCurve) {
    e.stopPropagation();
    if (this.curves.length <= 1) return;
    const ok =
      typeof window !== 'undefined' && typeof window.confirm === 'function'
        ? window.confirm(`Remove "${curve.friendlyName}" from this Lightener?`)
        : true;
    if (!ok) return;
    this.dispatchEvent(
      new CustomEvent('remove-light', {
        detail: { entityId: curve.entityId },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _onItemKeyDown(e: KeyboardEvent, entityId: string) {
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

  private _startAdd() {
    this._addingLight = true;
    this._pendingAddEntity = '';
  }

  private _cancelAdd() {
    this._addingLight = false;
    this._pendingAddEntity = '';
  }

  private _onAddEntityChange(e: CustomEvent) {
    this._pendingAddEntity = (e.detail?.value as string) ?? '';
  }

  private _confirmAdd() {
    const entityId = this._pendingAddEntity.trim();
    if (!entityId) return;
    this.dispatchEvent(
      new CustomEvent('add-light', {
        detail: { entityId },
        bubbles: true,
        composed: true,
      })
    );
    this._addingLight = false;
    this._pendingAddEntity = '';
  }

  private static readonly _shapes = LEGEND_SHAPES;

  private _renderAddForm() {
    const existing = this.curves.map((c) => c.entityId);
    return html`
      <div class="add-form">
        <ha-entity-picker
          .hass=${this.hass}
          .value=${this._pendingAddEntity}
          .includeDomains=${['light']}
          .excludeEntities=${existing}
          allow-custom-entity
          @value-changed=${this._onAddEntityChange}
        ></ha-entity-picker>
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

  render() {
    return html`
      <div class="legend-panel">
        <div class="legend-label">Lights</div>
        <div class="legend" role="listbox" aria-label="Light curves">
          ${this.curves.map(
            (curve, idx) => html`
              <div
                class="legend-item ${curve.visible ? '' : 'hidden'} ${this.selectedCurveId ===
                curve.entityId
                  ? 'selected'
                  : ''}"
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
                <span class="name">${curve.friendlyName}</span>
                ${this.scrubberPosition !== null
                  ? html`<span class="brightness-value"
                      >${Math.round(
                        sampleCurveAt(curve.controlPoints, Math.round(this.scrubberPosition))
                      )}%</span
                    >`
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
                      @click=${(e: Event) => this._remove(e, curve)}
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
              </div>
            `
          )}
        </div>
        ${this.canManage
          ? html`
              <div class="add-divider"></div>
              <div class="add-row">
                ${this._addingLight
                  ? this._renderAddForm()
                  : html`<button type="button" class="add-light-btn" @click=${this._startAdd}>
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
