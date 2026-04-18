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
