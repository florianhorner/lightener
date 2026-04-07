/**
 * Tests for card-level state management logic.
 *
 * These test the pure-logic patterns used in lightener-curve-card.ts
 * without needing a DOM: undo stack, selection toggle, dirty state,
 * point add/remove guards, and mock curve factory.
 */
import { describe, it, expect } from 'vitest';
import { LightCurve, ControlPoint } from './types.js';
import { cloneCurves, curvesEqual } from './data.js';
import { DASH_PATTERNS, LEGEND_SHAPES, easeOutCubic, CURVE_COLORS } from './graph-math.js';

// ── Helpers: replicate card logic as pure functions ────────────────

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

function makeMockCurves(): LightCurve[] {
  return [
    makeCurve({
      entityId: 'light.ceiling',
      friendlyName: 'Ceiling Light',
      controlPoints: [
        { lightener: 0, target: 0 },
        { lightener: 20, target: 0 },
        { lightener: 60, target: 80 },
        { lightener: 100, target: 100 },
      ],
      color: CURVE_COLORS[0],
    }),
    makeCurve({
      entityId: 'light.sofa',
      friendlyName: 'Sofa Lamp',
      controlPoints: [
        { lightener: 0, target: 0 },
        { lightener: 10, target: 50 },
        { lightener: 40, target: 100 },
        { lightener: 70, target: 100 },
        { lightener: 100, target: 60 },
      ],
      color: CURVE_COLORS[1],
    }),
    makeCurve({
      entityId: 'light.led',
      friendlyName: 'LED Strip',
      controlPoints: [
        { lightener: 0, target: 0 },
        { lightener: 1, target: 1 },
        { lightener: 100, target: 100 },
      ],
      color: CURVE_COLORS[2],
    }),
  ];
}

// ── Undo stack logic ──────────────────────────────────────────────

describe('undo stack', () => {
  it('push and pop restores previous state', () => {
    const undoStack: LightCurve[][] = [];
    const curves = [makeCurve()];
    // Push current state
    undoStack.push(cloneCurves(curves));
    // Modify
    const modified = cloneCurves(curves);
    modified[0].controlPoints[1].target = 99;
    // Pop to undo
    const restored = undoStack.pop()!;
    expect(restored[0].controlPoints[1].target).toBe(75);
    expect(curvesEqual(restored, curves)).toBe(true);
  });

  it('caps at 50 entries', () => {
    const undoStack: LightCurve[][] = [];
    const curves = [makeCurve()];
    for (let i = 0; i < 60; i++) {
      undoStack.push(cloneCurves(curves));
      if (undoStack.length > 50) undoStack.shift();
    }
    expect(undoStack.length).toBe(50);
  });

  it('empty stack returns undefined on pop', () => {
    const undoStack: LightCurve[][] = [];
    expect(undoStack.pop()).toBeUndefined();
  });

  it('multiple undos walk back through history', () => {
    const undoStack: LightCurve[][] = [];
    const curves = [makeCurve()];

    // State 1: target=75 (original)
    undoStack.push(cloneCurves(curves));
    curves[0].controlPoints[1].target = 50;

    // State 2: target=50
    undoStack.push(cloneCurves(curves));
    curves[0].controlPoints[1].target = 25;

    // Undo to state 2 (target=50)
    const s2 = undoStack.pop()!;
    expect(s2[0].controlPoints[1].target).toBe(50);

    // Undo to state 1 (target=75)
    const s1 = undoStack.pop()!;
    expect(s1[0].controlPoints[1].target).toBe(75);
  });
});

// ── Selection toggle logic ────────────────────────────────────────

describe('selection toggle', () => {
  function toggleSelection(current: string | null, entityId: string): string | null {
    return current === entityId ? null : entityId;
  }

  it('selects a curve when nothing selected', () => {
    expect(toggleSelection(null, 'light.a')).toBe('light.a');
  });

  it('deselects when same curve clicked again', () => {
    expect(toggleSelection('light.a', 'light.a')).toBeNull();
  });

  it('switches selection to different curve', () => {
    expect(toggleSelection('light.a', 'light.b')).toBe('light.b');
  });
});

// ── Hidden curve selection guard ──────────────────────────────────

describe('hidden curve guard', () => {
  function canSelect(curves: LightCurve[], entityId: string): boolean {
    const curve = curves.find((c) => c.entityId === entityId);
    return curve ? curve.visible : false;
  }

  it('allows selecting visible curve', () => {
    const curves = [makeCurve({ entityId: 'light.a', visible: true })];
    expect(canSelect(curves, 'light.a')).toBe(true);
  });

  it('prevents selecting hidden curve', () => {
    const curves = [makeCurve({ entityId: 'light.a', visible: false })];
    expect(canSelect(curves, 'light.a')).toBe(false);
  });

  it('returns false for non-existent entity', () => {
    const curves = [makeCurve({ entityId: 'light.a' })];
    expect(canSelect(curves, 'light.nonexistent')).toBe(false);
  });
});

// ── Point add guards ──────────────────────────────────────────────

describe('point add logic', () => {
  function addPoint(
    curves: LightCurve[],
    entityId: string,
    lightener: number,
    target: number
  ): LightCurve[] | null {
    const idx = curves.findIndex((c) => c.entityId === entityId);
    if (idx < 0) return null;
    const existing = curves[idx].controlPoints;
    // Reject duplicate x values
    if (existing.some((cp) => cp.lightener === lightener)) return null;
    const result = cloneCurves(curves);
    result[idx].controlPoints.push({ lightener, target });
    result[idx].controlPoints.sort((a, b) => a.lightener - b.lightener);
    return result;
  }

  it('adds a point and sorts by lightener', () => {
    const curves = [makeCurve()];
    const result = addPoint(curves, 'light.test', 75, 90);
    expect(result).not.toBeNull();
    const xs = result![0].controlPoints.map((cp) => cp.lightener);
    expect(xs).toEqual([0, 50, 75, 100]);
  });

  it('rejects duplicate lightener value', () => {
    const curves = [makeCurve()];
    expect(addPoint(curves, 'light.test', 50, 80)).toBeNull();
  });

  it('rejects add to non-existent entity', () => {
    const curves = [makeCurve()];
    expect(addPoint(curves, 'light.nope', 75, 90)).toBeNull();
  });

  it('does not mutate original curves', () => {
    const curves = [makeCurve()];
    const originalLen = curves[0].controlPoints.length;
    addPoint(curves, 'light.test', 75, 90);
    expect(curves[0].controlPoints.length).toBe(originalLen);
  });
});

// ── Point remove guards ───────────────────────────────────────────

describe('point remove logic', () => {
  function removePoint(
    curves: LightCurve[],
    curveIndex: number,
    pointIndex: number
  ): LightCurve[] | null {
    const curve = curves[curveIndex];
    if (!curve) return null;
    // Must keep at least 2 points
    if (curve.controlPoints.length <= 2) return null;
    // Cannot remove origin (index 0)
    if (pointIndex === 0) return null;
    const result = cloneCurves(curves);
    result[curveIndex].controlPoints = result[curveIndex].controlPoints.filter(
      (_, i) => i !== pointIndex
    );
    return result;
  }

  it('removes a point', () => {
    const curves = [makeCurve()]; // 3 points
    const result = removePoint(curves, 0, 1); // remove middle
    expect(result).not.toBeNull();
    expect(result![0].controlPoints).toHaveLength(2);
  });

  it('refuses to go below 2 points', () => {
    const curves = [
      makeCurve({
        controlPoints: [
          { lightener: 0, target: 0 },
          { lightener: 100, target: 100 },
        ],
      }),
    ];
    expect(removePoint(curves, 0, 1)).toBeNull();
  });

  it('refuses to remove origin (index 0)', () => {
    const curves = [makeCurve()];
    expect(removePoint(curves, 0, 0)).toBeNull();
  });

  it('returns null for invalid curve index', () => {
    const curves = [makeCurve()];
    expect(removePoint(curves, 5, 1)).toBeNull();
  });

  it('does not mutate original', () => {
    const curves = [makeCurve()];
    const len = curves[0].controlPoints.length;
    removePoint(curves, 0, 1);
    expect(curves[0].controlPoints.length).toBe(len);
  });
});

// ── Toggle visibility ─────────────────────────────────────────────

describe('toggle visibility', () => {
  function toggleVisibility(curves: LightCurve[], entityId: string): LightCurve[] {
    return curves.map((c) => (c.entityId === entityId ? { ...c, visible: !c.visible } : c));
  }

  it('hides a visible curve', () => {
    const curves = [makeCurve({ entityId: 'light.a', visible: true })];
    const result = toggleVisibility(curves, 'light.a');
    expect(result[0].visible).toBe(false);
  });

  it('shows a hidden curve', () => {
    const curves = [makeCurve({ entityId: 'light.a', visible: false })];
    const result = toggleVisibility(curves, 'light.a');
    expect(result[0].visible).toBe(true);
  });

  it('only toggles the specified curve', () => {
    const curves = [
      makeCurve({ entityId: 'light.a', visible: true }),
      makeCurve({ entityId: 'light.b', visible: true }),
    ];
    const result = toggleVisibility(curves, 'light.a');
    expect(result[0].visible).toBe(false);
    expect(result[1].visible).toBe(true);
  });
});

// ── Dirty state ───────────────────────────────────────────────────

describe('dirty state detection', () => {
  it('clean after clone', () => {
    const curves = makeMockCurves();
    const original = cloneCurves(curves);
    expect(curvesEqual(curves, original)).toBe(true);
  });

  it('dirty after moving a point', () => {
    const curves = makeMockCurves();
    const original = cloneCurves(curves);
    curves[0].controlPoints[1].target = 99;
    expect(curvesEqual(curves, original)).toBe(false);
  });

  it('dirty after adding a point', () => {
    const curves = makeMockCurves();
    const original = cloneCurves(curves);
    curves[0].controlPoints.push({ lightener: 80, target: 90 });
    expect(curvesEqual(curves, original)).toBe(false);
  });

  it('dirty after removing a point', () => {
    const curves = makeMockCurves();
    const original = cloneCurves(curves);
    curves[0].controlPoints.splice(1, 1);
    expect(curvesEqual(curves, original)).toBe(false);
  });

  it('not dirty after toggling visibility (display-only state)', () => {
    const curves = makeMockCurves();
    const original = cloneCurves(curves);
    curves[0].visible = false;
    curves[1].color = '#000';
    expect(curvesEqual(curves, original)).toBe(true);
  });
});

// ── Color palette cycling ─────────────────────────────────────────

describe('color palette', () => {
  it('has 10 colors', () => {
    expect(CURVE_COLORS).toHaveLength(10);
  });

  it('all colors are valid hex', () => {
    for (const c of CURVE_COLORS) {
      expect(c).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('no green (#00xx00-ish) colors for colorblind safety', () => {
    // Green channel dominant = problematic for red-green colorblind users
    for (const c of CURVE_COLORS) {
      const r = parseInt(c.slice(1, 3), 16);
      const g = parseInt(c.slice(3, 5), 16);
      const b = parseInt(c.slice(5, 7), 16);
      // A "green" color has green significantly higher than both red and blue
      const isGreen = g > 150 && g > r * 1.5 && g > b * 1.5;
      expect(isGreen).toBe(false);
    }
  });

  it('cycles for 10+ curves', () => {
    const colors12 = Array.from({ length: 12 }, (_, i) => CURVE_COLORS[i % CURVE_COLORS.length]);
    expect(colors12[10]).toBe(CURVE_COLORS[0]);
    expect(colors12[11]).toBe(CURVE_COLORS[1]);
  });
});

// ── Dash + shape cycling alignment ────────────────────────────────

describe('dash and shape pattern alignment', () => {
  it('dash patterns and shapes have same count (5 each)', () => {
    expect(DASH_PATTERNS.length).toBe(LEGEND_SHAPES.length);
  });

  it('10 curves get unique dash+shape combinations for first 5, then repeat', () => {
    const combos = Array.from({ length: 10 }, (_, i) => ({
      dash: DASH_PATTERNS[i % DASH_PATTERNS.length],
      shape: LEGEND_SHAPES[i % LEGEND_SHAPES.length],
    }));
    // First 5 should be unique combos
    const first5 = combos.slice(0, 5).map((c) => `${c.dash}|${c.shape}`);
    expect(new Set(first5).size).toBe(5);
    // 5-9 repeat 0-4
    for (let i = 0; i < 5; i++) {
      expect(combos[i + 5].dash).toBe(combos[i].dash);
      expect(combos[i + 5].shape).toBe(combos[i].shape);
    }
  });
});

// ── Cancel animation interpolation logic ──────────────────────────

describe('cancel animation interpolation', () => {
  function interpolatePoints(
    startPts: ControlPoint[],
    endPts: ControlPoint[],
    t: number
  ): ControlPoint[] {
    const eased = easeOutCubic(t);
    const sharedLen = Math.min(startPts.length, endPts.length);
    const pts: ControlPoint[] = [];
    for (let i = 0; i < sharedLen; i++) {
      pts.push({
        lightener: Math.round(
          startPts[i].lightener + (endPts[i].lightener - startPts[i].lightener) * eased
        ),
        target: Math.round(startPts[i].target + (endPts[i].target - startPts[i].target) * eased),
      });
    }
    return pts;
  }

  it('t=0 returns start points', () => {
    const start: ControlPoint[] = [
      { lightener: 0, target: 0 },
      { lightener: 50, target: 75 },
    ];
    const end: ControlPoint[] = [
      { lightener: 0, target: 0 },
      { lightener: 50, target: 50 },
    ];
    const result = interpolatePoints(start, end, 0);
    expect(result).toEqual(start);
  });

  it('t=1 returns end points', () => {
    const start: ControlPoint[] = [
      { lightener: 0, target: 0 },
      { lightener: 50, target: 75 },
    ];
    const end: ControlPoint[] = [
      { lightener: 0, target: 0 },
      { lightener: 50, target: 50 },
    ];
    const result = interpolatePoints(start, end, 1);
    expect(result).toEqual(end);
  });

  it('midpoint is between start and end', () => {
    const start: ControlPoint[] = [
      { lightener: 0, target: 0 },
      { lightener: 50, target: 100 },
    ];
    const end: ControlPoint[] = [
      { lightener: 0, target: 0 },
      { lightener: 50, target: 0 },
    ];
    const result = interpolatePoints(start, end, 0.5);
    // easeOutCubic(0.5) = 0.875, so target ≈ 100 + (0-100)*0.875 = 12.5 → 13
    expect(result[1].target).toBeGreaterThan(0);
    expect(result[1].target).toBeLessThan(100);
  });

  it('handles mismatched lengths (uses min)', () => {
    const start: ControlPoint[] = [
      { lightener: 0, target: 0 },
      { lightener: 50, target: 50 },
      { lightener: 100, target: 100 },
    ];
    const end: ControlPoint[] = [
      { lightener: 0, target: 0 },
      { lightener: 100, target: 100 },
    ];
    const result = interpolatePoints(start, end, 0.5);
    expect(result).toHaveLength(2); // min(3, 2)
  });
});

// ── Mock curves factory ───────────────────────────────────────────

describe('mock curves factory', () => {
  it('creates 3 curves with different entities', () => {
    const mock = makeMockCurves();
    expect(mock).toHaveLength(3);
    const ids = mock.map((c) => c.entityId);
    expect(new Set(ids).size).toBe(3);
  });

  it('all curves start with 0:0 origin', () => {
    for (const c of makeMockCurves()) {
      expect(c.controlPoints[0]).toEqual({ lightener: 0, target: 0 });
    }
  });

  it('all curves visible by default', () => {
    for (const c of makeMockCurves()) {
      expect(c.visible).toBe(true);
    }
  });

  it('colors use the palette', () => {
    const mock = makeMockCurves();
    for (let i = 0; i < mock.length; i++) {
      expect(mock[i].color).toBe(CURVE_COLORS[i]);
    }
  });
});
