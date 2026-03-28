import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { LightCurve } from "../utils/types.js";

@customElement("curve-legend")
export class CurveLegend extends LitElement {
  @property({ type: Array }) curves: LightCurve[] = [];
  @property({ type: String }) selectedCurveId: string | null = null;

  static styles = css`
    :host {
      display: block;
    }
    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 12px 16px;
      padding: 8px 0 0;
      max-height: 120px;
      overflow-y: auto;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      user-select: none;
      padding: 4px 8px;
      border-radius: 6px;
      transition: background 0.15s ease, opacity 0.2s ease;
      font-size: 13px;
      color: var(--text-color, #e1e1e1);
    }
    .legend-item:hover {
      background: rgba(255, 255, 255, 0.06);
    }
    .legend-item.hidden {
      opacity: 0.4;
    }
    .legend-item.selected {
      background: var(--selection-bg, rgba(255, 255, 255, 0.1));
      border-left: 3px solid var(--selection-border, currentColor);
      padding-left: 5px;
    }
    .color-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .eye-icon {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
      opacity: 0.6;
      transition: opacity 0.15s ease;
      padding: 4px;
      box-sizing: content-box;
    }
    .legend-item:hover .eye-icon {
      opacity: 1;
    }
    .name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 160px;
    }
  `;

  private _select(entityId: string) {
    this.dispatchEvent(
      new CustomEvent("select-curve", {
        detail: { entityId },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _toggle(e: Event, entityId: string) {
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent("toggle-curve", {
        detail: { entityId },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    return html`
      <div class="legend">
        ${this.curves.map(
          (curve) => html`
            <div
              class="legend-item ${curve.visible ? "" : "hidden"} ${
                this.selectedCurveId === curve.entityId ? "selected" : ""
              }"
              @click=${() => this._select(curve.entityId)}
              title="${curve.friendlyName}"
              style="${this.selectedCurveId === curve.entityId
                ? `--selection-bg: ${curve.color}25; --selection-border: ${curve.color}`
                : ""}"
            >
              <span
                class="color-dot"
                style="background: ${curve.color}"
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
                @click=${(e: Event) => this._toggle(e, curve.entityId)}
              >
                ${curve.visible
                  ? html`
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    `
                  : html`
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    `}
              </svg>
            </div>
          `
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "curve-legend": CurveLegend;
  }
}
