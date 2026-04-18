import { ControlPoint, LightCurve } from './types.js';

/**
 * Convert frontend LightCurve[] to the backend WebSocket payload format.
 * Filters the implicit 0->0 endpoint and converts numbers to strings.
 */
export function curvesToWsPayload(
  curves: LightCurve[]
): Record<string, { brightness: Record<string, string> }> {
  const result: Record<string, { brightness: Record<string, string> }> = {};
  for (const curve of curves) {
    const brightness: Record<string, string> = {};
    let lastLightener = -1;
    let lastTarget = 0;
    for (const cp of curve.controlPoints) {
      // The implicit 0->0 point is not stored in config
      if (cp.lightener === 0) continue;
      brightness[String(cp.lightener)] = String(cp.target);
      if (cp.lightener > lastLightener) {
        lastLightener = cp.lightener;
        lastTarget = cp.target;
      }
    }
    // Ensure UI-saved configs always carry an explicit 100 key so the
    // backend's implicit (255, 255) fallback never triggers for them.
    // Preserves flatten-at-last-target intent when the user removed the
    // endpoint, without changing backend behavior for legacy YAML that
    // omits the 100 key.
    if (!('100' in brightness) && lastLightener >= 0) {
      brightness['100'] = String(lastTarget);
    }
    result[curve.entityId] = { brightness };
  }
  return result;
}

/**
 * Convert the backend WebSocket response into frontend LightCurve[].
 * Parses string keys/values to numbers and adds the implicit 0->0 endpoint.
 */
export function wsPayloadToCurves(
  entities: Record<string, { brightness: Record<string, string> }>,
  hassStates: Record<string, { attributes: { friendly_name?: string } }>,
  colors: string[]
): LightCurve[] {
  const entityIds = Object.keys(entities);
  return entityIds.map((entityId, index) => {
    const brightnessMap = entities[entityId]?.brightness ?? {};
    const controlPoints: ControlPoint[] = [{ lightener: 0, target: 0 }];

    for (const [k, v] of Object.entries(brightnessMap)) {
      const lightener = Number(k);
      const target = Number(v);
      // Drop points with non-finite values (malformed config data)
      if (!Number.isFinite(lightener) || !Number.isFinite(target)) continue;
      controlPoints.push({ lightener, target });
    }

    controlPoints.sort((a, b) => a.lightener - b.lightener);

    const friendlyName =
      hassStates[entityId]?.attributes?.friendly_name ?? entityId.replace('light.', '');

    return {
      entityId,
      friendlyName,
      controlPoints,
      visible: true,
      color: colors[index % colors.length],
    };
  });
}

/** Deep-clone an array of LightCurves (for dirty-state tracking). */
export function cloneCurves(curves: LightCurve[]): LightCurve[] {
  return curves.map((c) => ({
    ...c,
    controlPoints: c.controlPoints.map((cp) => ({ ...cp })),
  }));
}

/**
 * Compare two LightCurve arrays by control points only (for dirty check).
 * Intentionally ignores `visible` and `color` — those are local display
 * state, not persisted to the backend.
 */
export function curvesEqual(a: LightCurve[], b: LightCurve[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const aCp = a[i].controlPoints;
    const bCp = b[i].controlPoints;
    if (aCp.length !== bCp.length) return false;
    for (let j = 0; j < aCp.length; j++) {
      if (aCp[j].lightener !== bCp[j].lightener) return false;
      if (aCp[j].target !== bCp[j].target) return false;
    }
  }
  return true;
}
