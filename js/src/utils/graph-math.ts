/**
 * Pure math/geometry helpers for the curve graph.
 * Extracted so they can be unit-tested without a DOM.
 */

import { ControlPoint } from './types.js';
import { prepareBrightnessConfig } from './interpolation.js';

// Graph coordinate system: SVG viewBox with padding for axis labels.
export const PAD_LEFT = 44;
export const PAD_RIGHT = 12;
export const PAD_TOP = 12;
export const PAD_BOTTOM = 36;
export const GRAPH_W = 300;
export const GRAPH_H = 200;
export const VB_W = PAD_LEFT + GRAPH_W + PAD_RIGHT;
export const VB_H = PAD_TOP + GRAPH_H + PAD_BOTTOM;

export function toSvgX(pct: number): number {
  return PAD_LEFT + (pct / 100) * GRAPH_W;
}

export function toSvgY(pct: number): number {
  // Invert Y so 0% is at bottom, 100% at top
  return PAD_TOP + (1 - pct / 100) * GRAPH_H;
}

export function fromSvgX(svgX: number): number {
  return ((svgX - PAD_LEFT) / GRAPH_W) * 100;
}

export function fromSvgY(svgY: number): number {
  return (1 - (svgY - PAD_TOP) / GRAPH_H) * 100;
}

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/**
 * Compute monotone cubic tangents for a set of sorted points.
 * Shared by both the SVG path builder and the curve sampler.
 */
export function computeMonotoneTangents(points: { x: number; y: number }[]): {
  dx: number[];
  tangents: number[];
} {
  const n = points.length;
  const dx: number[] = [];
  const dy: number[] = [];
  const m: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx.push(points[i + 1].x - points[i].x);
    dy.push(points[i + 1].y - points[i].y);
    m.push(dy[i] / (dx[i] || 1));
  }
  const tangents: number[] = new Array(n);
  tangents[0] = m[0];
  tangents[n - 1] = m[n - 2];
  for (let i = 1; i < n - 1; i++) {
    tangents[i] = (m[i - 1] + m[i]) / 2;
  }
  return { dx, tangents };
}

/**
 * Sample the smooth monotone cubic curve at a given x value.
 * Uses the same interpolation as buildSmoothPath so dots sit exactly on the curve.
 */
export function sampleSmoothCurveAt(points: { x: number; y: number }[], targetX: number): number {
  if (points.length < 2) return 0;
  if (points.length === 2) {
    // Linear
    const [p0, p1] = points;
    const segDx = p1.x - p0.x;
    if (segDx === 0) return p0.y;
    const t = (targetX - p0.x) / segDx;
    return p0.y + t * (p1.y - p0.y);
  }

  const { dx, tangents } = computeMonotoneTangents(points);

  // Find which segment targetX falls in
  let seg = 0;
  for (let i = 0; i < points.length - 1; i++) {
    if (targetX <= points[i + 1].x) {
      seg = i;
      break;
    }
    seg = i;
  }

  const segDx = dx[seg] || 1;
  const t = clamp((targetX - points[seg].x) / segDx, 0, 1);

  // Evaluate cubic Hermite: same bezier as the SVG C command
  const segLen = segDx / 3;
  const p0y = points[seg].y;
  const p1y = points[seg].y + tangents[seg] * segLen;
  const p2y = points[seg + 1].y - tangents[seg + 1] * segLen;
  const p3y = points[seg + 1].y;

  // De Casteljau / cubic bezier evaluation
  const mt = 1 - t;
  return mt * mt * mt * p0y + 3 * mt * mt * t * p1y + 3 * mt * t * t * p2y + t * t * t * p3y;
}

/**
 * Convenience: prepare control points and sample the smooth curve at a position.
 * Used by both the graph scrubber dots and the scrubber badge values.
 */
export function sampleCurveAt(controlPoints: ControlPoint[], position: number): number {
  const prepared = prepareBrightnessConfig(controlPoints);
  const pathPoints = prepared.map((cp) => ({ x: cp.lightener, y: cp.target }));
  return sampleSmoothCurveAt(pathPoints, position);
}

/** Colorblind-safe curve palette — shared between card and tests. */
export const CURVE_COLORS = [
  '#42a5f5',
  '#ef5350',
  '#5c6bc0',
  '#ffa726',
  '#ab47bc',
  '#1565c0',
  '#ec407a',
  '#8d6e63',
  '#ffca28',
  '#7e57c2',
];

/**
 * Build a smooth SVG cubic-bezier path through control points.
 * Uses monotone cubic interpolation to avoid overshoot.
 */
export function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';
  if (points.length === 2) {
    return `M${points[0].x},${points[0].y} L${points[1].x},${points[1].y}`;
  }

  const { dx, tangents } = computeMonotoneTangents(points);

  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const seg = dx[i] / 3;
    const cp1x = points[i].x + seg;
    const cp1y = points[i].y + tangents[i] * seg;
    const cp2x = points[i + 1].x - seg;
    const cp2y = points[i + 1].y - tangents[i + 1] * seg;
    d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${points[i + 1].x},${points[i + 1].y}`;
  }
  return d;
}

/** Colorblind-safe dash patterns — cycle through 5 patterns per curve index. */
export const DASH_PATTERNS = ['', '8 4', '4 4', '12 4 4 4', '2 4'] as const;

/** Shape variants for legend markers — cycle through 5 shapes per curve index. */
export const LEGEND_SHAPES = ['circle', 'square', 'diamond', 'triangle', 'bar'] as const;

/** easeOutCubic: fast start, gentle deceleration. */
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}
