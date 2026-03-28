import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { LightCurve } from "../utils/types.js";
import { interpolateCurve } from "../utils/interpolation.js";

@customElement("curve-scrubber")
export class CurveScrubber extends LitElement {
  @property({ type: Array }) curves: LightCurve[] = [];
  @property({ type: Boolean }) readOnly = false;

  @state() private _position = 50; // 0-100
  private _dragging = false;
  private _trackRef: HTMLElement | null = null;

  static styles = css`
    :host {
      display: block;
      padding: 4px 0;
    }
    .scrubber-container {
      padding: 0 16px;
    }
    .track-area {
      position: relative;
      height: 24px;
      cursor: pointer;
      touch-action: none;
    }
    .track-line {
      position: absolute;
      top: 11px;
      left: 0;
      right: 0;
      height: 2px;
      background: var(--secondary-text, #9e9e9e);
      opacity: 0.3;
      border-radius: 1px;
    }
    .tick {
      position: absolute;
      top: 6px;
      width: 1px;
      height: 12px;
      background: var(--secondary-text, #9e9e9e);
      opacity: 0.2;
    }
    .tick-label {
      position: absolute;
      top: 20px;
      font-size: 8px;
      color: var(--secondary-text, #9e9e9e);
      opacity: 0.5;
      transform: translateX(-50%);
      user-select: none;
    }
    .diamond {
      position: absolute;
      top: 4px;
      width: 14px;
      height: 14px;
      background: var(--primary-color, #03a9f4);
      border: 1.5px solid #fff;
      transform: translateX(-50%) rotate(45deg);
      cursor: grab;
      border-radius: 2px;
      transition: box-shadow 0.15s ease;
      z-index: 2;
    }
    .diamond:hover {
      box-shadow: 0 0 8px var(--primary-color, #03a9f4);
    }
    .diamond.dragging {
      cursor: grabbing;
      box-shadow: 0 0 12px var(--primary-color, #03a9f4);
    }
    .bars-container {
      display: flex;
      justify-content: space-evenly;
      align-items: flex-end;
      height: 64px;
      padding: 8px 0 0;
      gap: 4px;
    }
    .bar-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
      min-width: 0;
    }
    .bar-track {
      width: 100%;
      max-width: 32px;
      height: 40px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 4px 4px 0 0;
      position: relative;
      overflow: hidden;
    }
    .bar-fill {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      border-radius: 4px 4px 0 0;
      transition: height 0.15s ease;
      opacity: 0.8;
    }
    .bar-value {
      font-size: 10px;
      font-weight: 500;
      margin-top: 2px;
      font-variant-numeric: tabular-nums;
    }
    .bar-name {
      font-size: 8px;
      color: var(--secondary-text, #9e9e9e);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
      text-align: center;
    }
  `;

  private _getInterpolatedValues(): { entityId: string; name: string; color: string; value: number }[] {
    const pos = Math.round(this._position);
    return this.curves
      .filter((c) => c.visible)
      .map((c) => {
        const values = interpolateCurve(c.controlPoints);
        return {
          entityId: c.entityId,
          name: c.friendlyName,
          color: c.color,
          value: Math.round(values[pos] ?? 0),
        };
      });
  }

  private _onPointerDown(e: PointerEvent): void {
    if (this.readOnly) return;
    e.preventDefault();
    this._dragging = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    this._updatePosition(e);
  }

  private _onPointerMove(e: PointerEvent): void {
    if (!this._dragging) return;
    e.preventDefault();
    this._updatePosition(e);
  }

  private _onPointerUp(): void {
    this._dragging = false;
  }

  private _onTrackClick(e: MouseEvent): void {
    if (this.readOnly) return;
    this._updatePositionFromClient(e.clientX);
  }

  private _updatePosition(e: PointerEvent): void {
    this._updatePositionFromClient(e.clientX);
  }

  private _updatePositionFromClient(clientX: number): void {
    const track = this._trackRef;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    this._position = Math.max(0, Math.min(100, pct));

    this.dispatchEvent(
      new CustomEvent("scrubber-move", {
        detail: { position: Math.round(this._position) },
        bubbles: true,
        composed: true,
      })
    );
  }

  protected firstUpdated(): void {
    this._trackRef = this.renderRoot.querySelector(".track-area");
  }

  render() {
    const ticks = [0, 25, 50, 75, 100];
    const bars = this._getInterpolatedValues();

    return html`
      <div class="scrubber-container">
        <div
          class="track-area"
          @click=${this._onTrackClick}
        >
          <div class="track-line"></div>
          ${ticks.map(
            (t) => html`
              <div class="tick" style="left: ${t}%"></div>
              <div class="tick-label" style="left: ${t}%">${t}%</div>
            `
          )}
          <div
            class="diamond ${this._dragging ? "dragging" : ""}"
            style="left: ${this._position}%"
            @pointerdown=${this._onPointerDown}
            @pointermove=${this._onPointerMove}
            @pointerup=${this._onPointerUp}
            @lostpointercapture=${this._onPointerUp}
          ></div>
        </div>

        <div class="bars-container">
          ${bars.map(
            (bar) => html`
              <div class="bar-item">
                <div class="bar-track">
                  <div
                    class="bar-fill"
                    style="height: ${bar.value}%; background: ${bar.color}"
                  ></div>
                </div>
                <span class="bar-value" style="color: ${bar.color}"
                  >${bar.value}%</span
                >
                <span class="bar-name" title="${bar.name}"
                  >${bar.name}</span
                >
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
    "curve-scrubber": CurveScrubber;
  }
}
