import { describe, it, expect } from 'vitest';
import {
  PAD_LEFT,
  PAD_RIGHT,
  PAD_TOP,
  PAD_BOTTOM,
  GRAPH_W,
  GRAPH_H,
  VB_W,
  VB_H,
  toSvgX,
  toSvgY,
  fromSvgX,
  fromSvgY,
  clamp,
  computeMonotoneTangents,
  sampleSmoothCurveAt,
  buildSmoothPath,
  buildLinearPath,
  DASH_PATTERNS,
  LEGEND_SHAPES,
  easeOutCubic,
} from './graph-math.js';

// ── Layout constants ──────────────────────────────────────────────

describe('layout constants', () => {
  it('viewBox width equals left pad + graph width + right pad', () => {
    expect(VB_W).toBe(PAD_LEFT + GRAPH_W + PAD_RIGHT);
  });

  it('viewBox height equals top pad + graph height + bottom pad', () => {
    expect(VB_H).toBe(PAD_TOP + GRAPH_H + PAD_BOTTOM);
  });
});

// ── Coordinate transforms ─────────────────────────────────────────

describe('toSvgX / fromSvgX round-trip', () => {
  it('0% maps to PAD_LEFT', () => {
    expect(toSvgX(0)).toBe(PAD_LEFT);
  });

  it('100% maps to PAD_LEFT + GRAPH_W', () => {
    expect(toSvgX(100)).toBe(PAD_LEFT + GRAPH_W);
  });

  it('50% maps to midpoint', () => {
    expect(toSvgX(50)).toBe(PAD_LEFT + GRAPH_W / 2);
  });

  it('round-trips through fromSvgX', () => {
    for (const pct of [0, 25, 50, 75, 100]) {
      expect(fromSvgX(toSvgX(pct))).toBeCloseTo(pct, 10);
    }
  });
});

describe('toSvgY / fromSvgY round-trip', () => {
  it('0% maps to bottom (PAD_TOP + GRAPH_H)', () => {
    expect(toSvgY(0)).toBe(PAD_TOP + GRAPH_H);
  });

  it('100% maps to top (PAD_TOP)', () => {
    expect(toSvgY(100)).toBe(PAD_TOP);
  });

  it('Y axis is inverted (higher % = lower SVG Y)', () => {
    expect(toSvgY(75)).toBeLessThan(toSvgY(25));
  });

  it('round-trips through fromSvgY', () => {
    for (const pct of [0, 25, 50, 75, 100]) {
      expect(fromSvgY(toSvgY(pct))).toBeCloseTo(pct, 10);
    }
  });
});

// ── clamp ─────────────────────────────────────────────────────────

describe('clamp', () => {
  it('returns value when within range', () => {
    expect(clamp(50, 0, 100)).toBe(50);
  });

  it('clamps below minimum', () => {
    expect(clamp(-10, 0, 100)).toBe(0);
  });

  it('clamps above maximum', () => {
    expect(clamp(150, 0, 100)).toBe(100);
  });

  it('handles min === max', () => {
    expect(clamp(50, 42, 42)).toBe(42);
  });

  it('handles exact boundary values', () => {
    expect(clamp(0, 0, 100)).toBe(0);
    expect(clamp(100, 0, 100)).toBe(100);
  });
});

// ── computeMonotoneTangents ───────────────────────────────────────

describe('computeMonotoneTangents', () => {
  it('returns dx and tangents arrays of correct length', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 50, y: 50 },
      { x: 100, y: 100 },
    ];
    const { dx, tangents } = computeMonotoneTangents(points);
    expect(dx).toHaveLength(2); // n-1 segments
    expect(tangents).toHaveLength(3); // n tangents
  });

  it('linear points produce constant tangent slope', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 50, y: 50 },
      { x: 100, y: 100 },
    ];
    const { tangents } = computeMonotoneTangents(points);
    // All slopes should be 1.0 for y=x line
    for (const t of tangents) {
      expect(t).toBeCloseTo(1, 10);
    }
  });

  it('endpoint tangents equal first/last segment slope', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 50, y: 100 },
      { x: 100, y: 100 },
    ];
    const { tangents } = computeMonotoneTangents(points);
    // First tangent = slope of first segment = (100-0)/(50-0) = 2
    expect(tangents[0]).toBeCloseTo(2, 10);
    // Last tangent = slope of last segment = (100-100)/(100-50) = 0
    expect(tangents[2]).toBeCloseTo(0, 10);
  });

  it('zeros the interior tangent when a steep ramp hits a flat segment', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 50, y: 100 },
      { x: 100, y: 100 },
    ];
    const { tangents } = computeMonotoneTangents(points);
    expect(tangents[1]).toBeCloseTo(0, 10);
  });

  it('handles two points', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 100, y: 50 },
    ];
    const { dx, tangents } = computeMonotoneTangents(points);
    expect(dx).toHaveLength(1);
    expect(tangents).toHaveLength(2);
    expect(tangents[0]).toBeCloseTo(0.5, 10);
    expect(tangents[1]).toBeCloseTo(0.5, 10);
  });

  it('handles zero-width segment (dx=0) without NaN', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 0, y: 50 },
      { x: 100, y: 100 },
    ];
    const { tangents } = computeMonotoneTangents(points);
    for (const t of tangents) {
      expect(Number.isFinite(t)).toBe(true);
    }
  });
});

// ── sampleSmoothCurveAt ───────────────────────────────────────────

describe('sampleSmoothCurveAt', () => {
  it('returns 0 for fewer than 2 points', () => {
    expect(sampleSmoothCurveAt([], 50)).toBe(0);
    expect(sampleSmoothCurveAt([{ x: 0, y: 42 }], 50)).toBe(0);
  });

  it('linearly interpolates 2 points', () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 100, y: 100 },
    ];
    expect(sampleSmoothCurveAt(pts, 0)).toBeCloseTo(0, 5);
    expect(sampleSmoothCurveAt(pts, 50)).toBeCloseTo(50, 5);
    expect(sampleSmoothCurveAt(pts, 100)).toBeCloseTo(100, 5);
  });

  it('returns p0.y when two points have same x', () => {
    const pts = [
      { x: 50, y: 10 },
      { x: 50, y: 90 },
    ];
    expect(sampleSmoothCurveAt(pts, 50)).toBe(10);
  });

  it('passes through endpoint values for 3+ points', () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 50, y: 80 },
      { x: 100, y: 100 },
    ];
    expect(sampleSmoothCurveAt(pts, 0)).toBeCloseTo(0, 5);
    expect(sampleSmoothCurveAt(pts, 100)).toBeCloseTo(100, 5);
  });

  it('passes through interior control points', () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 50, y: 80 },
      { x: 100, y: 100 },
    ];
    expect(sampleSmoothCurveAt(pts, 50)).toBeCloseTo(80, 5);
  });

  it('identity curve (y=x) samples correctly', () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 25, y: 25 },
      { x: 50, y: 50 },
      { x: 75, y: 75 },
      { x: 100, y: 100 },
    ];
    for (let i = 0; i <= 100; i += 10) {
      expect(sampleSmoothCurveAt(pts, i)).toBeCloseTo(i, 0);
    }
  });

  it('flat curve returns constant', () => {
    const pts = [
      { x: 0, y: 50 },
      { x: 50, y: 50 },
      { x: 100, y: 50 },
    ];
    for (let i = 0; i <= 100; i += 10) {
      expect(sampleSmoothCurveAt(pts, i)).toBeCloseTo(50, 5);
    }
  });

  it('monotonically increasing input stays non-decreasing', () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 30, y: 60 },
      { x: 70, y: 80 },
      { x: 100, y: 100 },
    ];
    let prev = -Infinity;
    for (let i = 0; i <= 100; i++) {
      const v = sampleSmoothCurveAt(pts, i);
      expect(v).toBeGreaterThanOrEqual(prev - 1e-9);
      prev = v;
    }
  });

  it('steep ramp followed by flat never overshoots above the flat segment', () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 10, y: 100 },
      { x: 100, y: 100 },
    ];
    for (let i = 10; i <= 100; i++) {
      expect(sampleSmoothCurveAt(pts, i)).toBeLessThanOrEqual(100 + 1e-9);
    }
  });

  it('keeps a flat interior region flat', () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 40, y: 50 },
      { x: 60, y: 50 },
      { x: 100, y: 100 },
    ];
    for (let i = 40; i <= 60; i++) {
      expect(sampleSmoothCurveAt(pts, i)).toBeCloseTo(50, 5);
    }
  });
});

// ── buildSmoothPath ───────────────────────────────────────────────

describe('buildSmoothPath', () => {
  it('returns empty string for 0 or 1 points', () => {
    expect(buildSmoothPath([])).toBe('');
    expect(buildSmoothPath([{ x: 10, y: 20 }])).toBe('');
  });

  it('returns M…L… for exactly 2 points', () => {
    const path = buildSmoothPath([
      { x: 0, y: 100 },
      { x: 300, y: 0 },
    ]);
    expect(path).toBe('M0,100 L300,0');
  });

  it('returns M…C… for 3+ points', () => {
    const path = buildSmoothPath([
      { x: 0, y: 200 },
      { x: 150, y: 100 },
      { x: 300, y: 200 },
    ]);
    expect(path).toMatch(/^M0,200 C/);
    // Should end at the last point
    expect(path).toContain('300,200');
  });

  it('contains correct number of C commands', () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 25, y: 50 },
      { x: 75, y: 80 },
      { x: 100, y: 100 },
    ];
    const path = buildSmoothPath(pts);
    const cCount = (path.match(/ C/g) || []).length;
    expect(cCount).toBe(pts.length - 1); // one C per segment
  });

  it('starts with M at first point', () => {
    const path = buildSmoothPath([
      { x: 44, y: 212 },
      { x: 194, y: 112 },
      { x: 344, y: 12 },
    ]);
    expect(path).toMatch(/^M44,212/);
  });
});

describe('buildLinearPath', () => {
  it('returns empty string for 0 or 1 points', () => {
    expect(buildLinearPath([])).toBe('');
    expect(buildLinearPath([{ x: 10, y: 20 }])).toBe('');
  });

  it('returns M…L… for exactly 2 points', () => {
    const path = buildLinearPath([
      { x: 0, y: 100 },
      { x: 300, y: 0 },
    ]);
    expect(path).toBe('M0,100 L300,0');
  });

  it('returns only line commands for 3+ points', () => {
    const path = buildLinearPath([
      { x: 0, y: 200 },
      { x: 150, y: 100 },
      { x: 300, y: 200 },
    ]);
    expect(path).toContain(' L');
    expect(path).not.toContain(' C');
  });
});

// ── Colorblind accessibility patterns ─────────────────────────────

describe('DASH_PATTERNS', () => {
  it('has 5 distinct patterns', () => {
    expect(DASH_PATTERNS).toHaveLength(5);
    const unique = new Set(DASH_PATTERNS);
    expect(unique.size).toBe(5);
  });

  it('first pattern is solid (empty string)', () => {
    expect(DASH_PATTERNS[0]).toBe('');
  });

  it('cycles correctly: index 5 wraps to index 0', () => {
    expect(DASH_PATTERNS[5 % DASH_PATTERNS.length]).toBe(DASH_PATTERNS[0]);
  });

  it('all non-empty patterns contain valid SVG dash values', () => {
    for (const p of DASH_PATTERNS) {
      if (p === '') continue;
      // Valid SVG dasharray: space-separated positive numbers
      const parts = p.split(' ');
      for (const part of parts) {
        const n = Number(part);
        expect(n).toBeGreaterThan(0);
        expect(Number.isFinite(n)).toBe(true);
      }
    }
  });
});

describe('LEGEND_SHAPES', () => {
  it('has 5 shapes', () => {
    expect(LEGEND_SHAPES).toHaveLength(5);
  });

  it('contains expected shape names', () => {
    expect([...LEGEND_SHAPES]).toEqual(['circle', 'square', 'diamond', 'triangle', 'bar']);
  });

  it('each shape is unique', () => {
    const unique = new Set(LEGEND_SHAPES);
    expect(unique.size).toBe(5);
  });

  it('cycles correctly: 7 curves get shapes [0..4, 0, 1]', () => {
    const expected = ['circle', 'square', 'diamond', 'triangle', 'bar', 'circle', 'square'];
    for (let i = 0; i < 7; i++) {
      expect(LEGEND_SHAPES[i % LEGEND_SHAPES.length]).toBe(expected[i]);
    }
  });
});

// ── easeOutCubic ──────────────────────────────────────────────────

describe('easeOutCubic', () => {
  it('returns 0 at t=0', () => {
    expect(easeOutCubic(0)).toBe(0);
  });

  it('returns 1 at t=1', () => {
    expect(easeOutCubic(1)).toBe(1);
  });

  it('output is between 0 and 1 for all inputs in [0,1]', () => {
    for (let t = 0; t <= 1; t += 0.05) {
      const v = easeOutCubic(t);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  it('is monotonically increasing on [0,1]', () => {
    let prev = 0;
    for (let t = 0.01; t <= 1; t += 0.01) {
      const v = easeOutCubic(t);
      expect(v).toBeGreaterThanOrEqual(prev);
      prev = v;
    }
  });

  it('eases out: first half covers more than 50% of the range', () => {
    // "ease out" = fast start, slow end → at t=0.5, output > 0.5
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.5);
  });

  it('matches formula: 1 - (1-t)^3', () => {
    for (const t of [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1]) {
      expect(easeOutCubic(t)).toBeCloseTo(1 - Math.pow(1 - t, 3), 10);
    }
  });
});

// ── sampleSmoothCurveAt consistency with buildSmoothPath ──────────

describe('sampling consistency', () => {
  it('sample at endpoints matches control point values', () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 30, y: 60 },
      { x: 70, y: 80 },
      { x: 100, y: 100 },
    ];
    // At each control point x, sample should return that point's y
    for (const pt of pts) {
      expect(sampleSmoothCurveAt(pts, pt.x)).toBeCloseTo(pt.y, 5);
    }
  });

  it('buildSmoothPath and sampleSmoothCurveAt use same interpolation', () => {
    // Both use computeMonotoneTangents internally.
    // If the path goes through (50, 80), sampling at 50 should return 80.
    const pts = [
      { x: 0, y: 0 },
      { x: 50, y: 80 },
      { x: 100, y: 100 },
    ];
    const path = buildSmoothPath(pts);
    expect(path).toContain('50,80'); // path passes through the control point
    expect(sampleSmoothCurveAt(pts, 50)).toBeCloseTo(80, 5);
  });
});
