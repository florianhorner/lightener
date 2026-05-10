import { describe, it, expect } from 'vitest';
import { curvesToWsPayload, wsPayloadToCurves, cloneCurves, curvesEqual } from './data.js';
import { LightCurve } from './types.js';

const COLORS = ['#42a5f5', '#ef5350', '#66bb6a'];

function makeCurve(overrides: Partial<LightCurve> = {}): LightCurve {
  return {
    entityId: 'light.test',
    friendlyName: 'Test Light',
    controlPoints: [
      { lightener: 0, target: 0 },
      { lightener: 50, target: 75 },
      { lightener: 100, target: 100 },
    ],
    visible: true,
    color: '#42a5f5',
    ...overrides,
  };
}

describe('curvesToWsPayload', () => {
  it('converts curves to backend format, stripping 0->0', () => {
    const curves = [makeCurve()];
    const payload = curvesToWsPayload(curves);

    expect(payload['light.test']).toBeDefined();
    expect(payload['light.test'].brightness).toEqual({
      '50': '75',
      '100': '100',
    });
  });

  it('handles multiple curves', () => {
    const curves = [makeCurve({ entityId: 'light.a' }), makeCurve({ entityId: 'light.b' })];
    const payload = curvesToWsPayload(curves);
    expect(Object.keys(payload)).toEqual(['light.a', 'light.b']);
  });

  it('handles curve with only origin point', () => {
    const curves = [makeCurve({ controlPoints: [{ lightener: 0, target: 0 }] })];
    const payload = curvesToWsPayload(curves);
    expect(payload['light.test'].brightness).toEqual({});
  });

  it('preserves a non-zero origin dim floor', () => {
    const curves = [makeCurve({ controlPoints: [{ lightener: 0, target: 12 }] })];
    const payload = curvesToWsPayload(curves);
    expect(payload['light.test'].brightness).toEqual({
      '0': '12',
      '100': '12',
    });
  });

  it('injects explicit 100 key with last_target when curve has no 100', () => {
    const curves = [
      makeCurve({
        controlPoints: [
          { lightener: 0, target: 0 },
          { lightener: 50, target: 40 },
        ],
      }),
    ];
    const payload = curvesToWsPayload(curves);
    expect(payload['light.test'].brightness).toEqual({
      '50': '40',
      '100': '40',
    });
  });

  it('preserves explicit 100 value and does not overwrite it', () => {
    const curves = [
      makeCurve({
        controlPoints: [
          { lightener: 0, target: 0 },
          { lightener: 50, target: 40 },
          { lightener: 100, target: 60 },
        ],
      }),
    ];
    const payload = curvesToWsPayload(curves);
    expect(payload['light.test'].brightness).toEqual({
      '50': '40',
      '100': '60',
    });
  });

  it('does not inject 100 key for origin-only curve', () => {
    const curves = [makeCurve({ controlPoints: [{ lightener: 0, target: 0 }] })];
    const payload = curvesToWsPayload(curves);
    expect(payload['light.test'].brightness).toEqual({});
  });
});

describe('wsPayloadToCurves', () => {
  it('converts backend payload to frontend curves', () => {
    const entities = {
      'light.ceiling': { brightness: { '50': '75', '100': '100' } },
    };
    const states = {
      'light.ceiling': { attributes: { friendly_name: 'Ceiling' } },
    };

    const curves = wsPayloadToCurves(entities, states, COLORS);

    expect(curves).toHaveLength(1);
    expect(curves[0].entityId).toBe('light.ceiling');
    expect(curves[0].friendlyName).toBe('Ceiling');
    expect(curves[0].controlPoints).toEqual([
      { lightener: 0, target: 0 },
      { lightener: 50, target: 75 },
      { lightener: 100, target: 100 },
    ]);
    expect(curves[0].visible).toBe(true);
    expect(curves[0].color).toBe(COLORS[0]);
  });

  it('adds implicit 0->0 origin', () => {
    const entities = {
      'light.a': { brightness: { '100': '50' } },
    };
    const curves = wsPayloadToCurves(entities, {}, COLORS);
    expect(curves[0].controlPoints[0]).toEqual({ lightener: 0, target: 0 });
  });

  it('preserves explicit 0 origin from backend payload', () => {
    const entities = {
      'light.a': { brightness: { '0': '12', '100': '90' } },
    };
    const curves = wsPayloadToCurves(entities, {}, COLORS);
    expect(curves[0].controlPoints).toEqual([
      { lightener: 0, target: 12 },
      { lightener: 100, target: 90 },
    ]);
  });

  it('sorts control points by lightener value', () => {
    const entities = {
      'light.a': { brightness: { '80': '90', '20': '30', '50': '60' } },
    };
    const curves = wsPayloadToCurves(entities, {}, COLORS);
    const lightenerValues = curves[0].controlPoints.map((cp) => cp.lightener);
    expect(lightenerValues).toEqual([0, 20, 50, 80]);
  });

  it('drops non-finite values', () => {
    const entities = {
      'light.a': { brightness: { abc: '50', '50': 'xyz', '80': '90' } },
    };
    const curves = wsPayloadToCurves(entities, {}, COLORS);
    expect(curves[0].controlPoints).toEqual([
      { lightener: 0, target: 0 },
      { lightener: 80, target: 90 },
    ]);
  });

  it('falls back to entity_id for friendly name', () => {
    const entities = { 'light.my_lamp': { brightness: {} } };
    const curves = wsPayloadToCurves(entities, {}, COLORS);
    expect(curves[0].friendlyName).toBe('my_lamp');
  });

  it('cycles colors for multiple entities', () => {
    const entities = {
      'light.a': { brightness: {} },
      'light.b': { brightness: {} },
      'light.c': { brightness: {} },
      'light.d': { brightness: {} },
    };
    const curves = wsPayloadToCurves(entities, {}, COLORS);
    expect(curves[3].color).toBe(COLORS[0]); // wraps around
  });
});

describe('curvesToWsPayload / wsPayloadToCurves round-trip', () => {
  it('round-trips without data loss', () => {
    const original = [
      makeCurve({
        entityId: 'light.ceiling',
        controlPoints: [
          { lightener: 0, target: 0 },
          { lightener: 25, target: 10 },
          { lightener: 50, target: 80 },
          { lightener: 75, target: 90 },
          { lightener: 100, target: 100 },
        ],
      }),
    ];

    const payload = curvesToWsPayload(original);
    const states = {
      'light.ceiling': { attributes: { friendly_name: 'Ceiling' } },
    };
    const restored = wsPayloadToCurves(payload, states, COLORS);

    // Control points should match (round-trip preserves data)
    expect(restored[0].controlPoints).toEqual(original[0].controlPoints);
  });
});

describe('cloneCurves', () => {
  it('creates a deep copy', () => {
    const original = [makeCurve()];
    const cloned = cloneCurves(original);

    // Same values
    expect(cloned).toEqual(original);

    // Different references
    expect(cloned).not.toBe(original);
    expect(cloned[0]).not.toBe(original[0]);
    expect(cloned[0].controlPoints[0]).not.toBe(original[0].controlPoints[0]);

    // Mutation doesn't affect original
    cloned[0].controlPoints[1].target = 999;
    expect(original[0].controlPoints[1].target).toBe(75);
  });
});

describe('curvesEqual', () => {
  it('returns true for identical curves', () => {
    const a = [makeCurve()];
    const b = cloneCurves(a);
    expect(curvesEqual(a, b)).toBe(true);
  });

  it('returns false for different point values', () => {
    const a = [makeCurve()];
    const b = cloneCurves(a);
    b[0].controlPoints[1].target = 99;
    expect(curvesEqual(a, b)).toBe(false);
  });

  it('returns false for different lengths', () => {
    const a = [makeCurve()];
    const b = [makeCurve(), makeCurve({ entityId: 'light.other' })];
    expect(curvesEqual(a, b)).toBe(false);
  });

  it('returns false for different point counts', () => {
    const a = [makeCurve()];
    const b = cloneCurves(a);
    b[0].controlPoints.push({ lightener: 80, target: 90 });
    expect(curvesEqual(a, b)).toBe(false);
  });

  it('ignores visible and color differences', () => {
    const a = [makeCurve({ visible: true, color: '#fff' })];
    const b = [makeCurve({ visible: false, color: '#000' })];
    expect(curvesEqual(a, b)).toBe(true);
  });
});

// ── Group K (Wave 2): round-trip persistence at edges ───────────────
// Encodes plan items K.33 (0/100 round-trip), K.34 (NaN/empty rejection on
// write), K.35 (removal persists, not just visual clear).

describe('Group K — round-trip persistence at edges', () => {
  const hassStates = {
    'light.test': { attributes: { friendly_name: 'Test Light' } },
  };

  it('K.33 control point at exactly 0% and 100% round-trips through save/load identical', () => {
    const original: LightCurve[] = [
      makeCurve({
        controlPoints: [
          { lightener: 0, target: 25 }, // explicit non-zero dim floor
          { lightener: 50, target: 50 },
          { lightener: 100, target: 100 },
        ],
      }),
    ];
    const payload = curvesToWsPayload(original);
    const reloaded = wsPayloadToCurves(payload, hassStates, COLORS);

    // The dim-floor 0% entry must survive the round-trip and the explicit
    // 100% endpoint must not be silently dropped.
    expect(reloaded[0].controlPoints).toEqual([
      { lightener: 0, target: 25 },
      { lightener: 50, target: 50 },
      { lightener: 100, target: 100 },
    ]);
  });

  it('K.34 a curve with a NaN target is rejected on write — not silently coerced to "NaN"', () => {
    const broken: LightCurve[] = [
      makeCurve({
        controlPoints: [
          { lightener: 0, target: 0 },
          { lightener: 50, target: NaN },
          { lightener: 100, target: 100 },
        ],
      }),
    ];

    // Contract: the writer must either throw, return null, or omit the
    // bad entry — but it must NOT serialize "NaN" as a brightness value.
    let payload: ReturnType<typeof curvesToWsPayload> | null = null;
    let threw = false;
    try {
      payload = curvesToWsPayload(broken);
    } catch {
      threw = true;
    }
    if (threw) return;

    const brightness = payload?.['light.test']?.brightness ?? {};
    const values = Object.values(brightness);
    expect(values, 'no brightness value may serialize as the string "NaN"').not.toContain('NaN');
    expect(
      values.every((v) => Number.isFinite(Number(v))),
      'every value must parse to a finite number'
    ).toBe(true);
  });

  it.each<[string, number, number]>([
    ['NaN lightener', NaN, 50],
    ['Infinity lightener', Infinity, 50],
    ['negative lightener', -1, 50],
    ['out-of-range lightener', 150, 50],
    ['NaN target', 50, NaN],
    ['Infinity target', 50, Infinity],
    ['negative target', 50, -5],
    ['out-of-range target', 50, 150],
  ])(
    'K.34 drops bad point (%s) and never serializes the bad axis as a key or value',
    (_label, lightener, target) => {
      const broken: LightCurve[] = [
        makeCurve({
          controlPoints: [
            { lightener: 0, target: 0 },
            { lightener, target },
            { lightener: 100, target: 100 },
          ],
        }),
      ];

      const payload = curvesToWsPayload(broken);
      const brightness = payload['light.test'].brightness;
      const keys = Object.keys(brightness);
      const values = Object.values(brightness);

      // Keys (lightener) must never include "NaN"/"Infinity"/"-1"/"150" etc.
      expect(keys, 'no key may be NaN/Infinity/out-of-range').not.toContain('NaN');
      expect(keys).not.toContain('Infinity');
      for (const k of keys) {
        const n = Number(k);
        expect(Number.isFinite(n) && n >= 0 && n <= 100).toBe(true);
      }

      // Values (target) must never be "NaN"/"Infinity"/out of range.
      expect(values).not.toContain('NaN');
      expect(values).not.toContain('Infinity');
      for (const v of values) {
        const n = Number(v);
        expect(Number.isFinite(n) && n >= 0 && n <= 100).toBe(true);
      }
    }
  );

  it('K.35 removing a control point persists as a deletion, not just a visual clear', () => {
    const before: LightCurve[] = [
      makeCurve({
        controlPoints: [
          { lightener: 0, target: 0 },
          { lightener: 50, target: 50 },
          { lightener: 100, target: 100 },
        ],
      }),
    ];
    const beforePayload = curvesToWsPayload(before);
    expect(beforePayload['light.test'].brightness).toHaveProperty('50');

    // Simulate the user removing the (50, 50) interior point.
    const after = cloneCurves(before);
    after[0].controlPoints = after[0].controlPoints.filter((p) => p.lightener !== 50);
    const afterPayload = curvesToWsPayload(after);

    expect(
      afterPayload['light.test'].brightness,
      'removed point must NOT remain in the payload'
    ).not.toHaveProperty('50');
    // And the surviving endpoints must still be there.
    expect(afterPayload['light.test'].brightness).toHaveProperty('100');

    // Round-trip the after-state: reload and verify the removed point is
    // truly gone (not re-derived from a stale cache).
    const reloaded = wsPayloadToCurves(afterPayload, hassStates, COLORS);
    const lighteners = reloaded[0].controlPoints.map((p) => p.lightener);
    expect(lighteners).not.toContain(50);
  });
});
