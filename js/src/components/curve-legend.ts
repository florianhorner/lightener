import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { LightCurve } from '../utils/types.js';
import { LEGEND_SHAPES } from '../utils/graph-math.js';

@customElement('curve-legend')
export class CurveLegend extends LitElement {
  @property({ type: Array }) curves: LightCurve[] = [];
  @property({ type: String }) selectedCurveId: string | null = null;

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
      background: rgba(128, 128, 128, 0.08);
    }
    .legend-item.hidden {
      opacity: 0.4;
    }
    .legend-item.selected::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 10px;
      right: 10px;
      height: 2px;
      border-radius: 1px;
      background: var(--accent-color, currentColor);
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
      margin-left: auto;
      padding: 4px;
      box-sizing: content-box;
    }
    .legend-item:hover .eye-icon,
    .legend-item.hidden .eye-icon {
      opacity: 0.7;
    }
    .name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
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

  private static readonly _shapes = LEGEND_SHAPES;

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
                title="${curve.friendlyName}"
                style="--accent-color: ${curve.color}"
              >
                <span
                  class="color-dot shape-${CurveLegend._shapes[idx % CurveLegend._shapes.length]}"
                  style="background: ${curve.color}; --dot-color: ${curve.color}"
                ></span>
                <span class="name">${curve.friendlyName}</span>
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
              </div>
            `
          )}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'curve-legend': CurveLegend;
  }
}
