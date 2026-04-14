import { LitElement, html, css } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { LightCurve } from '../utils/types.js';
import { PAD_LEFT, PAD_RIGHT, VB_W, sampleCurveAt } from '../utils/graph-math.js';

@customElement('curve-scrubber')
export class CurveScrubber extends LitElement {
  @property({ type: Array }) curves: LightCurve[] = [];
  @property({ type: Boolean }) readOnly = false;

  @state() private _position = 50; // 0-100
  @state() private _overflowCount = 0;
  @state() private _expanded = false;

  @query('.value-badges') private _badgesRef!: HTMLElement | null;

  private _dragging = false;
  private _trackRef: HTMLElement | null = null;
  private _resizeObserver: ResizeObserver | null = null;
  private _observedBadgesRef: HTMLElement | null = null;

  static styles = css`
    :host {
      display: block;
    }
    .scrubber-panel {
      border-radius: 12px;
      padding: 14px 12px 12px;
      background: color-mix(
        in srgb,
        var(--ha-card-background, var(--card-background-color, #fff)) 95%,
        var(--secondary-text-color, #616161) 5%
      );
    }
    .scrubber-label {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--secondary-text-color, #616161);
      opacity: 0.7;
      margin-bottom: 10px;
    }
    .track-area {
      position: relative;
      height: 28px;
      cursor: pointer;
      touch-action: none;
      /* Align with graph plot area: scrubber panel now has same 12px side
         padding as graph panel, so % margins match the SVG axis padding. */
      margin-left: ${(PAD_LEFT / VB_W) * 100}%;
      margin-right: ${(PAD_RIGHT / VB_W) * 100}%;
    }
    .track-bg {
      position: absolute;
      top: 12px;
      left: 0;
      right: 0;
      height: 4px;
      border-radius: 2px;
      background: rgba(37, 99, 235, 0.25);
    }
    .track-fill {
      position: absolute;
      top: 12px;
      left: 0;
      height: 4px;
      border-radius: 2px;
      background: linear-gradient(90deg, rgba(37, 99, 235, 0.25), #2563eb);
      transition: width 0.05s linear;
    }
    .thumb {
      position: absolute;
      top: 6px;
      width: 16px;
      height: 16px;
      background: #2563eb;
      border-radius: 50%;
      transform: translateX(-50%);
      cursor: grab;
      border: 2px solid var(--ha-card-background, var(--card-background-color, #fff));
      box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
      transition: box-shadow 0.15s ease;
      z-index: 2;
    }
    .thumb::after {
      content: '';
      position: absolute;
      top: -14px;
      left: -14px;
      right: -14px;
      bottom: -14px;
    }
    .thumb:hover {
      box-shadow: 0 2px 10px rgba(37, 99, 235, 0.45);
    }
    .thumb.dragging {
      cursor: grabbing;
      box-shadow: 0 2px 14px rgba(37, 99, 235, 0.5);
    }
    .position-label {
      position: absolute;
      top: -10px;
      font-size: 10px;
      font-weight: 600;
      color: #2563eb;
      transform: translateX(-50%);
      user-select: none;
      font-variant-numeric: tabular-nums;
      pointer-events: none;
    }
    .value-badges-wrap {
      position: relative;
      margin-top: 10px;
    }
    .value-badges {
      display: flex;
      gap: 4px 6px;
      flex-wrap: wrap;
      max-height: var(--curve-scrubber-badges-max-height, 46px);
      overflow: hidden;
    }
    .badge {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
      background: rgba(128, 128, 128, 0.06);
      white-space: nowrap;
      min-width: 0;
    }
    .badge-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .badge-name {
      font-weight: 400;
      opacity: 0.5;
      margin-left: 2px;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 110px;
    }
    .overflow-indicator {
      position: absolute;
      right: 0;
      bottom: 0;
      display: inline-flex;
      align-items: center;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      color: var(--secondary-text-color, #616161);
      background: linear-gradient(
        90deg,
        transparent,
        color-mix(
            in srgb,
            var(--ha-card-background, var(--card-background-color, #fff)) 94%,
            var(--secondary-text-color, #616161) 6%
          )
          28%
      );
      cursor: pointer;
      border: none;
      font: inherit;
    }
    @media (max-width: 500px) {
      .track-area {
        height: 36px;
      }
      .track-bg {
        top: 17px;
      }
      .track-fill {
        top: 17px;
      }
      .thumb {
        width: 20px;
        height: 20px;
        top: 8px;
      }
      .position-label {
        font-size: 12px;
      }
      .badge {
        font-size: 13px;
        padding: 5px 10px;
      }
      .scrubber-label {
        font-size: 11px;
      }
    }
  `;

  /**
   * Return a contrast-safe text color for badge values.
   * Yellow (#ffca28) and orange (#ffa726) fail WCAG AA on light backgrounds,
   * so we darken them to meet 4.5:1 ratio.
   */
  private _badgeTextColor(hex: string): string {
    const low = hex.toLowerCase();
    // Low-contrast colors on white/light backgrounds — use darkened variants
    if (low === '#ffca28') return '#9e7c00'; // dark gold
    if (low === '#ffa726') return '#b36b00'; // dark orange
    return hex;
  }

  private _getInterpolatedValues(): {
    entityId: string;
    name: string;
    color: string;
    value: number;
  }[] {
    const pos = Math.round(this._position);
    return this.curves
      .filter((c) => c.visible)
      .map((c) => {
        return {
          entityId: c.entityId,
          name: c.friendlyName,
          color: c.color,
          value: Math.round(sampleCurveAt(c.controlPoints, pos)),
        };
      });
  }

  private _onPointerDown(e: PointerEvent): void {
    if (this.readOnly) return;
    e.preventDefault();
    this._dragging = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    this._updatePositionFromClient(e.clientX);
    this.dispatchEvent(new CustomEvent('scrubber-start', { bubbles: true, composed: true }));
  }

  private _onPointerMove(e: PointerEvent): void {
    if (!this._dragging) return;
    e.preventDefault();
    this._updatePositionFromClient(e.clientX);
  }

  private _onPointerUp(): void {
    if (!this._dragging) return;
    this._dragging = false;
    this.dispatchEvent(new CustomEvent('scrubber-end', { bubbles: true, composed: true }));
  }

  private _onTrackClick(e: MouseEvent): void {
    if (this.readOnly) return;
    this._updatePositionFromClient(e.clientX);
  }

  private _onKeyDown(e: KeyboardEvent): void {
    if (this.readOnly) return;
    const step = e.shiftKey ? 10 : 1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      this._position = Math.min(100, this._position + step);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      this._position = Math.max(0, this._position - step);
    } else if (e.key === 'Home') {
      e.preventDefault();
      this._position = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      this._position = 100;
    } else {
      return;
    }

    this._emitPosition();
  }

  private _updatePositionFromClient(clientX: number): void {
    const track = this._trackRef;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    this._position = Math.max(0, Math.min(100, pct));
    this._emitPosition();
  }

  private _emitPosition(): void {
    this.dispatchEvent(
      new CustomEvent('scrubber-move', {
        detail: { position: this._position },
        bubbles: true,
        composed: true,
      })
    );
  }

  connectedCallback(): void {
    super.connectedCallback();
    if (typeof ResizeObserver !== 'undefined') {
      this._resizeObserver = new ResizeObserver(() => this._measureBadgeOverflow());
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
    this._observedBadgesRef = null;
  }

  protected firstUpdated(): void {
    this._trackRef = this.renderRoot.querySelector('.track-area');
    this._bindBadgeObserver();
    this._measureBadgeOverflow();
  }

  protected updated(): void {
    this._bindBadgeObserver();
  }

  private _bindBadgeObserver(): void {
    if (!this._resizeObserver || !this._badgesRef || this._observedBadgesRef === this._badgesRef) {
      return;
    }

    this._resizeObserver.disconnect();
    this._resizeObserver.observe(this._badgesRef);
    this._observedBadgesRef = this._badgesRef;
  }

  private _measureBadgeOverflow(): void {
    const container = this._badgesRef;
    if (!container) return;

    const maxVisibleBottom = container.clientHeight + 1;
    const badges = [...container.querySelectorAll<HTMLElement>('.badge[data-value-badge="true"]')];
    const hiddenCount = badges.filter(
      (badge) => badge.offsetTop + badge.offsetHeight > maxVisibleBottom
    ).length;

    if (hiddenCount !== this._overflowCount) {
      this._overflowCount = hiddenCount;
    }
    if (hiddenCount === 0) {
      this._expanded = false;
    }
  }

  render() {
    const bars = this._getInterpolatedValues();
    const pos = Math.round(this._position);

    return html`
      <div class="scrubber-panel">
        <div class="scrubber-label">Preview at brightness</div>
        <div
          class="track-area"
          role="slider"
          tabindex="0"
          aria-label="Brightness scrubber"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow=${pos}
          aria-valuetext="${pos}% brightness"
          @click=${this._onTrackClick}
          @keydown=${this._onKeyDown}
        >
          <div class="track-bg"></div>
          <div class="track-fill" style="width: ${this._position}%"></div>
          <div class="position-label" style="left: ${this._position}%">${pos}%</div>
          <div
            class="thumb ${this._dragging ? 'dragging' : ''}"
            style="left: ${this._position}%"
            @pointerdown=${this._onPointerDown}
            @pointermove=${this._onPointerMove}
            @pointerup=${this._onPointerUp}
            @lostpointercapture=${this._onPointerUp}
          ></div>
        </div>

        <div class="value-badges-wrap">
          <div class="value-badges" style="${this._expanded ? 'max-height: none;' : ''}">
            ${bars.map(
              (bar) => html`
                <div class="badge" data-value-badge="true">
                  <span class="badge-dot" style="background: ${bar.color}"></span>
                  <span style="color: ${this._badgeTextColor(bar.color)}">${bar.value}%</span>
                  <span class="badge-name">${bar.name}</span>
                </div>
              `
            )}
          </div>
          ${this._overflowCount > 0 || this._expanded
            ? html`<button
                class="overflow-indicator"
                @click=${() => {
                  this._expanded = !this._expanded;
                }}
              >
                ${this._expanded ? 'Show less' : `+${this._overflowCount} more`}
              </button>`
            : null}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'curve-scrubber': CurveScrubber;
  }
}
