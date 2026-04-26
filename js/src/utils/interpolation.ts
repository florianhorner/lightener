import { ControlPoint } from './types.js';

/**
 * Linear interpolation from one range to another.
 * Mirrors the Python `scale_ranged_value_to_int_range`.
 */
export function scaleRangedValue(
  sourceRange: [number, number],
  targetRange: [number, number],
  value: number
): number {
  const [a, b] = sourceRange;
  const [c, d] = targetRange;
  if (a === b) return c;
  return c + ((value - a) * (d - c)) / (b - a);
}

/**
 * Prepare control points for interpolation:
 * - Always include the implicit 0 -> 0 endpoint
 * - If 100 is missing, flatten at the last configured target so live
 *   preview matches the saved behavior (curvesToWsPayload writes an
 *   explicit (100, last_target) key on save)
 * - Sort by lightener value ascending
 */
export function prepareBrightnessConfig(controlPoints: ControlPoint[]): ControlPoint[] {
  const map = new Map<number, number>();
  let originDimFloor: number | null = null;

  // Implicit zero endpoint
  map.set(0, 0);

  for (const cp of controlPoints) {
    if (cp.lightener === 0 && cp.target !== 0) {
      originDimFloor = cp.target;
      continue;
    }
    map.set(cp.lightener, cp.target);
  }

  if (originDimFloor !== null && !map.has(1)) {
    map.set(1, originDimFloor);
  }

  if (!map.has(100)) {
    let lastLightener = -1;
    let lastTarget = 100;
    for (const [lightener, target] of map) {
      if (lightener !== 0 && lightener > lastLightener) {
        lastLightener = lightener;
        lastTarget = target;
      }
    }
    map.set(100, lastTarget);
  }

  const result: ControlPoint[] = [];
  for (const [lightener, target] of map) {
    result.push({ lightener, target });
  }

  result.sort((a, b) => a.lightener - b.lightener);
  return result;
}

function samplePreparedCurve(controlPoints: ControlPoint[], position: number): number {
  if (controlPoints.length === 0) return 0;

  const clamped = Math.max(0, Math.min(100, position));
  if (clamped <= controlPoints[0].lightener) {
    return controlPoints[0].target;
  }

  for (let seg = 1; seg < controlPoints.length; seg++) {
    const start = controlPoints[seg - 1];
    const end = controlPoints[seg];

    if (clamped === end.lightener) {
      return end.target;
    }

    if (clamped < end.lightener) {
      return scaleRangedValue(
        [start.lightener, end.lightener],
        [start.target, end.target],
        clamped
      );
    }
  }

  return controlPoints[controlPoints.length - 1].target;
}

export function sampleInterpolatedCurve(controlPoints: ControlPoint[], position: number): number {
  return samplePreparedCurve(prepareBrightnessConfig(controlPoints), position);
}

/**
 * Returns an array of 101 values (index 0-100) where each index
 * represents a lightener percentage and the value is the interpolated
 * target brightness at that level.
 */
export function interpolateCurve(controlPoints: ControlPoint[]): number[] {
  const prepared = prepareBrightnessConfig(controlPoints);
  const result = new Array<number>(101);

  for (let i = 0; i <= 100; i++) {
    result[i] = samplePreparedCurve(prepared, i);
  }

  return result;
}
