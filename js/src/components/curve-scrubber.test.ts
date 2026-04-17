// @vitest-environment jsdom

import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CurveScrubber } from './curve-scrubber.js';
import type { LightCurve } from '../utils/types.js';

// Minimal ResizeObserver stub that records observed targets and exposes a
// manual trigger so tests can drive overflow measurement deterministically.
type RoCallback = (entries: ResizeObserverEntry[]) => void;
interface RoStub {
  observe: ReturnType<typeof vi.fn>;
  unobserve: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
  trigger: () => void;
}
const roInstances: RoStub[] = [];

beforeAll(async () => {
  (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
    private cb: RoCallback;
    private targets: Element[] = [];
    constructor(cb: RoCallback) {
      this.cb = cb;
      const stub: RoStub = {
        observe: vi.fn((t: Element) => {
          this.targets.push(t);
        }),
        unobserve: vi.fn(),
        disconnect: vi.fn(() => {
          this.targets = [];
        }),
        trigger: () => this.cb([]),
      };
      // Proxy the real methods so the ctor's instance is the stub
      this.observe = stub.observe as unknown as (t: Element) => void;
      this.disconnect = stub.disconnect as unknown as () => void;
      roInstances.push(stub);
    }
    observe(_t: Element): void {
      /* replaced per-instance */
    }
    unobserve(_t: Element): void {
      /* noop */
    }
    disconnect(): void {
      /* replaced per-instance */
    }
  };
  await import('./curve-scrubber.js');
});

beforeEach(() => {
  roInstances.length = 0;
  document.body.innerHTML = '';
});

function makeScrubber(opts?: { curves?: LightCurve[]; readOnly?: boolean }): CurveScrubber {
  const el = document.createElement('curve-scrubber') as CurveScrubber;
  el.curves = opts?.curves ?? [
    {
      entityId: 'light.a',
      friendlyName: 'Alpha',
      controlPoints: [
        { lightener: 0, target: 0 },
        { lightener: 100, target: 100 },
      ],
      visible: true,
      color: '#2563eb',
    },
    {
      entityId: 'light.b',
      friendlyName: 'Beta',
      controlPoints: [
        { lightener: 0, target: 0 },
        { lightener: 100, target: 80 },
      ],
      visible: true,
      color: '#ffca28',
    },
  ];
  el.readOnly = opts?.readOnly ?? false;
  document.body.appendChild(el);
  return el;
}

describe('curve-scrubber — render + ARIA', () => {
  it('renders the "Preview at brightness" label', async () => {
    const el = makeScrubber();
    await el.updateComplete;
    const label = el.renderRoot.querySelector('.scrubber-label');
    expect(label?.textContent?.trim()).toBe('Preview at brightness');
  });

  it('exposes ARIA slider role with valid min/max/now/text', async () => {
    const el = makeScrubber();
    await el.updateComplete;
    const track = el.renderRoot.querySelector('.track-area')!;
    expect(track.getAttribute('role')).toBe('slider');
    expect(track.getAttribute('aria-valuemin')).toBe('0');
    expect(track.getAttribute('aria-valuemax')).toBe('100');
    expect(track.getAttribute('aria-valuenow')).toBe('50');
    expect(track.getAttribute('aria-valuetext')).toBe('50% brightness');
  });

  it('shows position label reflecting _position (default 50%)', async () => {
    const el = makeScrubber();
    await el.updateComplete;
    const pos = el.renderRoot.querySelector('.position-label');
    expect(pos?.textContent?.trim()).toBe('50%');
  });
});

describe('curve-scrubber — badges', () => {
  it('renders one badge per visible curve', async () => {
    const el = makeScrubber();
    await el.updateComplete;
    const badges = el.renderRoot.querySelectorAll('.badge');
    expect(badges.length).toBe(2);
  });

  it('omits badges for invisible curves', async () => {
    const el = makeScrubber({
      curves: [
        {
          entityId: 'light.a',
          friendlyName: 'Alpha',
          controlPoints: [
            { lightener: 0, target: 0 },
            { lightener: 100, target: 100 },
          ],
          visible: false,
          color: '#2563eb',
        },
        {
          entityId: 'light.b',
          friendlyName: 'Beta',
          controlPoints: [
            { lightener: 0, target: 0 },
            { lightener: 100, target: 100 },
          ],
          visible: true,
          color: '#ef5350',
        },
      ],
    });
    await el.updateComplete;
    const badges = el.renderRoot.querySelectorAll('.badge');
    expect(badges.length).toBe(1);
    const nameEl = badges[0]!.querySelector('.badge-name');
    expect(nameEl?.textContent?.trim()).toBe('Beta');
  });

  it('darkens low-contrast #ffca28 to #9e7c00 for badge text', async () => {
    const el = makeScrubber();
    await el.updateComplete;
    const badges = el.renderRoot.querySelectorAll<HTMLElement>('.badge');
    const valueSpan = badges[1]!.querySelector<HTMLElement>('span[style*="color"]')!;
    expect(valueSpan.style.color).toContain('rgb(158, 124, 0)');
  });

  it('darkens low-contrast #ffa726 to #b36b00 for badge text', async () => {
    const el = makeScrubber({
      curves: [
        {
          entityId: 'light.x',
          friendlyName: 'X',
          controlPoints: [
            { lightener: 0, target: 0 },
            { lightener: 100, target: 100 },
          ],
          visible: true,
          color: '#ffa726',
        },
      ],
    });
    await el.updateComplete;
    const valueSpan = el.renderRoot.querySelector<HTMLElement>('.badge span[style*="color"]')!;
    expect(valueSpan.style.color).toContain('rgb(179, 107, 0)');
  });
});

describe('curve-scrubber — keyboard nav', () => {
  it('ArrowRight moves position by +1 and dispatches scrubber-move', async () => {
    const el = makeScrubber();
    await el.updateComplete;
    const moveSpy = vi.fn();
    el.addEventListener('scrubber-move', moveSpy);
    const track = el.renderRoot.querySelector('.track-area')! as HTMLElement;
    track.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await el.updateComplete;
    expect(moveSpy).toHaveBeenCalledTimes(1);
    expect(moveSpy.mock.calls[0]![0].detail.position).toBe(51);
    expect(track.getAttribute('aria-valuenow')).toBe('51');
  });

  it('ArrowLeft moves position by -1', async () => {
    const el = makeScrubber();
    await el.updateComplete;
    const track = el.renderRoot.querySelector('.track-area')! as HTMLElement;
    track.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    await el.updateComplete;
    expect(track.getAttribute('aria-valuenow')).toBe('49');
  });

  it('Shift+Arrow uses step=10', async () => {
    const el = makeScrubber();
    await el.updateComplete;
    const track = el.renderRoot.querySelector('.track-area')! as HTMLElement;
    track.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', shiftKey: true, bubbles: true })
    );
    await el.updateComplete;
    expect(track.getAttribute('aria-valuenow')).toBe('60');
  });

  it('Home jumps to 0, End to 100', async () => {
    const el = makeScrubber();
    await el.updateComplete;
    const track = el.renderRoot.querySelector('.track-area')! as HTMLElement;
    track.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    await el.updateComplete;
    expect(track.getAttribute('aria-valuenow')).toBe('0');
    track.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    await el.updateComplete;
    expect(track.getAttribute('aria-valuenow')).toBe('100');
  });

  it('clamps to [0, 100]', async () => {
    const el = makeScrubber();
    await el.updateComplete;
    const track = el.renderRoot.querySelector('.track-area')! as HTMLElement;
    track.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    await el.updateComplete;
    track.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    await el.updateComplete;
    expect(track.getAttribute('aria-valuenow')).toBe('0');
    track.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    await el.updateComplete;
    track.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await el.updateComplete;
    expect(track.getAttribute('aria-valuenow')).toBe('100');
  });

  it('other keys are ignored (no dispatch, no position change)', async () => {
    const el = makeScrubber();
    await el.updateComplete;
    const moveSpy = vi.fn();
    el.addEventListener('scrubber-move', moveSpy);
    const track = el.renderRoot.querySelector('.track-area')! as HTMLElement;
    track.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
    track.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(moveSpy).not.toHaveBeenCalled();
    expect(track.getAttribute('aria-valuenow')).toBe('50');
  });
});

describe('curve-scrubber — readOnly guard', () => {
  it('ignores keyboard when readOnly=true', async () => {
    const el = makeScrubber({ readOnly: true });
    await el.updateComplete;
    const moveSpy = vi.fn();
    el.addEventListener('scrubber-move', moveSpy);
    const track = el.renderRoot.querySelector('.track-area')! as HTMLElement;
    track.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await el.updateComplete;
    expect(moveSpy).not.toHaveBeenCalled();
    expect(track.getAttribute('aria-valuenow')).toBe('50');
  });

  it('ignores track click when readOnly=true', async () => {
    const el = makeScrubber({ readOnly: true });
    await el.updateComplete;
    const moveSpy = vi.fn();
    el.addEventListener('scrubber-move', moveSpy);
    const track = el.renderRoot.querySelector('.track-area')! as HTMLElement;
    track.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 100 }));
    expect(moveSpy).not.toHaveBeenCalled();
  });

  it('ignores pointerdown when readOnly=true', async () => {
    const el = makeScrubber({ readOnly: true });
    await el.updateComplete;
    const startSpy = vi.fn();
    el.addEventListener('scrubber-start', startSpy);
    const thumb = el.renderRoot.querySelector('.thumb')! as HTMLElement;
    thumb.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, clientX: 100 })
    );
    expect(startSpy).not.toHaveBeenCalled();
  });
});

describe('curve-scrubber — pointer drag', () => {
  it('dispatches scrubber-start on pointerdown and scrubber-end on pointerup', async () => {
    const el = makeScrubber();
    await el.updateComplete;
    const startSpy = vi.fn();
    const endSpy = vi.fn();
    el.addEventListener('scrubber-start', startSpy);
    el.addEventListener('scrubber-end', endSpy);

    const thumb = el.renderRoot.querySelector('.thumb')! as HTMLElement;
    const track = el.renderRoot.querySelector('.track-area')! as HTMLElement;
    // Stub getBoundingClientRect for deterministic track geometry
    vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      right: 100,
      bottom: 20,
      width: 100,
      height: 20,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);
    // jsdom lacks setPointerCapture on Element
    (thumb as unknown as { setPointerCapture: (id: number) => void }).setPointerCapture = () => {};

    thumb.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, clientX: 25 })
    );
    await el.updateComplete;
    expect(startSpy).toHaveBeenCalledTimes(1);
    expect(track.getAttribute('aria-valuenow')).toBe('25');

    thumb.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1 }));
    expect(endSpy).toHaveBeenCalledTimes(1);
  });

  it('updates position and dispatches scrubber-move on pointermove while dragging', async () => {
    const el = makeScrubber();
    await el.updateComplete;
    const moveSpy = vi.fn();
    el.addEventListener('scrubber-move', moveSpy);

    const thumb = el.renderRoot.querySelector('.thumb')! as HTMLElement;
    const track = el.renderRoot.querySelector('.track-area')! as HTMLElement;
    vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      right: 100,
      bottom: 20,
      width: 100,
      height: 20,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);
    (thumb as unknown as { setPointerCapture: (id: number) => void }).setPointerCapture = () => {};

    thumb.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, clientX: 10 })
    );
    await el.updateComplete;
    const initialCalls = moveSpy.mock.calls.length;

    thumb.dispatchEvent(
      new PointerEvent('pointermove', { bubbles: true, pointerId: 1, clientX: 60 })
    );
    await el.updateComplete;
    expect(moveSpy.mock.calls.length).toBeGreaterThan(initialCalls);
    expect(moveSpy.mock.calls[moveSpy.mock.calls.length - 1]![0].detail.position).toBe(60);

    thumb.dispatchEvent(
      new PointerEvent('pointermove', { bubbles: true, pointerId: 1, clientX: 90 })
    );
    await el.updateComplete;
    expect(moveSpy.mock.calls[moveSpy.mock.calls.length - 1]![0].detail.position).toBe(90);
  });

  it('ignores pointermove when not dragging', async () => {
    const el = makeScrubber();
    await el.updateComplete;
    const moveSpy = vi.fn();
    el.addEventListener('scrubber-move', moveSpy);
    const thumb = el.renderRoot.querySelector('.thumb')! as HTMLElement;

    thumb.dispatchEvent(
      new PointerEvent('pointermove', { bubbles: true, pointerId: 1, clientX: 60 })
    );
    await el.updateComplete;
    expect(moveSpy).not.toHaveBeenCalled();
  });
});

describe('curve-scrubber — track click', () => {
  it('updates position based on click clientX relative to track rect', async () => {
    const el = makeScrubber();
    await el.updateComplete;
    const track = el.renderRoot.querySelector('.track-area')! as HTMLElement;
    vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      right: 200,
      bottom: 20,
      width: 200,
      height: 20,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);
    const moveSpy = vi.fn();
    el.addEventListener('scrubber-move', moveSpy);
    track.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 80 }));
    await el.updateComplete;
    expect(moveSpy).toHaveBeenCalledTimes(1);
    expect(moveSpy.mock.calls[0]![0].detail.position).toBe(40);
  });
});

describe('curve-scrubber — overflow indicator', () => {
  it('hides +N more when nothing overflows', async () => {
    const el = makeScrubber();
    await el.updateComplete;
    const overflow = el.renderRoot.querySelector('.overflow-indicator');
    expect(overflow).toBeNull();
  });

  it('shows +N more when ResizeObserver measures hidden badges', async () => {
    const el = makeScrubber();
    await el.updateComplete;
    const container = el.renderRoot.querySelector<HTMLElement>('.value-badges')!;
    const badges = container.querySelectorAll<HTMLElement>('.badge');
    // Container can only show the first row (0-20); second badge is at 25
    Object.defineProperty(container, 'clientHeight', { configurable: true, value: 20 });
    Object.defineProperty(badges[0]!, 'offsetTop', { configurable: true, value: 0 });
    Object.defineProperty(badges[0]!, 'offsetHeight', { configurable: true, value: 20 });
    Object.defineProperty(badges[1]!, 'offsetTop', { configurable: true, value: 25 });
    Object.defineProperty(badges[1]!, 'offsetHeight', { configurable: true, value: 20 });

    // Trigger the measurement via the stub
    roInstances[0]!.trigger();
    await el.updateComplete;

    const btn = el.renderRoot.querySelector<HTMLButtonElement>('.overflow-indicator');
    expect(btn).not.toBeNull();
    expect(btn!.textContent?.trim()).toBe('+1 more');
    expect(btn!.getAttribute('aria-expanded')).toBe('false');
  });

  it('toggles to "Show less" when clicked', async () => {
    const el = makeScrubber();
    await el.updateComplete;
    const container = el.renderRoot.querySelector<HTMLElement>('.value-badges')!;
    const badges = container.querySelectorAll<HTMLElement>('.badge');
    Object.defineProperty(container, 'clientHeight', { configurable: true, value: 20 });
    Object.defineProperty(badges[0]!, 'offsetTop', { configurable: true, value: 0 });
    Object.defineProperty(badges[0]!, 'offsetHeight', { configurable: true, value: 20 });
    Object.defineProperty(badges[1]!, 'offsetTop', { configurable: true, value: 25 });
    Object.defineProperty(badges[1]!, 'offsetHeight', { configurable: true, value: 20 });
    roInstances[0]!.trigger();
    await el.updateComplete;

    const btn = el.renderRoot.querySelector<HTMLButtonElement>('.overflow-indicator')!;
    btn.click();
    await el.updateComplete;
    expect(btn.textContent?.trim()).toBe('Show less');
    expect(btn.getAttribute('aria-expanded')).toBe('true');
  });
});

describe('curve-scrubber — lifecycle', () => {
  it('disconnects ResizeObserver on disconnectedCallback', async () => {
    const el = makeScrubber();
    await el.updateComplete;
    const ro = roInstances[0]!;
    expect(ro.observe).toHaveBeenCalled();
    el.remove();
    expect(ro.disconnect).toHaveBeenCalled();
  });
});
