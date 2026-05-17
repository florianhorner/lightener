// @vitest-environment jsdom

/**
 * Tests for the pure-function helpers in `card-logic.ts`.
 *
 * Previously this file replicated card logic inside the test as helper
 * functions and tested the replicas — a shadow-tests anti-pattern that meant
 * production code could drift while tests stayed green. The helpers now live
 * in `./card-logic.ts` and are imported here, so these tests exercise the
 * same code the card calls at runtime.
 *
 * Behaviors tested via real production helpers:
 *   - undo stack push/cap (`pushToUndoStack`, `UNDO_STACK_MAX`)
 *   - selection toggle (`toggleSelection`)
 *   - hidden-curve guard (`canSelectCurve`)
 *   - point add/remove guards (`addPointToCurves`, `removePointFromCurves`)
 *   - visibility toggle (`toggleCurveVisibility`)
 *   - cancel/undo animation interpolation (`interpolateControlPoints`,
 *     `mergeFinalAnimationFrame`)
 *   - keyboard focus guard (`shouldHandleKey`)
 *
 * Behaviors covered as integration tests of supporting helpers:
 *   - dirty-state detection via `cloneCurves` + `curvesEqual`
 *   - color palette properties via `CURVE_COLORS`
 *   - dash + shape pattern alignment via `DASH_PATTERNS` + `LEGEND_SHAPES`
 *   - mock curve factory (test-only fixture, kept here)
 */
import { describe, it, expect } from 'vitest';
import { LightCurve, ControlPoint } from './types.js';
import { cloneCurves, curvesEqual } from './data.js';
import { DASH_PATTERNS, LEGEND_SHAPES, easeOutCubic, CURVE_COLORS } from './graph-math.js';
import {
  UNDO_STACK_MAX,
  addPointToCurves,
  canSelectCurve,
  interpolateControlPoints,
  mergeFinalAnimationFrame,
  pushToUndoStack,
  removePointFromCurves,
  shouldHandleKey,
  toggleCurveVisibility,
  toggleSelection,
} from './card-logic.js';

// ── Test fixtures (test-only — not extracted to source) ───────────

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

// ── Undo stack (real helper) ───────────────────────────────────────

describe('pushToUndoStack', () => {
  it('push and pop restores previous state', () => {
    const undoStack: LightCurve[][] = [];
    const curves = [makeCurve()];
    pushToUndoStack(undoStack, curves);
    // Modify
    const modified = cloneCurves(curves);
    modified[0].controlPoints[1].target = 99;
    // Pop to undo
    const restored = undoStack.pop()!;
    expect(restored[0].controlPoints[1].target).toBe(75);
    expect(curvesEqual(restored, curves)).toBe(true);
  });

  it(`caps at ${UNDO_STACK_MAX} entries`, () => {
    const undoStack: LightCurve[][] = [];
    const curves = [makeCurve()];
    for (let i = 0; i < 60; i++) {
      pushToUndoStack(undoStack, curves);
    }
    expect(undoStack.length).toBe(UNDO_STACK_MAX);
  });

  it('empty stack returns undefined on pop', () => {
    const undoStack: LightCurve[][] = [];
    expect(undoStack.pop()).toBeUndefined();
  });

  it('multiple undos walk back through history', () => {
    const undoStack: LightCurve[][] = [];
    const curves = [makeCurve()];

    // State 1: target=75 (original)
    pushToUndoStack(undoStack, curves);
    curves[0].controlPoints[1].target = 50;

    // State 2: target=50
    pushToUndoStack(undoStack, curves);
    curves[0].controlPoints[1].target = 25;

    // Undo to state 2 (target=50)
    const s2 = undoStack.pop()!;
    expect(s2[0].controlPoints[1].target).toBe(50);

    // Undo to state 1 (target=75)
    const s1 = undoStack.pop()!;
    expect(s1[0].controlPoints[1].target).toBe(75);
  });

  it('pushes a deep clone — caller can mutate the original without corrupting the snapshot', () => {
    const undoStack: LightCurve[][] = [];
    const curves = [makeCurve()];
    pushToUndoStack(undoStack, curves);
    curves[0].controlPoints[1].target = 99;
    expect(undoStack[0][0].controlPoints[1].target).toBe(75);
  });
});

// ── Selection toggle (real helper) ────────────────────────────────

describe('toggleSelection', () => {
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

// ── Hidden curve guard (real helper) ──────────────────────────────

describe('canSelectCurve', () => {
  it('allows selecting visible curve', () => {
    const curves = [makeCurve({ entityId: 'light.a', visible: true })];
    expect(canSelectCurve(curves, 'light.a')).toBe(true);
  });

  it('prevents selecting hidden curve', () => {
    const curves = [makeCurve({ entityId: 'light.a', visible: false })];
    expect(canSelectCurve(curves, 'light.a')).toBe(false);
  });

  it('returns false for non-existent entity', () => {
    const curves = [makeCurve({ entityId: 'light.a' })];
    expect(canSelectCurve(curves, 'light.nonexistent')).toBe(false);
  });
});

// ── Point add (real helper) ───────────────────────────────────────

describe('addPointToCurves', () => {
  it('adds a point and sorts by lightener', () => {
    const curves = [makeCurve()];
    const result = addPointToCurves(curves, 'light.test', 75, 90);
    expect(result).not.toBeNull();
    const xs = result![0].controlPoints.map((cp) => cp.lightener);
    expect(xs).toEqual([0, 50, 75, 100]);
  });

  it('rejects duplicate lightener value', () => {
    const curves = [makeCurve()];
    expect(addPointToCurves(curves, 'light.test', 50, 80)).toBeNull();
  });

  it('rejects add to non-existent entity', () => {
    const curves = [makeCurve()];
    expect(addPointToCurves(curves, 'light.nope', 75, 90)).toBeNull();
  });

  it('does not mutate original curves', () => {
    const curves = [makeCurve()];
    const originalLen = curves[0].controlPoints.length;
    addPointToCurves(curves, 'light.test', 75, 90);
    expect(curves[0].controlPoints.length).toBe(originalLen);
  });
});

// ── Point remove (real helper) ────────────────────────────────────

describe('removePointFromCurves', () => {
  it('removes a point', () => {
    const curves = [makeCurve()]; // 3 points
    const result = removePointFromCurves(curves, 0, 1); // remove middle
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
    expect(removePointFromCurves(curves, 0, 1)).toBeNull();
  });

  it('refuses to remove origin (index 0)', () => {
    const curves = [makeCurve()];
    expect(removePointFromCurves(curves, 0, 0)).toBeNull();
  });

  it('returns null for invalid curve index', () => {
    const curves = [makeCurve()];
    expect(removePointFromCurves(curves, 5, 1)).toBeNull();
  });

  it('returns null for invalid point index', () => {
    const curves = [makeCurve()];
    expect(removePointFromCurves(curves, 0, 9)).toBeNull();
    expect(removePointFromCurves(curves, 0, -1)).toBeNull();
  });

  it('does not mutate original', () => {
    const curves = [makeCurve()];
    const len = curves[0].controlPoints.length;
    removePointFromCurves(curves, 0, 1);
    expect(curves[0].controlPoints.length).toBe(len);
  });
});

// ── Visibility toggle (real helper) ───────────────────────────────

describe('toggleCurveVisibility', () => {
  it('hides a visible curve', () => {
    const curves = [makeCurve({ entityId: 'light.a', visible: true })];
    const result = toggleCurveVisibility(curves, 'light.a');
    expect(result[0].visible).toBe(false);
  });

  it('shows a hidden curve', () => {
    const curves = [makeCurve({ entityId: 'light.a', visible: false })];
    const result = toggleCurveVisibility(curves, 'light.a');
    expect(result[0].visible).toBe(true);
  });

  it('only toggles the specified curve', () => {
    const curves = [
      makeCurve({ entityId: 'light.a', visible: true }),
      makeCurve({ entityId: 'light.b', visible: true }),
    ];
    const result = toggleCurveVisibility(curves, 'light.a');
    expect(result[0].visible).toBe(false);
    expect(result[1].visible).toBe(true);
  });

  it('does not mutate the original array or items', () => {
    const curves = [makeCurve({ entityId: 'light.a', visible: true })];
    const originalRef = curves[0];
    const result = toggleCurveVisibility(curves, 'light.a');
    expect(curves[0]).toBe(originalRef);
    expect(curves[0].visible).toBe(true);
    expect(result[0]).not.toBe(originalRef);
  });
});

// ── Dirty state detection (integration of cloneCurves + curvesEqual) ───

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

// ── Color palette ────────────────────────────────────────────────

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

// ── Dash + shape pattern alignment ────────────────────────────────

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

// ── Animation interpolation (real helper) ─────────────────────────

describe('interpolateControlPoints', () => {
  // Production applies easeOutCubic to rawT and passes the eased value, so
  // tests do the same — these tests exercise the exact code path the card uses.
  it('t=0 returns start points', () => {
    const start: ControlPoint[] = [
      { lightener: 0, target: 0 },
      { lightener: 50, target: 75 },
    ];
    const end: ControlPoint[] = [
      { lightener: 0, target: 0 },
      { lightener: 50, target: 50 },
    ];
    const result = interpolateControlPoints(start, end, easeOutCubic(0));
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
    const result = interpolateControlPoints(start, end, easeOutCubic(1));
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
    // easeOutCubic(0.5) = 0.875, so target ≈ 100 + (0-100)*0.875 = 12.5 → 13
    const result = interpolateControlPoints(start, end, easeOutCubic(0.5));
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
    const result = interpolateControlPoints(start, end, easeOutCubic(0.5));
    expect(result).toHaveLength(2); // min(3, 2)
  });
});

// ── Final-frame merge: undo/cancel preserves visible state (real helper) ─

describe('mergeFinalAnimationFrame', () => {
  it('undo does not unhide a curve the user hid', () => {
    const curves = [
      makeCurve({ entityId: 'light.a', visible: false }),
      makeCurve({ entityId: 'light.b', visible: true }),
    ];
    // Undo snapshot was taken when both were visible
    const snapshot = [
      makeCurve({ entityId: 'light.a', visible: true }),
      makeCurve({ entityId: 'light.b', visible: true }),
    ];
    const result = mergeFinalAnimationFrame(curves, snapshot);
    // light.a should stay hidden despite snapshot saying visible
    expect(result[0].visible).toBe(false);
    expect(result[1].visible).toBe(true);
  });

  it('cancel does not unhide a curve the user hid', () => {
    const curves = [
      makeCurve({ entityId: 'light.a', visible: true }),
      makeCurve({ entityId: 'light.b', visible: false }),
    ];
    const original = [
      makeCurve({ entityId: 'light.a', visible: true }),
      makeCurve({ entityId: 'light.b', visible: true }),
    ];
    const result = mergeFinalAnimationFrame(curves, original);
    expect(result[1].visible).toBe(false);
  });

  it('restores control points from snapshot while keeping visible', () => {
    const curves = [
      makeCurve({
        entityId: 'light.a',
        visible: false,
        controlPoints: [
          { lightener: 0, target: 0 },
          { lightener: 50, target: 99 },
          { lightener: 100, target: 100 },
        ],
      }),
    ];
    const snapshot = [
      makeCurve({
        entityId: 'light.a',
        visible: true,
        controlPoints: [
          { lightener: 0, target: 0 },
          { lightener: 50, target: 75 },
          { lightener: 100, target: 100 },
        ],
      }),
    ];
    const result = mergeFinalAnimationFrame(curves, snapshot);
    // Control points restored from snapshot
    expect(result[0].controlPoints[1].target).toBe(75);
    // Visible preserved from current
    expect(result[0].visible).toBe(false);
  });
});

// ── Keyboard focus guard (real helper) ────────────────────────────

describe('shouldHandleKey', () => {
  it('handles keys when nothing is focused', () => {
    const card = document.createElement('div');
    expect(shouldHandleKey(null, card)).toBe(true);
  });

  it('handles keys when card itself is focused', () => {
    const card = document.createElement('div');
    expect(shouldHandleKey(card, card)).toBe(true);
  });

  it('handles keys when body is focused (no specific focus)', () => {
    const card = document.createElement('div');
    expect(shouldHandleKey(document.body, card)).toBe(true);
  });

  it('handles keys when child of card is focused', () => {
    const card = document.createElement('div');
    const child = document.createElement('span');
    card.appendChild(child);
    expect(shouldHandleKey(child, card)).toBe(true);
  });

  it('ignores keys when external element is focused', () => {
    const card = document.createElement('div');
    const external = document.createElement('div');
    expect(shouldHandleKey(external, card)).toBe(false);
  });
});

// ── Mock curves factory (test-only fixture) ───────────────────────

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
