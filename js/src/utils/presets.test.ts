import { describe, it, expect } from 'vitest';
import { CURVE_PRESETS, presetPolylinePoints, type PresetDef } from './presets.js';

describe('CURVE_PRESETS', () => {
  it('has exactly four presets', () => {
    expect(CURVE_PRESETS).toHaveLength(4);
  });

  it('each preset has required shape', () => {
    for (const preset of CURVE_PRESETS) {
      expect(preset.id).toBeTypeOf('string');
      expect(preset.id.length).toBeGreaterThan(0);
      expect(preset.name).toBeTypeOf('string');
      expect(preset.description).toBeTypeOf('string');
      expect(Array.isArray(preset.controlPoints)).toBe(true);
      expect(preset.controlPoints.length).toBeGreaterThanOrEqual(3);
      for (const cp of preset.controlPoints) {
        expect(cp.lightener).toBeGreaterThanOrEqual(0);
        expect(cp.lightener).toBeLessThanOrEqual(100);
        expect(cp.target).toBeGreaterThanOrEqual(0);
        expect(cp.target).toBeLessThanOrEqual(100);
      }
    }
  });

  it('preset ids are unique', () => {
    const ids = CURVE_PRESETS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every preset starts at lightener=0 and ends at lightener=100', () => {
    for (const preset of CURVE_PRESETS) {
      const first = preset.controlPoints[0];
      const last = preset.controlPoints[preset.controlPoints.length - 1];
      expect(first?.lightener).toBe(0);
      expect(last?.lightener).toBe(100);
    }
  });

  it('control points are monotonic in lightener dimension', () => {
    for (const preset of CURVE_PRESETS) {
      for (let i = 1; i < preset.controlPoints.length; i++) {
        const prev = preset.controlPoints[i - 1]!;
        const curr = preset.controlPoints[i]!;
        expect(curr.lightener).toBeGreaterThan(prev.lightener);
      }
    }
  });

  it('linear preset matches exact values', () => {
    const linear = CURVE_PRESETS.find((p) => p.id === 'linear');
    expect(linear).toBeDefined();
    expect(linear!.controlPoints).toEqual([
      { lightener: 0, target: 0 },
      { lightener: 1, target: 1 },
      { lightener: 100, target: 100 },
    ]);
  });

  it('late_starter preset matches exact values', () => {
    const p = CURVE_PRESETS.find((p) => p.id === 'late_starter');
    expect(p).toBeDefined();
    expect(p!.controlPoints).toEqual([
      { lightener: 0, target: 0 },
      { lightener: 1, target: 1 },
      { lightener: 45, target: 1 },
      { lightener: 70, target: 45 },
      { lightener: 100, target: 100 },
    ]);
  });

  it('night_mode preset matches exact values', () => {
    const p = CURVE_PRESETS.find((p) => p.id === 'night_mode');
    expect(p).toBeDefined();
    expect(p!.controlPoints).toEqual([
      { lightener: 0, target: 0 },
      { lightener: 1, target: 1 },
      { lightener: 20, target: 3 },
      { lightener: 50, target: 10 },
      { lightener: 100, target: 25 },
    ]);
  });

  it('dim_accent preset matches exact values', () => {
    const p = CURVE_PRESETS.find((p) => p.id === 'dim_accent');
    expect(p).toBeDefined();
    expect(p!.controlPoints).toEqual([
      { lightener: 0, target: 0 },
      { lightener: 1, target: 1 },
      { lightener: 25, target: 8 },
      { lightener: 50, target: 20 },
      { lightener: 100, target: 45 },
    ]);
  });
});

describe('presetPolylinePoints', () => {
  it('maps lightener=0,target=0 to bottom-left corner (pad,H-pad)', () => {
    const preset: PresetDef = {
      id: 'test',
      name: 'Test',
      description: '',
      controlPoints: [{ lightener: 0, target: 0 }],
    };
    const out = presetPolylinePoints(preset);
    expect(out).toBe('4.0,36.0');
  });

  it('maps lightener=100,target=100 to top-right (W-pad, pad)', () => {
    const preset: PresetDef = {
      id: 'test',
      name: 'Test',
      description: '',
      controlPoints: [{ lightener: 100, target: 100 }],
    };
    const out = presetPolylinePoints(preset);
    expect(out).toBe('60.0,4.0');
  });

  it('space-separates multiple control points', () => {
    const preset: PresetDef = {
      id: 'test',
      name: 'Test',
      description: '',
      controlPoints: [
        { lightener: 0, target: 0 },
        { lightener: 100, target: 100 },
      ],
    };
    const out = presetPolylinePoints(preset);
    expect(out).toBe('4.0,36.0 60.0,4.0');
  });

  it('renders each real preset to a non-empty polyline string', () => {
    for (const preset of CURVE_PRESETS) {
      const out = presetPolylinePoints(preset);
      expect(out).toMatch(/^\d+\.\d+,\d+\.\d+( \d+\.\d+,\d+\.\d+)+$/);
      const pointCount = out.split(' ').length;
      expect(pointCount).toBe(preset.controlPoints.length);
    }
  });
});
