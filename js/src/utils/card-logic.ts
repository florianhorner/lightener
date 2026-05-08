/**
 * Pure-function helpers for card-level state management.
 *
 * Extracted from lightener-curve-card.ts so that:
 *   1. The card's private methods compose these helpers instead of inlining
 *      the same logic.
 *   2. card-logic.test.ts exercises real production code, not test-file replicas.
 *
 * Side-effect-free where possible. Caller wires in any `this`-state mutations.
 */

import type { LightCurve, ControlPoint } from './types.js';
import { cloneCurves } from './data.js';

// ── Selection ───────────────────────────────────────────────────────

/**
 * If entityId is already selected, return null (deselect). Otherwise select it.
 */
export function toggleSelection(current: string | null, entityId: string): string | null {
  return current === entityId ? null : entityId;
}

/**
 * A curve is selectable iff it exists in the list and is visible.
 */
export function canSelectCurve(curves: LightCurve[], entityId: string): boolean {
  const curve = curves.find((c) => c.entityId === entityId);
  return curve ? curve.visible : false;
}

// ── Undo stack ──────────────────────────────────────────────────────

/** Maximum number of snapshots retained on the undo stack. Oldest entry drops when exceeded. */
export const UNDO_STACK_MAX = 50;

/**
 * Push a deep-cloned snapshot of `curves` onto `stack` and cap the stack at
 * UNDO_STACK_MAX entries (oldest entry shifted out when over). Mutates `stack`.
 */
export function pushToUndoStack(stack: LightCurve[][], curves: LightCurve[]): void {
  stack.push(cloneCurves(curves));
  if (stack.length > UNDO_STACK_MAX) stack.shift();
}

// ── Point operations ────────────────────────────────────────────────

/**
 * Add a control point to the curve identified by entityId. Returns null if:
 *   - the named curve does not exist, or
 *   - a point already exists at the given lightener value (duplicate x).
 * The original curves array is not mutated; a new array of new objects is returned.
 * Points are sorted by lightener value.
 */
export function addPointToCurves(
  curves: LightCurve[],
  entityId: string,
  lightener: number,
  target: number
): LightCurve[] | null {
  const idx = curves.findIndex((c) => c.entityId === entityId);
  if (idx < 0) return null;
  if (curves[idx].controlPoints.some((cp) => cp.lightener === lightener)) return null;
  const result = [...curves];
  const curve = { ...result[idx] };
  curve.controlPoints = [...curve.controlPoints, { lightener, target }].sort(
    (a, b) => a.lightener - b.lightener
  );
  result[idx] = curve;
  return result;
}

/**
 * Remove a control point from the curve at curveIndex. Returns null if:
 *   - curveIndex is out of range,
 *   - the curve has 2 or fewer points (must keep ≥2), or
 *   - pointIndex is 0 (the origin anchor; defense-in-depth).
 * Original curves not mutated.
 */
export function removePointFromCurves(
  curves: LightCurve[],
  curveIndex: number,
  pointIndex: number
): LightCurve[] | null {
  const curve = curves[curveIndex];
  if (!curve) return null;
  if (curve.controlPoints.length <= 2) return null;
  if (pointIndex === 0) return null;
  const result = [...curves];
  const updated = { ...result[curveIndex] };
  updated.controlPoints = updated.controlPoints.filter((_, i) => i !== pointIndex);
  result[curveIndex] = updated;
  return result;
}

// ── Visibility ──────────────────────────────────────────────────────

/**
 * Flip the `visible` flag on the curve identified by entityId. Other curves unchanged.
 * Returns a new array; original not mutated.
 */
export function toggleCurveVisibility(curves: LightCurve[], entityId: string): LightCurve[] {
  return curves.map((c) => (c.entityId === entityId ? { ...c, visible: !c.visible } : c));
}

// ── Animation interpolation ─────────────────────────────────────────

/**
 * Interpolate between two control-point arrays at parameter `t` (0..1).
 * `t` is the post-easing value; caller is responsible for any easing function.
 * The shared length is min(start.length, end.length); extra points are the
 * caller's concern (typically appended on the final frame).
 */
export function interpolateControlPoints(
  startPts: ControlPoint[],
  endPts: ControlPoint[],
  t: number
): ControlPoint[] {
  const sharedLen = Math.min(startPts.length, endPts.length);
  const pts: ControlPoint[] = [];
  for (let i = 0; i < sharedLen; i++) {
    pts.push({
      lightener: Math.round(
        startPts[i].lightener + (endPts[i].lightener - startPts[i].lightener) * t
      ),
      target: Math.round(startPts[i].target + (endPts[i].target - startPts[i].target) * t),
    });
  }
  return pts;
}

/**
 * Build the final-frame curves at the end of an undo or cancel animation.
 * Restores the control points from `endCurves` while preserving the live
 * `visible` flag from `startCurves` (so the user's hide/show state is not
 * clobbered by the snapshot).
 */
export function mergeFinalAnimationFrame(
  startCurves: LightCurve[],
  endCurves: LightCurve[]
): LightCurve[] {
  return endCurves.map((ec, i) => ({
    ...ec,
    visible: startCurves[i]?.visible ?? ec.visible,
  }));
}

// ── Keyboard focus guard ────────────────────────────────────────────

/**
 * Decide whether a card-level keyboard shortcut handler should fire based on
 * what is currently focused. Returns true when:
 *   - nothing is focused (`focused === null`),
 *   - the card element itself is focused,
 *   - the document body is focused (no specific focus), or
 *   - the focused element is contained within the card.
 * Returns false for any focus that lives outside the card.
 */
export function shouldHandleKey(focused: Element | null, card: Element): boolean {
  if (!focused) return true;
  if (focused === card) return true;
  if (focused === document.body) return true;
  return card.contains(focused);
}
