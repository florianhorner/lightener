import { LitElement, html, css, svg, nothing } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { LightCurve, ControlPoint } from '../utils/types.js';
import { prepareBrightnessConfig } from '../utils/interpolation.js';
import {
  PAD_LEFT,
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
  sampleRenderedCurveAt,
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
  @state() private _focusedPoint: { curve: number; point: number } | null = null;
  @state() private _isMobile = false;

  private readonly _uid = Math.random().toString(36).slice(2, 7);
  private _mql: MediaQueryList | null = null;
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
      min-height: var(--curve-graph-min-height, 0);
      max-height: var(--curve-graph-max-height, 320px);
      display: block;
      border-radius: 6px;
      touch-action: none;
      user-select: none;
      -webkit-user-select: none;
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
    .control-point.hovered,
    .control-point.focused {
      r: 7.5;
      filter: drop-shadow(0 0 6px var(--glow-color, #42a5f5));
    }
    .control-point.dragging {
      cursor: grabbing;
      r: 8;
      filter: drop-shadow(0 0 8px var(--glow-color, #42a5f5));
    }
    .control-point.origin {
      stroke-dasharray: 2 2;
    }
    .hit-circle.origin-hit {
      cursor: ns-resize;
    }
    .hit-circle:focus-visible {
      outline: none;
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
      .axis-label,
      .tick-label {
        font-size: 12px;
      }
      .hint {
        font-size: 12px;
      }
      .editing-label {
        font-size: 12px;
      }
      .tooltip-text {
        font-size: 11px;
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

  @query('svg') private _svgRef!: SVGSVGElement | null;

  private _getSvgCoords(e: MouseEvent): { x: number; y: number } | null {
    const svgEl = this._svgRef;
    if (!svgEl) return null;
    const ctm = svgEl.getScreenCTM();
    if (!ctm) return null;
    let inv: DOMMatrix;
    try {
      inv = ctm.inverse();
    } catch {
      return null;
    }
    if (!inv || isNaN(inv.a)) return null;
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

  private _focusCurve(entityId: string): void {
    this.dispatchEvent(
      new CustomEvent('focus-curve', {
        detail: { entityId },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _onPointFocus(curveIdx: number, pointIdx: number): void {
    const curve = this.curves[curveIdx];
    if (!curve) return;
    this._focusedPoint = { curve: curveIdx, point: pointIdx };
    this._hoveredPoint = { curve: curveIdx, point: pointIdx };
    this._focusCurve(curve.entityId);
  }

  private _onPointBlur(curveIdx: number, pointIdx: number): void {
    if (this._focusedPoint?.curve === curveIdx && this._focusedPoint?.point === pointIdx) {
      this._focusedPoint = null;
    }
    if (this._hoveredPoint?.curve === curveIdx && this._hoveredPoint?.point === pointIdx) {
      this._hoveredPoint = null;
    }
  }

  private _dispatchKeyboardMove(
    curveIdx: number,
    pointIdx: number,
    lightener: number,
    target: number
  ): void {
    this.dispatchEvent(
      new CustomEvent('point-move', {
        detail: { curveIndex: curveIdx, pointIndex: pointIdx, lightener, target },
        bubbles: true,
        composed: true,
      })
    );
    this.dispatchEvent(
      new CustomEvent('point-drop', {
        detail: { curveIndex: curveIdx, pointIndex: pointIdx },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _getKeyboardInsertPoint(curve: LightCurve, pointIdx: number): ControlPoint | null {
    const current = curve.controlPoints[pointIdx];
    const next = curve.controlPoints[pointIdx + 1];
    const previous = curve.controlPoints[pointIdx - 1];

    if (next && next.lightener - current.lightener > 1) {
      return {
        lightener: Math.round((current.lightener + next.lightener) / 2),
        target: Math.round((current.target + next.target) / 2),
      };
    }

    if (previous && current.lightener - previous.lightener > 1) {
      return {
        lightener: Math.round((previous.lightener + current.lightener) / 2),
        target: Math.round((previous.target + current.target) / 2),
      };
    }

    return null;
  }

  private _onPointKeyDown(e: KeyboardEvent, curveIdx: number, pointIdx: number): void {
    const curve = this.curves[curveIdx];
    const point = curve?.controlPoints[pointIdx];
    if (!curve || !point) return;

    if (this.selectedCurveId !== curve.entityId) {
      this._focusCurve(curve.entityId);
    }

    // First control point: Y-axis only — skip horizontal moves
    if (pointIdx === 0 && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) return;

    const step = e.shiftKey ? 10 : 1;
    const prevX = pointIdx > 0 ? curve.controlPoints[pointIdx - 1].lightener + 1 : point.lightener;
    const nextX =
      pointIdx < curve.controlPoints.length - 1
        ? curve.controlPoints[pointIdx + 1].lightener - 1
        : 100;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      this._dispatchKeyboardMove(
        curveIdx,
        pointIdx,
        Math.min(nextX, point.lightener + step),
        point.target
      );
      return;
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      this._dispatchKeyboardMove(
        curveIdx,
        pointIdx,
        Math.max(prevX, point.lightener - step),
        point.target
      );
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      this._dispatchKeyboardMove(
        curveIdx,
        pointIdx,
        point.lightener,
        Math.min(100, point.target + step)
      );
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this._dispatchKeyboardMove(
        curveIdx,
        pointIdx,
        point.lightener,
        Math.max(0, point.target - step)
      );
      return;
    }
    if (e.key === 'Enter') {
      const insertPoint = this._getKeyboardInsertPoint(curve, pointIdx);
      if (!insertPoint) return;
      e.preventDefault();
      this.dispatchEvent(
        new CustomEvent('point-add', {
          detail: {
            entityId: curve.entityId,
            lightener: insertPoint.lightener,
            target: insertPoint.target,
          },
          bubbles: true,
          composed: true,
        })
      );
      // After re-render the new point is at a sorted position; refocus the original point
      this.updateComplete.then(() => this._refocusHitCircle(curveIdx, pointIdx)).catch(() => {});
      return;
    }
    if (
      (e.key === ' ' || e.key === 'Delete' || e.key === 'Backspace') &&
      pointIdx > 0 &&
      curve.controlPoints.length > 2
    ) {
      e.preventDefault();
      this.dispatchEvent(
        new CustomEvent('point-remove', {
          detail: { curveIndex: curveIdx, pointIndex: pointIdx },
          bubbles: true,
          composed: true,
        })
      );
      // After removal, focus the preceding point so keyboard nav can continue
      this.updateComplete
        .then(() => this._refocusHitCircle(curveIdx, Math.max(1, pointIdx - 1)))
        .catch(() => {});
    }
  }

  private _refocusHitCircle(curveIdx: number, pointIdx: number): void {
    // Use data attributes to find the exact circle — render order may differ
    // from array order because the selected curve renders last.
    const target = this.renderRoot.querySelector<SVGCircleElement>(
      `.hit-circle[data-curve="${curveIdx}"][data-point="${pointIdx}"]`
    );
    if (target) {
      target.focus();
    }
  }

  private _onPointerDown(e: PointerEvent, curveIdx: number, pointIdx: number): void {
    // Only drag on primary button (left-click); ignore right-click so contextmenu works
    if (e.button !== 0) return;
    if (!this._isCurveInteractive(curveIdx)) return;

    e.preventDefault();
    this._longPressFired = false;

    // Start long-press timer for touch removal (500ms)
    // Origin point (index 0) cannot be removed — skip long-press removal
    this._clearLongPress();
    if (pointIdx > 0) {
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
    }

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
    const x =
      this._dragPointIdx === 0
        ? (this.curves[this._dragCurveIdx]?.controlPoints[0]?.lightener ?? 0)
        : Math.round(clamp(coords.x, prevX, nextX));
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
      <defs>
        <clipPath id="graph-area-${this._uid}">
          <rect x="${PAD_LEFT - 30}" y="${PAD_TOP - 30}" width="${GRAPH_W + 60}" height="${GRAPH_H + 60}" />
        </clipPath>
      </defs>
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

    // Dim overlay to the right of the scrubber position.
    // Use fill + fill-opacity separately — color-mix() in SVG fill attributes
    // is not reliably supported across all browsers.
    const dimOverlay = svg`
      <rect
        x="${x}" y="${toSvgY(100)}"
        width="${toSvgX(100) - x}" height="${GRAPH_H}"
        fill="var(--ha-card-background, var(--card-background-color, #fff))"
        fill-opacity="0.93"
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
        const cy = toSvgY(sampleRenderedCurveAt(c.controlPoints, pos));

        return svg`
          <circle
            class="scrubber-dot"
            cx="${x}" cy="${cy}"
            r="4"
            fill="${c.color}"
            filter="url(#scrubber-glow-${c.color.replace('#', '')}-${this._uid})"
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

      // Build smooth bezier path through the prepared control points.
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

      const gradientId = `grad-${curveIdx}-${this._uid}`;

      // Dash patterns for colorblind accessibility (cycle through 5 patterns)
      const dashArray = DASH_PATTERNS[curveIdx % DASH_PATTERNS.length];

      const isDraggingThisCurve = this._dragCurveIdx === curveIdx;
      const fillColor = curve.color + '33'; // 20% opacity version
      const lineOpacity = isSelected ? 1 : 0.2;

      // Find hovered or dragged point for tooltip
      let tooltipPoint: ControlPoint | null = null;
      if (isDraggingThisCurve && this._dragPointIdx >= 0) {
        tooltipPoint = curve.controlPoints[this._dragPointIdx];
      } else if (
        (this._hoveredPoint?.curve === curveIdx || this._focusedPoint?.curve === curveIdx) &&
        showPoints
      ) {
        const pointIdx =
          this._focusedPoint?.curve === curveIdx
            ? this._focusedPoint.point
            : (this._hoveredPoint?.point ?? -1);
        tooltipPoint = curve.controlPoints[pointIdx] ?? null;
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
              const isOrigin = pi === 0;
              const isActive = isDraggingThisCurve && this._dragPointIdx === pi;
              const isHovered =
                this._hoveredPoint?.curve === curveIdx && this._hoveredPoint?.point === pi;
              return svg`
              <circle
                class="hit-circle ${isOrigin ? 'origin-hit' : ''}"
                data-curve="${curveIdx}"
                data-point="${pi}"
                cx="${toSvgX(cp.lightener)}"
                cy="${toSvgY(cp.target)}"
                r="${this._isMobile ? 28 : 22}"
                fill="transparent"
                pointer-events="all"
                tabindex="0"
                role="button"
                aria-label="${curve.friendlyName} point ${cp.lightener}% group brightness to ${cp.target}% light brightness. ${pi === 0 ? 'Arrow Up/Down to adjust starting brightness. Cannot be moved horizontally.' : 'Arrow keys move, Enter adds a nearby point, Space removes.'}"
                style="touch-action: none; -webkit-touch-callout: none"
                @pointerdown=${(e: PointerEvent) => this._onPointerDown(e, curveIdx, pi)}
                @contextmenu=${(e: MouseEvent) => this._onPointContextMenu(e, curveIdx, pi)}
                @pointerenter=${() => (this._hoveredPoint = { curve: curveIdx, point: pi })}
                @pointerleave=${() => (this._hoveredPoint = null)}
                @focus=${() => this._onPointFocus(curveIdx, pi)}
                @blur=${() => this._onPointBlur(curveIdx, pi)}
                @keydown=${(e: KeyboardEvent) => this._onPointKeyDown(e, curveIdx, pi)}
              />
              <circle
                class="control-point ${isOrigin ? 'origin' : ''} ${
                  isActive ? 'dragging' : ''
                } ${isHovered ? 'hovered' : ''} ${
                  this._focusedPoint?.curve === curveIdx && this._focusedPoint?.point === pi
                    ? 'focused'
                    : ''
                }"
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

  // _svgRef is now a @query decorator — always resolves to the live SVG node.
  // No firstUpdated override needed.

  connectedCallback(): void {
    super.connectedCallback();
    this._mql = window.matchMedia('(max-width: 500px)');
    this._isMobile = this._mql.matches;
    this._mql.addEventListener('change', this._onMqlChange);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._clearLongPress();
    this._mql?.removeEventListener('change', this._onMqlChange);
    this._mql = null;
  }

  private _onMqlChange = (e: MediaQueryListEvent): void => {
    this._isMobile = e.matches;
  };

  private _getSvgDescription(): string {
    const visible = this.curves.filter((c) => c.visible);
    if (!visible.length) return 'No curves displayed';
    const items = visible.map((c) => {
      const last = c.controlPoints[c.controlPoints.length - 1];
      return `${c.friendlyName} (${c.controlPoints.length} points, max ${last?.target ?? 0}%)`;
    });
    return `${visible.length} curve${visible.length === 1 ? '' : 's'}: ${items.join(', ')}`;
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
        <desc>${this._getSvgDescription()}</desc>
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
            selectedIdx >= 0
              ? [
                  ...this.curves.slice(0, selectedIdx).map((c, i) => ({ curve: c, idx: i })),
                  ...this.curves
                    .slice(selectedIdx + 1)
                    .map((c, i) => ({ curve: c, idx: selectedIdx + 1 + i })),
                  { curve: this.curves[selectedIdx], idx: selectedIdx },
                ]
              : this.curves.map((c, i) => ({ curve: c, idx: i }));
          return svg`<g clip-path="url(#graph-area-${this._uid})">${order.map(({ curve, idx }) => this._renderCurve(curve, idx))}</g>`;
        })()}
        <!-- Scrubber glow filters (only re-render when curves change, not on every position update) -->
        <defs>
          ${this.curves
            .filter((c) => c.visible)
            .map((c) => {
              const id = `scrubber-glow-${c.color.replace('#', '')}-${this._uid}`;
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
                >Select a light to edit its curve</text>`;
          }
          const selected = this.curves.find((c) => c.entityId === this.selectedCurveId);
          return svg`
              <text class="editing-label"
                x="${PAD_LEFT + 6}" y="${PAD_TOP + 14}"
                fill="${selected?.color ?? 'currentColor'}"
                >Editing ${selected?.friendlyName ?? ''}</text>
              <text class="hint" text-anchor="end"
                x="${PAD_LEFT + GRAPH_W - 4}" y="${PAD_TOP + GRAPH_H - 6}"
                >${this._isMobile ? 'Double-tap to add · Long-press to remove' : 'Double-click to add · Right-click to remove'}</text>`;
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
