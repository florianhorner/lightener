import { addPointToCurves, pushToUndoStack, removePointFromCurves } from './card-logic.js';
import type { LightCurve } from './types.js';

export function pushEditUndo(stack: LightCurve[][], curves: LightCurve[]): void {
  pushToUndoStack(stack, curves);
}

export function applyPresetToCurves(
  curves: LightCurve[],
  selectedCurveId: string | null,
  controlPoints: LightCurve['controlPoints']
): LightCurve[] {
  // Clone the points PER curve. A shared array reference would alias every
  // curve's controlPoints, so a later in-place edit of one curve would leak
  // into all of them.
  const clonePoints = (): LightCurve['controlPoints'] => controlPoints.map((cp) => ({ ...cp }));
  if (selectedCurveId !== null) {
    return curves.map((curve) =>
      curve.entityId === selectedCurveId ? { ...curve, controlPoints: clonePoints() } : curve
    );
  }
  return curves.map((curve) => ({ ...curve, controlPoints: clonePoints() }));
}

export function movePointOnCurves(
  curves: LightCurve[],
  curveIndex: number,
  pointIndex: number,
  lightener: number,
  target: number
): LightCurve[] | null {
  const next = [...curves];
  const curve = next[curveIndex];
  if (!curve || !curve.controlPoints[pointIndex]) return null;
  const nextCurve = { ...curve };
  const points = [...nextCurve.controlPoints];
  points[pointIndex] = { lightener, target };
  nextCurve.controlPoints = points;
  next[curveIndex] = nextCurve;
  return next;
}

export function addPointEdit(
  curves: LightCurve[],
  entityId: string,
  lightener: number,
  target: number
): LightCurve[] | null {
  return addPointToCurves(curves, entityId, lightener, target);
}

export function removePointEdit(
  curves: LightCurve[],
  curveIndex: number,
  pointIndex: number
): LightCurve[] | null {
  return removePointFromCurves(curves, curveIndex, pointIndex);
}
