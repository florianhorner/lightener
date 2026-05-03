import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { LightCurve } from '../utils/types.js';
import { PAD_LEFT, PAD_RIGHT, VB_W } from '../utils/graph-math.js';

@customElement('curve-scrubber')
export class CurveScrubber extends LitElement {
  @property({ type: Array }) curves: LightCurve[] = [];
  @property({ type: Boolean }) readOnly = false;
  @property({ type: Boolean }) previewActive = false;
  @property({ type: Boolean }) canPreview = false;

  @state() private _dragging = false;
  @state() private _position = 50; // 0-100

  private _trackRef: HTMLElement | null = null;

  static styles = css`
    :host {
      display: block;
      --accent: var(--primary-color, #2563eb);
      --divider: var(--divider-color, rgba(127, 127, 127, 0.2));
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
    .scrubber-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
      min-height: 22px;
    }
    .scrubber-label {
      font-size: 11px;
      font-weight: 600;
      color: var(--secondary-text-color, #616161);
    }
    .preview-toggle-btn {
      border: 1px solid var(--divider);
      border-radius: 999px;
      padding: 4px 11px;
      font-size: 10px;
      font-weight: 500;
      background: transparent;
      color: var(--secondary-text-color, #616161);
      cursor: pointer;
      font-family: inherit;
      display: flex;
      align-items: center;
      gap: 5px;
      transition:
        border-color 0.15s,
        color 0.15s,
        background 0.15s;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .preview-toggle-btn:hover {
      border-color: var(--accent);
      color: var(--accent);
      background: color-mix(in srgb, var(--accent) 4%, transparent);
    }
    .preview-toggle-btn:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
    }
    .preview-toggle-btn.active {
      border-color: var(--accent);
      color: var(--accent);
      background: color-mix(in srgb, var(--accent) 6%, transparent);
    }
    .preview-live-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--accent);
      animation: pulse-dot 1.4s ease-in-out infinite;
      flex-shrink: 0;
    }
    .preview-restore-text {
      opacity: 0.7;
    }
    @keyframes pulse-dot {
      0%,
      100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.5;
        transform: scale(0.8);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .preview-live-dot {
        animation: none;
        opacity: 0.6;
      }
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
      background: color-mix(in srgb, var(--accent) 25%, transparent);
    }
    .track-fill {
      position: absolute;
      top: 12px;
      left: 0;
      height: 4px;
      border-radius: 2px;
      background: linear-gradient(
        90deg,
        color-mix(in srgb, var(--accent) 25%, transparent),
        var(--accent)
      );
      transition: width 0.05s linear;
    }
    .thumb {
      position: absolute;
      top: 6px;
      width: 16px;
      height: 16px;
      background: var(--accent);
      border-radius: 50%;
      transform: translateX(-50%);
      cursor: grab;
      border: 2px solid var(--ha-card-background, var(--card-background-color, #fff));
      box-shadow: 0 2px 6px color-mix(in srgb, var(--accent) 30%, transparent);
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
      box-shadow: 0 2px 10px color-mix(in srgb, var(--accent) 45%, transparent);
    }
    .thumb.dragging {
      cursor: grabbing;
      box-shadow: 0 2px 14px color-mix(in srgb, var(--accent) 50%, transparent);
    }
    .position-label {
      position: absolute;
      top: -10px;
      font-size: 10px;
      font-weight: 600;
      color: var(--accent);
      transform: translateX(-50%);
      user-select: none;
      font-variant-numeric: tabular-nums;
      pointer-events: none;
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
      .scrubber-label {
        font-size: 11px;
      }
      .preview-toggle-btn {
        font-size: 11px;
        padding: 0 12px;
        min-height: 44px;
      }
    }
  `;

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

  private _onPreviewToggle(): void {
    this.dispatchEvent(new CustomEvent('preview-toggle', { bubbles: true, composed: true }));
  }

  protected firstUpdated(): void {
    this._trackRef = this.renderRoot.querySelector('.track-area');
  }

  render() {
    const pos = Math.round(this._position);

    return html`
      <div class="scrubber-panel">
        <div class="scrubber-header">
          <div class="scrubber-label">Group brightness</div>
          ${this.canPreview
            ? this.previewActive
              ? html`<button class="preview-toggle-btn active" @click=${this._onPreviewToggle}>
                  <span class="preview-live-dot"></span>
                  Previewing all lights &nbsp;·&nbsp;
                  <span class="preview-restore-text">Restore</span>
                </button>`
              : html`<button class="preview-toggle-btn" @click=${this._onPreviewToggle}>
                  Preview all lights
                </button>`
            : nothing}
        </div>
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
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'curve-scrubber': CurveScrubber;
  }
}
