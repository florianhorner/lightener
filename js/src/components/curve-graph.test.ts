// @vitest-environment jsdom

import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
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
    // After T-4.2 fix, fills (and their <linearGradient>) only render for the
    // selected curve. Set a selection so the per-instance gradient assertion
    // exercises a real def.
    graph.selectedCurveId = 'light.alpha';
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

describe('curve-graph render order', () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  function makeMultiGraph(selectedId: string | null) {
    const graph = document.createElement('curve-graph') as CurveGraph;
    graph.curves = [
      {
        entityId: 'light.first',
        friendlyName: 'First',
        controlPoints: [
          { lightener: 0, target: 0 },
          { lightener: 100, target: 100 },
        ],
        visible: true,
        color: '#ff0000',
      },
      {
        entityId: 'light.second',
        friendlyName: 'Second',
        controlPoints: [
          { lightener: 0, target: 50 },
          { lightener: 100, target: 50 },
        ],
        visible: true,
        color: '#00ff00',
      },
      {
        entityId: 'light.third',
        friendlyName: 'Third',
        controlPoints: [
          { lightener: 0, target: 80 },
          { lightener: 100, target: 20 },
        ],
        visible: true,
        color: '#0000ff',
      },
    ];
    graph.selectedCurveId = selectedId;
    document.body.appendChild(graph);
    return graph;
  }

  it('renders selected curve last (on top) when first curve (index 0) is selected', async () => {
    const graph = makeMultiGraph('light.first');
    await graph.updateComplete;
    const paths = [...graph.shadowRoot!.querySelectorAll<SVGPathElement>('.curve-line')];
    // Selected curve must be the last rendered path (SVG painters model: last = on top)
    expect(paths[paths.length - 1].getAttribute('stroke')).toBe('#ff0000');
  });

  it('renders selected curve last (on top) when a middle curve (index 1) is selected', async () => {
    const graph = makeMultiGraph('light.second');
    await graph.updateComplete;
    const paths = [...graph.shadowRoot!.querySelectorAll<SVGPathElement>('.curve-line')];
    expect(paths[paths.length - 1].getAttribute('stroke')).toBe('#00ff00');
  });

  it('renders in original order when no curve is selected', async () => {
    const graph = makeMultiGraph(null);
    await graph.updateComplete;
    const paths = [...graph.shadowRoot!.querySelectorAll<SVGPathElement>('.curve-line')];
    expect(paths.map((p) => p.getAttribute('stroke'))).toEqual(['#ff0000', '#00ff00', '#0000ff']);
  });
});

describe('curve-graph interaction hint', () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it('uses compact centered mobile hint text', async () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = () =>
      ({
        matches: true,
        addEventListener() {},
        removeEventListener() {},
      }) as unknown as MediaQueryList;

    try {
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
      graph.selectedCurveId = 'light.alpha';
      document.body.appendChild(graph);
      await graph.updateComplete;

      const hint = graph.shadowRoot!.querySelector<SVGTextElement>('.hint:not(.hint-select)')!;
      expect(hint.textContent).toBe('Double-tap add · Hold remove');
      expect(hint.getAttribute('text-anchor')).toBe('middle');
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });
});

describe('curve-graph line rendering', () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it('renders multi-point curves with cubic smoothing', async () => {
    const graph = document.createElement('curve-graph') as CurveGraph;
    graph.curves = [
      {
        entityId: 'light.alpha',
        friendlyName: 'Alpha',
        controlPoints: [
          { lightener: 0, target: 0 },
          { lightener: 50, target: 100 },
          { lightener: 100, target: 0 },
        ],
        visible: true,
        color: '#2563eb',
      },
    ];
    document.body.appendChild(graph);
    await graph.updateComplete;

    const path = graph.shadowRoot!.querySelector<SVGPathElement>('.curve-line')!;
    expect(path.getAttribute('d')).toContain(' C');
  });
});

describe('curve-graph first-time hint', () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  function makeGraph(): CurveGraph {
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
    graph.entityId = 'light.lightener_a';
    document.body.appendChild(graph);
    return graph;
  }

  it('shows the richer first-time hint when no curve is selected and not yet dismissed', async () => {
    const graph = makeGraph();
    await graph.updateComplete;
    const hint = graph.shadowRoot!.querySelector<SVGTextElement>('.hint-select')!;
    expect(hint).not.toBeNull();
    expect(hint.textContent).toBe(
      'Select a light, then double-click its curve to add a control point'
    );
  });

  it('falls back to the short hint after the user has interacted in the current entity session', async () => {
    const graph = makeGraph();
    await graph.updateComplete;
    // Simulate dismiss (private state — this is the same flag the dblclick / pointerdown handlers set).
    (graph as unknown as { _graphHintDismissed: boolean })._graphHintDismissed = true;
    graph.requestUpdate();
    await graph.updateComplete;
    const hint = graph.shadowRoot!.querySelector<SVGTextElement>('.hint-select')!;
    expect(hint.textContent).toBe('Select a light to edit its curve');
  });

  it('resets the hint when entityId changes (new lightener group selected)', async () => {
    const graph = makeGraph();
    await graph.updateComplete;
    (graph as unknown as { _graphHintDismissed: boolean })._graphHintDismissed = true;
    graph.requestUpdate();
    await graph.updateComplete;
    expect(graph.shadowRoot!.querySelector<SVGTextElement>('.hint-select')!.textContent).toBe(
      'Select a light to edit its curve'
    );

    graph.entityId = 'light.lightener_b';
    await graph.updateComplete;
    expect(graph.shadowRoot!.querySelector<SVGTextElement>('.hint-select')!.textContent).toBe(
      'Select a light, then double-click its curve to add a control point'
    );
  });

  it('renders the scrubber dim overlay using the --graph-bg token (themeable)', async () => {
    const graph = makeGraph();
    graph.scrubberPosition = 50;
    await graph.updateComplete;

    const overlay = graph.shadowRoot!.querySelector<SVGRectElement>('rect[fill-opacity="0.93"]');
    expect(overlay).not.toBeNull();
    const fill = overlay!.getAttribute('fill') ?? '';
    expect(fill.startsWith('var(--graph-bg')).toBe(true);
    expect(fill).toContain('--ha-card-background');
  });
});

describe('curve-graph lifecycle and media query', () => {
  let addListenerSpy: ReturnType<typeof vi.fn>;
  let removeListenerSpy: ReturnType<typeof vi.fn>;
  let mqlMatches: boolean;

  beforeEach(() => {
    document.body.replaceChildren();
    mqlMatches = false;
    addListenerSpy = vi.fn();
    removeListenerSpy = vi.fn();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: () => ({
        get matches() {
          return mqlMatches;
        },
        addEventListener: addListenerSpy,
        removeEventListener: removeListenerSpy,
      }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
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

  it('registers a matchMedia change listener on connect', async () => {
    const graph = makeGraph();
    await graph.updateComplete;

    expect(addListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('reads matchMedia.matches on connect to initialise mobile state', async () => {
    mqlMatches = true;
    const graph = makeGraph();
    await graph.updateComplete;

    // When mobile, the hint text is centered (compact form) — verify the graph reflects it.
    expect((graph as unknown as { _isMobile: boolean })._isMobile).toBe(true);
  });

  it('removes the matchMedia listener and nulls mql on disconnect', async () => {
    const graph = makeGraph();
    await graph.updateComplete;

    document.body.removeChild(graph);
    // Lit fires disconnectedCallback synchronously on removal from DOM.
    expect(removeListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
    expect((graph as unknown as { _mql: unknown })._mql).toBeNull();
  });

  it('updates _isMobile when the media query fires a change event', async () => {
    const graph = makeGraph();
    await graph.updateComplete;

    // Grab the listener that was registered.
    const [[, listener]] = addListenerSpy.mock.calls as [
      [string, (e: MediaQueryListEvent) => void],
    ];

    expect((graph as unknown as { _isMobile: boolean })._isMobile).toBe(false);

    listener({ matches: true } as MediaQueryListEvent);

    expect((graph as unknown as { _isMobile: boolean })._isMobile).toBe(true);
  });
});

describe('curve-graph SVG accessibility description', () => {
  beforeEach(() => {
    document.body.replaceChildren();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
    });
  });

  it('shows "No curves displayed" when all curves are hidden', async () => {
    const graph = document.createElement('curve-graph') as CurveGraph;
    graph.curves = [
      {
        entityId: 'light.alpha',
        friendlyName: 'Alpha',
        controlPoints: [
          { lightener: 0, target: 0 },
          { lightener: 100, target: 100 },
        ],
        visible: false,
        color: '#2563eb',
      },
    ];
    document.body.appendChild(graph);
    await graph.updateComplete;

    const desc = graph.shadowRoot!.querySelector('desc');
    expect(desc?.textContent).toBe('No curves displayed');
  });

  it('lists visible curves with point count and max brightness in the desc', async () => {
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
    document.body.appendChild(graph);
    await graph.updateComplete;

    const desc = graph.shadowRoot!.querySelector('desc');
    expect(desc?.textContent).toContain('1 curve');
    expect(desc?.textContent).toContain('Alpha');
    expect(desc?.textContent).toContain('3 points');
    expect(desc?.textContent).toContain('max 100%');
  });

  it('uses plural "curves" when more than one is visible', async () => {
    const graph = document.createElement('curve-graph') as CurveGraph;
    graph.curves = [
      {
        entityId: 'light.a',
        friendlyName: 'A',
        controlPoints: [
          { lightener: 0, target: 0 },
          { lightener: 100, target: 80 },
        ],
        visible: true,
        color: '#ff0000',
      },
      {
        entityId: 'light.b',
        friendlyName: 'B',
        controlPoints: [
          { lightener: 0, target: 0 },
          { lightener: 100, target: 60 },
        ],
        visible: true,
        color: '#00ff00',
      },
    ];
    document.body.appendChild(graph);
    await graph.updateComplete;

    const desc = graph.shadowRoot!.querySelector('desc');
    expect(desc?.textContent).toContain('2 curves');
  });
});

// ── Group E: pinned readout chip + scrubber (Wave 1) ────────────────
// Encodes T-2.1 (chip format + dismissal), T-4.6 (filled/hollow semantics),
// T-6.6a / T-4.10 (no duplicate "Group brightness" axis label).

describe('Group E — readout chip + scrubber/axis label', () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  function makeFocusableGraph(opts?: {
    points?: Array<{ lightener: number; target: number }>;
  }): CurveGraph {
    const graph = document.createElement('curve-graph') as CurveGraph;
    graph.curves = [
      {
        entityId: 'light.alpha',
        friendlyName: 'Alpha',
        controlPoints: opts?.points ?? [
          { lightener: 0, target: 0 },
          { lightener: 51, target: 0 },
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

  function tooltipText(graph: CurveGraph): string | null {
    const text = graph.shadowRoot!.querySelector('text.tooltip-text');
    return text ? (text.textContent ?? '').trim() : null;
  }

  it('E.16 shows the readout chip in (input %, output %) format on hover', async () => {
    const graph = makeFocusableGraph();
    await graph.updateComplete;

    // Hover the (51, 0) interior point — index 1.
    const hit = graph.shadowRoot!.querySelectorAll<SVGCircleElement>('.hit-circle')[1];
    hit.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
    await graph.updateComplete;

    const text = tooltipText(graph);
    expect(text, 'tooltip text must exist while hovering').not.toBeNull();
    expect(text).toMatch(/^\(\s*\d+%\s*,\s*\d+%\s*\)$/);
  });

  it('E.17 readout chip clears on pointercancel', async () => {
    const graph = makeFocusableGraph();
    await graph.updateComplete;

    const hit = graph.shadowRoot!.querySelectorAll<SVGCircleElement>('.hit-circle')[1];
    hit.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
    await graph.updateComplete;
    expect(tooltipText(graph)).not.toBeNull();

    // The iOS regression: pointerleave doesn't always fire on touch cancel.
    // Source must wire pointercancel as a fallback dismissal path.
    hit.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true, composed: true }));
    await graph.updateComplete;

    expect(
      tooltipText(graph),
      'pointercancel must dismiss the readout chip (iOS fallback)'
    ).toBeNull();
  });

  it('E.17b pointercancel also clears focused state (not just hover)', async () => {
    const graph = makeFocusableGraph();
    await graph.updateComplete;

    const hit = graph.shadowRoot!.querySelectorAll<SVGCircleElement>('.hit-circle')[1];
    hit.dispatchEvent(new FocusEvent('focus', { bubbles: true, composed: true }));
    hit.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
    await graph.updateComplete;
    expect(
      tooltipText(graph),
      'tooltip must show when point is both focused and hovered'
    ).not.toBeNull();

    // iOS edge case: gesture cancels mid-interaction while a11y focus persists.
    // pointercancel must clear both, otherwise the readout stays stuck.
    hit.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true, composed: true }));
    await graph.updateComplete;

    expect(
      tooltipText(graph),
      'pointercancel must dismiss the readout even when focus state was set'
    ).toBeNull();
  });

  it('E.18 readout chip uses integer format (no .0 suffix) for integer control points', async () => {
    const graph = makeFocusableGraph({
      points: [
        { lightener: 0, target: 0 },
        { lightener: 75, target: 50 },
        { lightener: 100, target: 100 },
      ],
    });
    await graph.updateComplete;

    const hit = graph.shadowRoot!.querySelectorAll<SVGCircleElement>('.hit-circle')[1];
    hit.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
    await graph.updateComplete;

    const text = tooltipText(graph) ?? '';
    expect(text, 'integer points must not render with decimals').not.toMatch(/\.\d/);
  });

  it('E.19 graph does not render its own "Group brightness" x-axis label', async () => {
    // The slider above the graph carries the label. Duplicating it inside the
    // SVG (T-6.6a) creates label collision with tick numbers (T-4.10).
    const graph = makeFocusableGraph();
    await graph.updateComplete;

    const labels = Array.from(graph.shadowRoot!.querySelectorAll('text.axis-label'));
    const hasGroupBrightness = labels.some((el) =>
      ((el as SVGTextElement).textContent ?? '').trim().toLowerCase().includes('group brightness')
    );
    expect(
      hasGroupBrightness,
      'graph must not include an x-axis "Group brightness" label — the slider already labels it'
    ).toBe(false);
  });

  it('E.* y-axis is labeled "Per-light output"', async () => {
    // Y-axis still carries an inline label since no other surface labels it.
    // Pinned from master's wave-1 UX audit cleanup.
    const graph = makeFocusableGraph();
    await graph.updateComplete;
    const axisLabels = Array.from(graph.shadowRoot!.querySelectorAll('text.axis-label')).map((n) =>
      n.textContent?.trim()
    );
    expect(axisLabels).toContain('Per-light output');
  });
});
