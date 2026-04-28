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
  @state() private _snappedMaxHeight: number | null = null;

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
      padding: 12px;
      background: color-mix(
        in srgb,
        var(--ha-card-background, var(--card-background-color, #fff)) 95%,
        var(--secondary-text-color, #616161) 5%
      );
    }
    .scrubber-label {
      font-size: 11px;
      font-weight: 600;
      color: var(--secondary-text-color, #616161);
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
      background: rgba(128, 128, 128, 0.1);
      white-space: nowrap;
      min-width: 0;
    }
    button.badge.interactive {
      cursor: pointer;
      box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--primary-color, #2563eb) 30%, transparent);
      transition:
        background 0.12s ease,
        box-shadow 0.12s ease;
      border: none;
      font: inherit;
      color: inherit;
    }
    button.badge.interactive:hover {
      background: rgba(128, 128, 128, 0.14);
      box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--primary-color, #2563eb) 60%, transparent);
    }
    button.badge.interactive:focus {
      outline: none;
    }
    button.badge.interactive:focus-visible {
      outline: 2px solid var(--primary-color, #2563eb);
      outline-offset: 2px;
    }
    .badge-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      flex-shrink: 0;
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
      button.badge.interactive {
        min-height: 44px;
      }
      .scrubber-label {
        font-size: 11px;
      }
    }
  `;

  /**
   * Return a contrast-safe text color for badge values.
   * Yellow (#ffca28) and orange (#ffa726) are low-contrast colors that need
   * adjustment depending on the background luminance:
   *  - Light backgrounds: darken to meet WCAG AA 4.5:1 ratio
   *  - Dark backgrounds: use a lighter, more saturated variant for visibility
   */
  private _parseColorChannels(color: string): { r: number; g: number; b: number } | null {
    const value = color.trim();
    const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (hex) {
      const normalized =
        hex[1].length === 3
          ? hex[1]
              .split('')
              .map((channel) => channel + channel)
              .join('')
          : hex[1];
      return {
        r: parseInt(normalized.slice(0, 2), 16),
        g: parseInt(normalized.slice(2, 4), 16),
        b: parseInt(normalized.slice(4, 6), 16),
      };
    }

    const rgb = value.match(
      /^rgba?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)/i
    );
    if (!rgb) return null;
    return {
      r: Number(rgb[1]),
      g: Number(rgb[2]),
      b: Number(rgb[3]),
    };
  }

  private _isDarkSurface(): boolean {
    if (typeof window === 'undefined') return false;
    const styles = getComputedStyle(this);
    const baseSurface =
      styles.getPropertyValue('--ha-card-background').trim() ||
      styles.getPropertyValue('--card-background-color').trim() ||
      styles.backgroundColor.trim();
    const channels = this._parseColorChannels(baseSurface);
    if (!channels) return false;
    const [r, g, b] = [channels.r, channels.g, channels.b].map((value) => value / 255);
    const toLinear = (channel: number) =>
      channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    const luminance = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
    return luminance < 0.5;
  }

  private _badgeTextColor(hex: string): string {
    const low = hex.toLowerCase();
    const isDark = this._isDarkSurface();
    if (low === '#ffca28') return isDark ? '#ffd740' : '#9e7c00'; // light gold / dark gold
    if (low === '#ffa726') return isDark ? '#ffb74d' : '#b36b00'; // light orange / dark orange
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

  private _renderBadgeContent(bar: { color: string; value: number }) {
    return html`
      <span class="badge-dot" style="background: ${bar.color}"></span>
      <span style="color: ${this._badgeTextColor(bar.color)}">${bar.value}%</span>
    `;
  }

  private _onBadgeClick(entityId: string, value: number): void {
    this.dispatchEvent(
      new CustomEvent('badge-click', {
        detail: { entityId, value },
        bubbles: true,
        composed: true,
      })
    );
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
    // Defer past first paint so badge offsetHeights are stable before
    // _measureBadgeOverflow snaps the max-height. A synchronous call here
    // can catch the container mid-layout (e.g. while fonts are swapping),
    // producing a wrong snapped height that collapses badges incorrectly.
    requestAnimationFrame(() => this._measureBadgeOverflow());
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

    // Skip measurement while expanded — all badges are visible so hiddenCount
    // would be 0, immediately collapsing the panel and causing a flicker loop.
    if (this._expanded) return;

    const clipHeight = container.clientHeight;
    const badges = [...container.querySelectorAll<HTMLElement>('.badge[data-value-badge="true"]')];

    // Bail if badges haven't been laid out yet (offsetHeight 0 = pre-paint).
    if (badges.length > 0 && badges.some((b) => b.offsetHeight === 0)) return;

    const tallestBadge = badges.reduce((max, b) => Math.max(max, b.offsetHeight), 0);

    // Snap the max-height to the bottom of the last fully-visible badge so no
    // badge is shown half-cut. "Fully visible" = bottom edge within clipHeight.
    const lastFullyVisible = [...badges]
      .reverse()
      .find((badge) => badge.offsetTop + badge.offsetHeight <= clipHeight);
    const rawSnapped = lastFullyVisible
      ? lastFullyVisible.offsetTop + lastFullyVisible.offsetHeight
      : clipHeight;
    // Never snap below a single badge row — a smaller value means the container
    // hasn't settled (font swap, partial layout) and would wrongly hide all badges.
    const snapped = Math.max(rawSnapped, tallestBadge);

    // Count badges whose bottom exceeds the snapped boundary — those are the
    // ones actually hidden by the snap. Counting against raw clipHeight would
    // undercount when the last row is partially clipped.
    const hiddenCount = badges.filter(
      (badge) => badge.offsetTop + badge.offsetHeight > snapped
    ).length;

    if (hiddenCount !== this._overflowCount) this._overflowCount = hiddenCount;
    if (snapped !== this._snappedMaxHeight) this._snappedMaxHeight = snapped;
  }

  render() {
    const bars = this._getInterpolatedValues();
    const pos = Math.round(this._position);

    return html`
      <div class="scrubber-panel">
        <div class="scrubber-label">At brightness</div>
        <div
          class="track-area"
          role="slider"
          tabindex="${this.readOnly ? -1 : 0}"
          aria-disabled="${this.readOnly}"
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
          <div
            class="value-badges"
            style="${this._expanded
              ? 'max-height: none;'
              : this._snappedMaxHeight !== null
                ? `max-height: ${this._snappedMaxHeight}px;`
                : ''}"
          >
            ${bars.map((bar) =>
              this.readOnly
                ? html`<div class="badge" data-value-badge="true">
                    ${this._renderBadgeContent(bar)}
                  </div>`
                : html`<button
                    type="button"
                    class="badge interactive"
                    data-value-badge="true"
                    aria-label="Set ${bar.name} to ${bar.value}%"
                    @click=${() => this._onBadgeClick(bar.entityId, bar.value)}
                  >
                    ${this._renderBadgeContent(bar)}
                  </button>`
            )}
          </div>
          ${this._overflowCount > 0 || this._expanded
            ? html`<button
                class="overflow-indicator"
                aria-expanded=${this._expanded}
                aria-label="${this._expanded
                  ? 'Collapse light list'
                  : `Show ${this._overflowCount} more lights`}"
                @click=${() => {
                  this._expanded = !this._expanded;
                }}
              >
                ${this._expanded ? 'Collapse' : `+${this._overflowCount} more`}
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
