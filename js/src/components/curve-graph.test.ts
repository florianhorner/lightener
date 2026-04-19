// @vitest-environment jsdom

import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { CurveGraph } from './curve-graph.js';

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

describe('curve-graph keyboard editing', () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  function makeGraph() {
    const graph = document.createElement('curve-graph') as CurveGraph;
    graph.curves = [
      {
        entityId: 'light.alpha',
        friendlyName: 'Alpha',
        controlPoints: [
          { lightener: 0, target: 0 },
          { lightener: 50, target: 75 },
          { lightener: 100, target: 100 },
        ],
        visible: true,
        color: '#2563eb',
      },
    ];
    graph.selectedCurveId = 'light.alpha';
    document.body.appendChild(graph);
    return graph;
  }

  it('moves a focused point with arrow keys and emits point-drop to close the undo step', async () => {
    const graph = makeGraph();
    await graph.updateComplete;

    const events: string[] = [];
    let moveDetail: Record<string, unknown> | null = null;

    graph.addEventListener('point-move', ((event: CustomEvent) => {
      events.push(event.type);
      moveDetail = event.detail;
    }) as EventListener);
    graph.addEventListener('point-drop', ((event: CustomEvent) => {
      events.push(event.type);
    }) as EventListener);

    const editablePoint = graph.shadowRoot!.querySelectorAll<SVGElement>('.hit-circle')[1];
    editablePoint.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));

    expect(events).toEqual(['point-move', 'point-drop']);
    expect(moveDetail).toMatchObject({
      curveIndex: 0,
      pointIndex: 1,
      lightener: 51,
      target: 75,
    });
  });

  it('adds and removes points from the keyboard', async () => {
    const graph = makeGraph();
    await graph.updateComplete;

    const added: Array<Record<string, unknown>> = [];
    const removed: Array<Record<string, unknown>> = [];

    graph.addEventListener('point-add', ((event: CustomEvent) => {
      added.push(event.detail);
    }) as EventListener);
    graph.addEventListener('point-remove', ((event: CustomEvent) => {
      removed.push(event.detail);
    }) as EventListener);

    const editablePoint = graph.shadowRoot!.querySelectorAll<SVGElement>('.hit-circle')[1];
    editablePoint.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    editablePoint.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));

    expect(added[0]).toMatchObject({
      entityId: 'light.alpha',
      lightener: 75,
      target: 88,
    });
    expect(removed[0]).toMatchObject({
      curveIndex: 0,
      pointIndex: 1,
    });
  });
});

describe('curve-graph SVG def ID scoping', () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  function makeGraph() {
    const graph = document.createElement('curve-graph') as CurveGraph;
    graph.curves = [
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
    document.body.appendChild(graph);
    return graph;
  }

  it('generates unique SVG def IDs per instance so multi-card dashboards do not cross-wire', async () => {
    const a = makeGraph();
    const b = makeGraph();
    await Promise.all([a.updateComplete, b.updateComplete]);

    const aGrads = [...a.shadowRoot!.querySelectorAll('linearGradient')].map((el) => el.id);
    const bGrads = [...b.shadowRoot!.querySelectorAll('linearGradient')].map((el) => el.id);
    expect(aGrads.length).toBeGreaterThan(0);
    expect(bGrads.length).toBeGreaterThan(0);
    expect(aGrads).not.toEqual(bGrads);

    const aClip = a.shadowRoot!.querySelector('clipPath')!.id;
    const bClip = b.shadowRoot!.querySelector('clipPath')!.id;
    expect(aClip).not.toBe(bClip);
  });
});
