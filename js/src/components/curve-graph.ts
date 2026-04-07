import { LitElement, html, css, svg, nothing, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { LightCurve, ControlPoint } from '../utils/types.js';
import { prepareBrightnessConfig } from '../utils/interpolation.js';
import {
  PAD_LEFT,
  PAD_RIGHT,
  PAD_TOP,
  PAD_BOTTOM,
  GRAPH_W,
  GRAPH_H,
  VB_W,
  VB_H,
  toSvgX,
  toSvgY,
  fromSvgX,
  fromSvgY,
  clamp,
  computeMonotoneTangents,
  sampleSmoothCurveAt,
  sampleCurveAt,
  buildSmoothPath,
  DASH_PATTERNS,
} from '../utils/graph-math.js';

@customElement('curve-graph')
export class CurveGraph extends LitElement {
  @property({ type: Array }) curves: LightCurve[] = [];
  @property({ type: String }) selectedCurveId: string | null = null;
  @property({ type: Boolean }) readOnly = false;
  @property({ type: Number }) scrubberPosition: number | null = null;

  @state() private _dragCurveIdx = -1;
  @state() private _dragPointIdx = -1;
  @state() private _hoveredPoint: { curve: number; point: number } | null = null;

  private _wasDragging = false;
  private _longPressTimer: ReturnType<typeof setTimeout> | null = null;
  private _longPressFired = false;

  static styles = css`
    :host {
      display: block;
    }
    svg {
      width: 100%;
      height: auto;
      max-height: 320px;
      display: block;
      border-radius: 6px;
      touch-action: none;
    }
    .grid-line {
      stroke: var(--secondary-text, #616161);
      stroke-width: 0.5;
      opacity: 0.15;
    }
    .axis-line {
      stroke: var(--secondary-text, #616161);
      stroke-width: 0.75;
      opacity: 0.4;
    }
    .axis-label {
      fill: var(--secondary-text, #616161);
      font-size: 10px;
      font-weight: 500;
      font-family: inherit;
    }
    .tick-label {
      fill: var(--secondary-text, #616161);
      font-size: 10px;
      font-weight: 500;
      font-family: inherit;
    }
    .curve-line {
      fill: none;
      stroke-width: 2.5;
      stroke-linecap: round;
      stroke-linejoin: round;
      transition: opacity 0.3s ease;
    }
    .control-point {
      cursor: grab;
      transition:
        r 0.15s ease,
        filter 0.15s ease;
    }
    .control-point:hover,
    .control-point.hovered {
      r: 7.5;
      filter: drop-shadow(0 0 6px var(--glow-color, #42a5f5));
    }
    .control-point.dragging {
      cursor: grabbing;
      r: 8;
      filter: drop-shadow(0 0 8px var(--glow-color, #42a5f5));
    }
    .control-point.fixed {
      cursor: default;
      opacity: 0.5;
    }
    .hit-area {
      fill: transparent;
      cursor: crosshair;
    }
    .hint {
      fill: var(--secondary-text, #616161);
      font-size: 11px;
      font-family: inherit;
      opacity: 0.8;
    }
    .hint-select {
      font-weight: 500;
    }
    .editing-label {
      font-size: 10px;
      font-family: inherit;
      opacity: 0.7;
      font-weight: 500;
    }
    .diagonal-ref {
      stroke: var(--secondary-text, #616161);
      stroke-width: 0.75;
      opacity: 0.12;
      stroke-dasharray: 4 3;
    }
    .crosshair {
      stroke-width: 0.75;
      stroke-dasharray: 3 3;
    }
    @media (max-width: 500px) {
      svg {
        min-height: 180px;
      }
    }
    .scrubber-line {
      stroke: var(--secondary-text, #616161);
      stroke-width: 0.75;
      stroke-dasharray: 3 3;
      opacity: 0.3;
    }
    .scrubber-dot {
      stroke: none;
    }
    .tooltip-bg {
      fill: var(--tooltip-background-color, var(--primary-text-color, #212121));
      rx: 3;
      ry: 3;
      opacity: 0.9;
    }
    .tooltip-text {
      fill: var(--tooltip-text-color, var(--card-background-color, #fff));
      font-size: 9.5px;
      font-family: inherit;
    }
  `;

  private _svgRef: SVGSVGElement | null = null;

  private _getSvgCoords(e: MouseEvent): { x: number; y: number } | null {
    const svgEl = this._svgRef;
    if (!svgEl) return null;
    const ctm = svgEl.getScreenCTM();
    if (!ctm) return null;
    const inv = ctm.inverse();
    const pt = svgEl.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgPt = pt.matrixTransform(inv);
    return { x: fromSvgX(svgPt.x), y: fromSvgY(svgPt.y) };
  }

  private _isCurveInteractive(curveIdx: number): boolean {
    if (this.readOnly) return false;
    if (this.selectedCurveId === null) return true;
    return this.curves[curveIdx]?.entityId === this.selectedCurveId;
  }

  private _onPointerDown(e: PointerEvent, curveIdx: number, pointIdx: number): void {
    // Only drag on primary button (left-click); ignore right-click so contextmenu works
    if (e.button !== 0) return;
    if (!this._isCurveInteractive(curveIdx)) return;

    // The origin anchor (index 0) is not draggable or removable
    if (pointIdx === 0) return;

    e.preventDefault();
    this._longPressFired = false;

    // Start long-press timer for touch removal (500ms)
    this._clearLongPress();
    this._longPressTimer = setTimeout(() => {
      this._longPressFired = true;
      // Cancel any drag in progress
      this._dragCurveIdx = -1;
      this._dragPointIdx = -1;
      this.dispatchEvent(
        new CustomEvent('point-remove', {
          detail: { curveIndex: curveIdx, pointIndex: pointIdx },
          bubbles: true,
          composed: true,
        })
      );
    }, 500);

    // Capture on the SVG so move/up events fire on the SVG, not the circle
    this._svgRef?.setPointerCapture(e.pointerId);
    this._dragCurveIdx = curveIdx;
    this._dragPointIdx = pointIdx;
  }

  private _clearLongPress(): void {
    if (this._longPressTimer) {
      clearTimeout(this._longPressTimer);
      this._longPressTimer = null;
    }
  }

  private _onPointerMove(e: PointerEvent): void {
    if (this._dragCurveIdx < 0) return;
    e.preventDefault();
    // Any movement cancels long-press — user is dragging
    this._clearLongPress();
    const coords = this._getSvgCoords(e);
    if (!coords) return;

    // Clamp x to avoid colliding with adjacent control points
    const curve = this.curves[this._dragCurveIdx];
    const pts = curve?.controlPoints ?? [];
    const prevX = this._dragPointIdx > 0 ? pts[this._dragPointIdx - 1].lightener + 1 : 1;
    const nextX =
      this._dragPointIdx < pts.length - 1 ? pts[this._dragPointIdx + 1].lightener - 1 : 100;
    const x = Math.round(clamp(coords.x, prevX, nextX));
    const y = Math.round(clamp(coords.y, 0, 100));

    this.dispatchEvent(
      new CustomEvent('point-move', {
        detail: {
          curveIndex: this._dragCurveIdx,
          pointIndex: this._dragPointIdx,
          lightener: x,
          target: y,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _onPointerUp(e: PointerEvent): void {
    this._clearLongPress();
    if (this._longPressFired) return;
    if (this._dragCurveIdx < 0) return;
    e.preventDefault();

    this.dispatchEvent(
      new CustomEvent('point-drop', {
        detail: {
          curveIndex: this._dragCurveIdx,
          pointIndex: this._dragPointIdx,
        },
        bubbles: true,
        composed: true,
      })
    );

    this._dragCurveIdx = -1;
    this._dragPointIdx = -1;

    // Prevent dblclick from firing after drag release.
    // Use timeout matching the OS double-click window (~400ms),
    // since dblclick fires much later than the next animation frame.
    this._wasDragging = true;
    setTimeout(() => {
      this._wasDragging = false;
    }, 400);
  }

  private _onPointContextMenu(e: MouseEvent, curveIdx: number, pointIdx: number): void {
    e.preventDefault();
    e.stopPropagation();
    if (this.readOnly) return;
    if (!this._isCurveInteractive(curveIdx)) return;
    // Cannot remove the origin anchor (index 0)
    if (pointIdx === 0) return;

    this.dispatchEvent(
      new CustomEvent('point-remove', {
        detail: { curveIndex: curveIdx, pointIndex: pointIdx },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _onDblClick(e: MouseEvent): void {
    if (this.readOnly) return;
    if (this._wasDragging) return;

    const coords = this._getSvgCoords(e);
    if (!coords) return;
    const x = Math.round(clamp(coords.x, 1, 100));
    const y = Math.round(clamp(coords.y, 0, 100));

    this.dispatchEvent(
      new CustomEvent('point-add', {
        detail: {
          lightener: x,
          target: y,
          entityId: this.selectedCurveId,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _renderGrid() {
    const ticks = [0, 25, 50, 75, 100];
    return svg`
      <!-- Diagonal reference line (1:1) -->
      <line class="diagonal-ref"
        x1="${toSvgX(0)}" y1="${toSvgY(0)}"
        x2="${toSvgX(100)}" y2="${toSvgY(100)}" />

      ${ticks.map(
        (t) => svg`
        <!-- Vertical grid -->
        <line class="grid-line"
          x1="${toSvgX(t)}" y1="${toSvgY(0)}"
          x2="${toSvgX(t)}" y2="${toSvgY(100)}" />
        <!-- Horizontal grid -->
        <line class="grid-line"
          x1="${toSvgX(0)}" y1="${toSvgY(t)}"
          x2="${toSvgX(100)}" y2="${toSvgY(t)}" />
        <!-- X tick labels -->
        <text class="tick-label" text-anchor="middle"
          x="${toSvgX(t)}" y="${VB_H - PAD_BOTTOM + 16}">${t}%</text>
        <!-- Y tick labels -->
        <text class="tick-label" text-anchor="end" dominant-baseline="middle"
          x="${PAD_LEFT - 6}" y="${toSvgY(t)}">${t}%</text>
      `
      )}

      <!-- Axis border lines -->
      <line class="axis-line"
        x1="${PAD_LEFT}" y1="${toSvgY(0)}"
        x2="${PAD_LEFT + GRAPH_W}" y2="${toSvgY(0)}" />
      <line class="axis-line"
        x1="${PAD_LEFT}" y1="${toSvgY(0)}"
        x2="${PAD_LEFT}" y2="${toSvgY(100)}" />

      <!-- Axis labels -->
      <text class="axis-label" text-anchor="middle"
        x="${PAD_LEFT + GRAPH_W / 2}" y="${VB_H - 4}">Group brightness</text>
      <text class="axis-label" text-anchor="middle"
        transform="rotate(-90, 10, ${PAD_TOP + GRAPH_H / 2})"
        x="10" y="${PAD_TOP + GRAPH_H / 2}">Light brightness</text>
    `;
  }

  private _renderCrossHair(curve: LightCurve) {
    if (this._dragCurveIdx < 0) return nothing;
    const cp = curve.controlPoints[this._dragPointIdx];
    if (!cp) return nothing;

    const cx = toSvgX(cp.lightener);
    const cy = toSvgY(cp.target);

    return svg`
      <line class="crosshair"
        x1="${cx}" y1="${cy}"
        x2="${cx}" y2="${toSvgY(0)}"
        stroke="${curve.color}" opacity="0.5" />
      <line class="crosshair"
        x1="${cx}" y1="${cy}"
        x2="${PAD_LEFT}" y2="${cy}"
        stroke="${curve.color}" opacity="0.5" />
    `;
  }

  private _renderTooltip(curve: LightCurve, cp: ControlPoint) {
    const cx = toSvgX(cp.lightener);
    const cy = toSvgY(cp.target);
    const label = `${cp.lightener}:${cp.target}`;
    const textWidth = label.length * 5;
    // Position above the point, clamped within viewBox
    const tx = clamp(cx - textWidth / 2 - 2, PAD_LEFT, PAD_LEFT + GRAPH_W - textWidth - 8);
    const ty = Math.max(PAD_TOP + 4, cy - 16);

    return svg`
      <rect class="tooltip-bg"
        x="${tx}" y="${ty - 8}"
        width="${textWidth + 8}" height="14" />
      <text class="tooltip-text" text-anchor="start"
        x="${tx + 4}" y="${ty + 2}">${label}</text>
    `;
  }

  private _renderScrubberIndicator() {
    if (this.scrubberPosition === null) return nothing;

    const pos = this.scrubberPosition;
    const x = toSvgX(pos);

    // Dim overlay to the right of the scrubber position
    const dimOverlay = svg`
      <rect
        x="${x}" y="${toSvgY(100)}"
        width="${toSvgX(100) - x}" height="${GRAPH_H}"
        fill="var(--ha-card-background, var(--card-background-color, #1c1c1c))"
        opacity="0.25"
        pointer-events="none"
      />
    `;

    // Vertical dashed line from x-axis to top of graph
    const line = svg`
      <line class="scrubber-line"
        x1="${x}" y1="${toSvgY(0)}"
        x2="${x}" y2="${toSvgY(100)}" />
    `;

    // Intersection dots on each visible curve — use the same cubic
    // Hermite interpolation as the rendered SVG path so dots sit exactly on the line.
    const dots = this.curves
      .filter((c) => c.visible)
      .map((c) => {
        const cy = toSvgY(sampleCurveAt(c.controlPoints, pos));

        return svg`
          <circle
            class="scrubber-dot"
            cx="${x}" cy="${cy}"
            r="4"
            fill="${c.color}"
            filter="url(#scrubber-glow-${c.color.replace('#', '')})"
            pointer-events="none"
          />
        `;
      });

    return svg`${dimOverlay}${line}${dots}`;
  }

  private _renderCurve(curve: LightCurve, curveIdx: number) {
    if (!curve.visible || !curve.controlPoints.length) return nothing;

    try {
      const isSelected = this.selectedCurveId === null || curve.entityId === this.selectedCurveId;
      const isInteractive = this._isCurveInteractive(curveIdx);
      const showPoints = isInteractive && !this.readOnly;

      // Build smooth bezier path through the prepared control points
      const prepared = prepareBrightnessConfig(curve.controlPoints);
      const pathPoints = prepared.map((cp) => ({
        x: toSvgX(cp.lightener),
        y: toSvgY(cp.target),
      }));
      const curvePath = buildSmoothPath(pathPoints);

      // Gradient fill path: close the curve to the x-axis
      const fillPath =
        curvePath +
        ` L${toSvgX(prepared[prepared.length - 1].lightener)},${toSvgY(0)}` +
        ` L${toSvgX(0)},${toSvgY(0)} Z`;

      const gradientId = `grad-${curveIdx}`;

      // Dash patterns for colorblind accessibility (cycle through 5 patterns)
      const dashArray = DASH_PATTERNS[curveIdx % DASH_PATTERNS.length];

      const isDraggingThisCurve = this._dragCurveIdx === curveIdx;
      const fillColor = curve.color + '33'; // 20% opacity version
      const lineOpacity = isSelected ? 1 : 0.2;

      // Find hovered or dragged point for tooltip
      let tooltipPoint: ControlPoint | null = null;
      if (isDraggingThisCurve && this._dragPointIdx >= 0) {
        tooltipPoint = curve.controlPoints[this._dragPointIdx];
      } else if (this._hoveredPoint?.curve === curveIdx && showPoints) {
        tooltipPoint = curve.controlPoints[this._hoveredPoint.point];
      }

      return svg`
      <defs>
        <linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${curve.color}" stop-opacity="${isSelected ? 0.45 : 0.06}" />
          <stop offset="100%" stop-color="${curve.color}" stop-opacity="${isSelected ? 0.08 : 0}" />
        </linearGradient>
      </defs>
      ${isDraggingThisCurve ? this._renderCrossHair(curve) : nothing}
      <path
        d="${fillPath}"
        fill="url(#${gradientId})"
        style="opacity: ${lineOpacity}"
        pointer-events="none"
      />
      <path
        class="curve-line"
        d="${curvePath}"
        stroke="${curve.color}"
        stroke-dasharray="${dashArray}"
        style="opacity: ${lineOpacity}"
        pointer-events="none"
      />
      ${
        showPoints
          ? curve.controlPoints.map((cp, pi) => {
              const isFixed = cp.lightener === 0;
              const isActive = isDraggingThisCurve && this._dragPointIdx === pi;
              const isHovered =
                this._hoveredPoint?.curve === curveIdx && this._hoveredPoint?.point === pi;
              return svg`
              <circle
                class="hit-circle"
                cx="${toSvgX(cp.lightener)}"
                cy="${toSvgY(cp.target)}"
                r="20"
                fill="transparent"
                pointer-events="all"
                style="touch-action: none; -webkit-touch-callout: none"
                @pointerdown=${(e: PointerEvent) => this._onPointerDown(e, curveIdx, pi)}
                @contextmenu=${(e: MouseEvent) => this._onPointContextMenu(e, curveIdx, pi)}
                @pointerenter=${() => (this._hoveredPoint = { curve: curveIdx, point: pi })}
                @pointerleave=${() => (this._hoveredPoint = null)}
              />
              <circle
                class="control-point ${isFixed ? 'fixed' : ''} ${
                  isActive ? 'dragging' : ''
                } ${isHovered ? 'hovered' : ''}"
                cx="${toSvgX(cp.lightener)}"
                cy="${toSvgY(cp.target)}"
                r="6"
                fill="${fillColor}"
                stroke="${curve.color}"
                stroke-width="2"
                style="--glow-color: ${curve.color}"
                pointer-events="none"
              />
            `;
            })
          : nothing
      }
      ${tooltipPoint !== null ? this._renderTooltip(curve, tooltipPoint) : nothing}
    `;
    } catch {
      return nothing;
    }
  }

  protected firstUpdated(_changedProperties: PropertyValues): void {
    this._svgRef = this.renderRoot.querySelector('svg');
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._clearLongPress();
  }

  render() {
    return html`
      <svg
        viewBox="0 0 ${VB_W} ${VB_H}"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Brightness curve editor graph"
        @pointermove=${this._onPointerMove}
        @pointerup=${this._onPointerUp}
        @lostpointercapture=${this._onPointerUp}
        @dblclick=${this._onDblClick}
        @contextmenu=${(e: MouseEvent) => {
          if (!this.readOnly) e.preventDefault();
        }}
      >
        ${this._renderGrid()}

        <!-- Invisible hit area for double-click -->
        ${!this.readOnly
          ? html`<rect
              class="hit-area"
              x="${PAD_LEFT}"
              y="${PAD_TOP}"
              width="${GRAPH_W}"
              height="${GRAPH_H}"
              pointer-events="all"
              fill="transparent"
            />`
          : nothing}
        ${(() => {
          // Render the selected curve last so its hit circles are on top of other curves
          const selectedIdx = this.selectedCurveId
            ? this.curves.findIndex((c) => c.entityId === this.selectedCurveId)
            : -1;
          const order =
            selectedIdx > 0
              ? [
                  ...this.curves.slice(0, selectedIdx).map((c, i) => ({ curve: c, idx: i })),
                  ...this.curves
                    .slice(selectedIdx + 1)
                    .map((c, i) => ({ curve: c, idx: selectedIdx + 1 + i })),
                  { curve: this.curves[selectedIdx], idx: selectedIdx },
                ]
              : this.curves.map((c, i) => ({ curve: c, idx: i }));
          return order.map(({ curve, idx }) => this._renderCurve(curve, idx));
        })()}
        <!-- Scrubber glow filters (only re-render when curves change, not on every position update) -->
        <defs>
          ${this.curves
            .filter((c) => c.visible)
            .map((c) => {
              const id = `scrubber-glow-${c.color.replace('#', '')}`;
              return svg`
              <filter id="${id}" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
                <feFlood flood-color="${c.color}" flood-opacity="0.5" result="color" />
                <feComposite in="color" in2="blur" operator="in" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>`;
            })}
        </defs>
        ${this._renderScrubberIndicator()}
        ${(() => {
          if (this.readOnly) return nothing;
          if (this.selectedCurveId === null && this._dragCurveIdx < 0) {
            return svg`<text class="hint hint-select" text-anchor="middle"
                x="${PAD_LEFT + GRAPH_W / 2}" y="${PAD_TOP + GRAPH_H / 2}"
                >Select a light below to start editing</text>`;
          }
          const selected = this.curves.find((c) => c.entityId === this.selectedCurveId);
          return svg`
              <text class="editing-label"
                x="${PAD_LEFT + 6}" y="${PAD_TOP + 14}"
                fill="${selected?.color ?? 'currentColor'}"
                >Editing: ${selected?.friendlyName ?? ''}</text>
              <text class="hint" text-anchor="end"
                x="${PAD_LEFT + GRAPH_W - 4}" y="${PAD_TOP + GRAPH_H - 6}"
                >Double-tap to add · Long-press to remove</text>`;
        })()}
      </svg>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'curve-graph': CurveGraph;
  }
}
