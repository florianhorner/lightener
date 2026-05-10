// @vitest-environment jsdom

/**
 * Group B (Wave 2) — visual states for the curve graph component itself.
 *
 * The graph owns two states: empty (`curves.length === 0`) and "has data".
 * Loading and error are owned by the parent card (`<lightener-curve-card>`),
 * which renders its own skeleton and error banner around the graph. Tests for
 * those live alongside the card; this file pins the empty / has-data split.
 */

import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { CurveGraph } from './curve-graph.js';
import type { LightCurve } from '../utils/types.js';

beforeAll(async () => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: () => ({
      matches: false,
      addEventListener() {},
      removeEventListener() {},
    }),
  });
  await import('./curve-graph.js');
});

const sampleCurves: LightCurve[] = [
  {
    entityId: 'light.alpha',
    friendlyName: 'Alpha',
    controlPoints: [
      { lightener: 0, target: 0 },
      { lightener: 100, target: 100 },
    ],
    visible: true,
    color: '#2563eb',
  },
];

function makeGraph(props: Partial<CurveGraph>): CurveGraph {
  const graph = document.createElement('curve-graph') as CurveGraph;
  Object.assign(graph, props);
  document.body.appendChild(graph);
  return graph;
}

describe('Group B — graph state visuals', () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it('B.5 renders the empty-state hint when curves.length === 0', async () => {
    const graph = makeGraph({ curves: [] });
    await graph.updateComplete;

    const hint = graph.shadowRoot!.querySelector('text.hint-select');
    expect(hint, 'empty-state hint must render with no curves').not.toBeNull();
    expect((hint!.textContent ?? '').toLowerCase()).toMatch(/add a light/);
  });

  it('B.8 hides the empty-state hint and shows the chart when curves render', async () => {
    const graph = makeGraph({ curves: sampleCurves, selectedCurveId: 'light.alpha' });
    await graph.updateComplete;

    const root = graph.shadowRoot!;

    // The empty-state copy must not appear when curves are present.
    expect((root.textContent ?? '').toLowerCase()).not.toMatch(/add a light below/);

    // And the chart must actually render — at least one curve-line present.
    expect(root.querySelectorAll('path.curve-line').length).toBeGreaterThan(0);
  });
});
