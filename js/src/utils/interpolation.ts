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

  // Implicit zero endpoint
  map.set(0, 0);

  for (const cp of controlPoints) {
    map.set(cp.lightener, cp.target);
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

/**
 * Returns an array of 101 values (index 0-100) where each index
 * represents a lightener percentage and the value is the interpolated
 * target brightness at that level.
 */
export function interpolateCurve(controlPoints: ControlPoint[]): number[] {
  const prepared = prepareBrightnessConfig(controlPoints);
  const result = new Array<number>(101).fill(0);

  for (let seg = 1; seg < prepared.length; seg++) {
    const start = prepared[seg - 1];
    const end = prepared[seg];

    for (let i = start.lightener + 1; i <= end.lightener; i++) {
      result[i] = scaleRangedValue([start.lightener, end.lightener], [start.target, end.target], i);
    }
  }

  return result;
}
