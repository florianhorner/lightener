// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CurveScrubber } from './curve-scrubber.js';
import type { LightCurve } from '../utils/types.js';

await import('./curve-scrubber.js');

beforeEach(() => {
  document.body.innerHTML = '';
});

function makeScrubber(opts?: {
  curves?: LightCurve[];
  readOnly?: boolean;
  canPreview?: boolean;
  previewActive?: boolean;
}): CurveScrubber {
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
  el.canPreview = opts?.canPreview ?? false;
  el.previewActive = opts?.previewActive ?? false;
  document.body.appendChild(el);
  return el;
}

describe('curve-scrubber — render + ARIA', () => {
  it('renders the "Group brightness" label', async () => {
    const el = makeScrubber();
    await el.updateComplete;
    const label = el.renderRoot.querySelector('.scrubber-label');
    expect(label?.textContent?.trim()).toBe('Group brightness');
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

  it('does not render any badge elements', async () => {
    const el = makeScrubber();
    await el.updateComplete;
    expect(el.renderRoot.querySelector('.badge')).toBeNull();
    expect(el.renderRoot.querySelector('.value-badges')).toBeNull();
  });
});

describe('curve-scrubber — preview toggle', () => {
  it('hides preview button when canPreview=false', async () => {
    const el = makeScrubber({ canPreview: false });
    await el.updateComplete;
    expect(el.renderRoot.querySelector('.preview-toggle-btn')).toBeNull();
  });

  it('shows "Preview all lights" button when canPreview=true and not active', async () => {
    const el = makeScrubber({ canPreview: true, previewActive: false });
    await el.updateComplete;
    const btn = el.renderRoot.querySelector('.preview-toggle-btn');
    expect(btn).not.toBeNull();
    expect(btn?.textContent).toContain('Preview all lights');
    expect(btn?.classList.contains('active')).toBe(false);
  });

  it('shows active state with live dot when previewActive=true', async () => {
    const el = makeScrubber({ canPreview: true, previewActive: true });
    await el.updateComplete;
    const btn = el.renderRoot.querySelector('.preview-toggle-btn');
    expect(btn?.classList.contains('active')).toBe(true);
    expect(el.renderRoot.querySelector('.preview-live-dot')).not.toBeNull();
    expect(btn?.textContent).toContain('Previewing all lights');
    expect(btn?.textContent).toContain('Restore');
  });

  it('dispatches preview-toggle event when button clicked (inactive state)', async () => {
    const el = makeScrubber({ canPreview: true, previewActive: false });
    await el.updateComplete;
    const spy = vi.fn();
    el.addEventListener('preview-toggle', spy);
    const btn = el.renderRoot.querySelector<HTMLButtonElement>('.preview-toggle-btn')!;
    btn.click();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('dispatches preview-toggle event when Restore clicked (active state)', async () => {
    const el = makeScrubber({ canPreview: true, previewActive: true });
    await el.updateComplete;
    const spy = vi.fn();
    el.addEventListener('preview-toggle', spy);
    const btn = el.renderRoot.querySelector<HTMLButtonElement>('.preview-toggle-btn')!;
    btn.click();
    expect(spy).toHaveBeenCalledTimes(1);
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

  it('scrubber slider is non-focusable and aria-disabled when readOnly', async () => {
    const el = makeScrubber({ readOnly: true });
    await el.updateComplete;
    const track = el.renderRoot.querySelector('.track-area')!;
    expect(track.getAttribute('tabindex')).toBe('-1');
    expect(track.getAttribute('aria-disabled')).toBe('true');
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
