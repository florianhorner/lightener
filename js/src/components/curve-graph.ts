import { LitElement, html, css, svg, nothing, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { LightCurve, ControlPoint } from "../utils/types.js";
import { interpolateCurve } from "../utils/interpolation.js";

// Graph coordinate system: SVG viewBox with padding for axis labels.
const PAD_LEFT = 44;
const PAD_RIGHT = 12;
const PAD_TOP = 12;
const PAD_BOTTOM = 36;
const GRAPH_W = 300;
const GRAPH_H = 200;
const VB_W = PAD_LEFT + GRAPH_W + PAD_RIGHT;
const VB_H = PAD_TOP + GRAPH_H + PAD_BOTTOM;

function toSvgX(pct: number): number {
  return PAD_LEFT + (pct / 100) * GRAPH_W;
}

function toSvgY(pct: number): number {
  // Invert Y so 0% is at bottom, 100% at top
  return PAD_TOP + (1 - pct / 100) * GRAPH_H;
}

function fromSvgX(svgX: number): number {
  return ((svgX - PAD_LEFT) / GRAPH_W) * 100;
}

function fromSvgY(svgY: number): number {
  return (1 - (svgY - PAD_TOP) / GRAPH_H) * 100;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

@customElement("curve-graph")
export class CurveGraph extends LitElement {
  @property({ type: Array }) curves: LightCurve[] = [];
  @property({ type: String }) selectedCurveId: string | null = null;
  @property({ type: Boolean }) readOnly = false;

  @state() private _dragCurveIdx = -1;
  @state() private _dragPointIdx = -1;
  @state() private _hoveredPoint: { curve: number; point: number } | null =
    null;

  private _wasDragging = false;

  static styles = css`
    :host {
      display: block;
    }
    svg {
      width: 100%;
      height: auto;
      display: block;
      border-radius: 8px;
      background: var(--graph-bg, #252525);
      border: 1px solid var(--divider-color, transparent);
    }
    .grid-line {
      stroke: var(--secondary-text, #9e9e9e);
      stroke-width: 0.5;
      opacity: 0.15;
    }
    .axis-line {
      stroke: var(--secondary-text, #9e9e9e);
      stroke-width: 0.75;
      opacity: 0.4;
    }
    .axis-label {
      fill: var(--secondary-text, #9e9e9e);
      font-size: 9px;
      font-family: inherit;
    }
    .tick-label {
      fill: var(--secondary-text, #9e9e9e);
      font-size: 7.5px;
      font-family: inherit;
    }
    .curve-line {
      fill: none;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
      transition: opacity 0.3s ease;
    }
    .control-point {
      cursor: grab;
      transition: r 0.15s ease, filter 0.15s ease;
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
      fill: var(--secondary-text, #9e9e9e);
      font-size: 7px;
      font-family: inherit;
      opacity: 0.6;
    }
    .diagonal-ref {
      stroke: var(--secondary-text, #9e9e9e);
      stroke-width: 0.75;
      opacity: 0.12;
      stroke-dasharray: 4 3;
    }
    .crosshair {
      stroke-width: 0.75;
      stroke-dasharray: 3 3;
    }
    .tooltip-bg {
      fill: rgba(0, 0, 0, 0.7);
      rx: 3;
      ry: 3;
    }
    .tooltip-text {
      fill: #ffffff;
      font-size: 9.5px;
      font-family: inherit;
    }
  `;

  private _svgRef: SVGSVGElement | null = null;

  private _getSvgCoords(e: PointerEvent): { x: number; y: number } | null {
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

  private _onPointerDown(
    e: PointerEvent,
    curveIdx: number,
    pointIdx: number
  ): void {
    if (!this._isCurveInteractive(curveIdx)) return;

    // The origin anchor (index 0) is not draggable
    if (pointIdx === 0) return;

    e.preventDefault();
    // Capture on the SVG so move/up events fire on the SVG, not the circle
    this._svgRef?.setPointerCapture(e.pointerId);
    this._dragCurveIdx = curveIdx;
    this._dragPointIdx = pointIdx;
  }

  private _onPointerMove(e: PointerEvent): void {
    if (this._dragCurveIdx < 0) return;
    e.preventDefault();
    const coords = this._getSvgCoords(e);
    if (!coords) return;

    const x = Math.round(clamp(coords.x, 1, 100));
    const y = Math.round(clamp(coords.y, 0, 100));

    this.dispatchEvent(
      new CustomEvent("point-move", {
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
    if (this._dragCurveIdx < 0) return;
    e.preventDefault();

    this.dispatchEvent(
      new CustomEvent("point-drop", {
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

  private _onPointContextMenu(
    e: MouseEvent,
    curveIdx: number,
    pointIdx: number
  ): void {
    e.preventDefault();
    if (this.readOnly) return;
    if (!this._isCurveInteractive(curveIdx)) return;
    // Cannot remove the origin anchor (index 0)
    if (pointIdx === 0) return;

    this.dispatchEvent(
      new CustomEvent("point-remove", {
        detail: { curveIndex: curveIdx, pointIndex: pointIdx },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _onDblClick(e: MouseEvent): void {
    if (this.readOnly) return;
    if (this._wasDragging) return;

    // Convert dblclick to SVG coords
    const svgEl = this._svgRef;
    if (!svgEl) return;
    const ctm = svgEl.getScreenCTM();
    if (!ctm) return;
    const inv = ctm.inverse();
    const pt = svgEl.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgPt = pt.matrixTransform(inv);
    const x = Math.round(clamp(fromSvgX(svgPt.x), 1, 100));
    const y = Math.round(clamp(fromSvgY(svgPt.y), 0, 100));

    this.dispatchEvent(
      new CustomEvent("point-add", {
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
          x="${toSvgX(t)}" y="${VB_H - PAD_BOTTOM + 16}">${t}</text>
        <!-- Y tick labels -->
        <text class="tick-label" text-anchor="end" dominant-baseline="middle"
          x="${PAD_LEFT - 6}" y="${toSvgY(t)}">${t}</text>
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
        x="${PAD_LEFT + GRAPH_W / 2}" y="${VB_H - 4}">Lightener %</text>
      <text class="axis-label" text-anchor="middle"
        transform="rotate(-90, 10, ${PAD_TOP + GRAPH_H / 2})"
        x="10" y="${PAD_TOP + GRAPH_H / 2}">Light %</text>
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

  private _renderCurve(curve: LightCurve, curveIdx: number) {
    if (!curve.visible || !curve.controlPoints.length) return nothing;

    const isSelected = this.selectedCurveId === null ||
      curve.entityId === this.selectedCurveId;
    const showPoints = isSelected && !this.readOnly;

    const values = interpolateCurve(curve.controlPoints);
    // Build polyline points, sampling every 1%
    const points = values
      .map((v, i) => `${toSvgX(i)},${toSvgY(v)}`)
      .join(" ");

    const isDraggingThisCurve = this._dragCurveIdx === curveIdx;
    const fillColor = curve.color + "33"; // 20% opacity version
    const lineOpacity = isSelected ? 1 : 0.35;

    // Find hovered or dragged point for tooltip
    let tooltipPoint: ControlPoint | null = null;
    if (isDraggingThisCurve && this._dragPointIdx >= 0) {
      tooltipPoint = curve.controlPoints[this._dragPointIdx];
    } else if (
      this._hoveredPoint?.curve === curveIdx &&
      showPoints
    ) {
      tooltipPoint = curve.controlPoints[this._hoveredPoint.point];
    }

    return svg`
      ${isDraggingThisCurve ? this._renderCrossHair(curve) : nothing}
      <polyline
        class="curve-line"
        points="${points}"
        stroke="${curve.color}"
        style="opacity: ${lineOpacity}"
      />
      ${showPoints
        ? curve.controlPoints.map((cp, pi) => {
            const isFixed = cp.lightener === 0;
            const isActive = isDraggingThisCurve && this._dragPointIdx === pi;
            const isHovered =
              this._hoveredPoint?.curve === curveIdx &&
              this._hoveredPoint?.point === pi;
            return svg`
              <circle
                class="control-point ${isFixed ? "fixed" : ""} ${
              isActive ? "dragging" : ""
            } ${isHovered ? "hovered" : ""}"
                cx="${toSvgX(cp.lightener)}"
                cy="${toSvgY(cp.target)}"
                r="6"
                fill="${fillColor}"
                stroke="${curve.color}"
                stroke-width="2"
                style="--glow-color: ${curve.color}"
                @pointerdown=${(e: PointerEvent) =>
                  this._onPointerDown(e, curveIdx, pi)}
                @contextmenu=${(e: MouseEvent) =>
                  this._onPointContextMenu(e, curveIdx, pi)}
                @pointerenter=${() =>
                  (this._hoveredPoint = { curve: curveIdx, point: pi })}
                @pointerleave=${() => (this._hoveredPoint = null)}
              />
            `;
          })
        : nothing}
      ${tooltipPoint !== null
        ? this._renderTooltip(curve, tooltipPoint)
        : nothing}
    `;
  }

  protected firstUpdated(_changedProperties: PropertyValues): void {
    this._svgRef = this.renderRoot.querySelector("svg");
  }

  render() {
    return html`
      <svg
        viewBox="0 0 ${VB_W} ${VB_H}"
        preserveAspectRatio="xMidYMid meet"
        @pointermove=${this._onPointerMove}
        @pointerup=${this._onPointerUp}
        @dblclick=${this._onDblClick}
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

        ${this.curves.map((c, i) => this._renderCurve(c, i))}

        ${!this.readOnly && this.selectedCurveId !== null
          ? svg`<text class="hint" text-anchor="end"
              x="${PAD_LEFT + GRAPH_W}" y="${PAD_TOP + GRAPH_H + 28}"
              >Double-click to add · Right-click to remove</text>`
          : nothing}
      </svg>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "curve-graph": CurveGraph;
  }
}
