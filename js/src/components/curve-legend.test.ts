// @vitest-environment jsdom

import { beforeAll, describe, expect, it, vi } from 'vitest';
import type { CurveLegend } from './curve-legend.js';
import type { LightCurve } from '../utils/types.js';
import { LEGEND_SHAPES, sampleCurveAt } from '../utils/graph-math.js';

beforeAll(async () => {
  await import('./curve-legend.js');
});

function makeLegend(opts?: {
  curves?: LightCurve[];
  selectedCurveId?: string | null;
  scrubberPosition?: number | null;
}): CurveLegend {
  const el = document.createElement('curve-legend') as CurveLegend;
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
      visible: false,
      color: '#ef5350',
    },
  ];
  el.selectedCurveId = opts?.selectedCurveId ?? null;
  el.scrubberPosition = opts?.scrubberPosition ?? null;
  document.body.appendChild(el);
  return el;
}

describe('curve-legend', () => {
  it('renders the "Lights" section label', async () => {
    const el = makeLegend();
    await el.updateComplete;
    const label = el.renderRoot.querySelector('.legend-label');
    expect(label?.textContent?.trim()).toBe('Lights');
  });

  it('renders one legend-item per curve', async () => {
    const el = makeLegend();
    await el.updateComplete;
    const items = el.renderRoot.querySelectorAll('.legend-item');
    expect(items.length).toBe(2);
  });

  it('renders an empty list when curves is empty', async () => {
    const el = makeLegend({ curves: [] });
    await el.updateComplete;
    const items = el.renderRoot.querySelectorAll('.legend-item');
    expect(items.length).toBe(0);
    const label = el.renderRoot.querySelector('.legend-label');
    expect(label).not.toBeNull();
  });

  it('applies "hidden" class to invisible curves only', async () => {
    const el = makeLegend();
    await el.updateComplete;
    const items = el.renderRoot.querySelectorAll('.legend-item');
    expect(items[0]!.classList.contains('hidden')).toBe(false);
    expect(items[1]!.classList.contains('hidden')).toBe(true);
  });

  it('applies "selected" class only to the selected curve', async () => {
    const el = makeLegend({ selectedCurveId: 'light.b' });
    await el.updateComplete;
    const items = el.renderRoot.querySelectorAll('.legend-item');
    expect(items[0]!.classList.contains('selected')).toBe(false);
    expect(items[1]!.classList.contains('selected')).toBe(true);
  });

  it('sets aria-selected matching selectedCurveId', async () => {
    const el = makeLegend({ selectedCurveId: 'light.a' });
    await el.updateComplete;
    const items = el.renderRoot.querySelectorAll('.legend-item');
    expect(items[0]!.getAttribute('aria-selected')).toBe('true');
    expect(items[1]!.getAttribute('aria-selected')).toBe('false');
  });

  it('sets aria-pressed on eye-icon matching !curve.visible', async () => {
    const el = makeLegend();
    await el.updateComplete;
    const eyes = el.renderRoot.querySelectorAll<SVGElement>('.eye-icon');
    expect(eyes[0]!.getAttribute('aria-pressed')).toBe('false');
    expect(eyes[1]!.getAttribute('aria-pressed')).toBe('true');
  });

  it('applies curve.color to the color-dot background', async () => {
    const el = makeLegend();
    await el.updateComplete;
    const dots = el.renderRoot.querySelectorAll<HTMLElement>('.color-dot');
    expect(dots[0]!.style.background).toContain('rgb(37, 99, 235)');
    expect(dots[1]!.style.background).toContain('rgb(239, 83, 80)');
  });

  it('rotates LEGEND_SHAPES by index', async () => {
    const el = makeLegend();
    await el.updateComplete;
    const dots = el.renderRoot.querySelectorAll<HTMLElement>('.color-dot');
    expect(dots[0]!.classList.contains(`shape-${LEGEND_SHAPES[0]}`)).toBe(true);
    expect(dots[1]!.classList.contains(`shape-${LEGEND_SHAPES[1]}`)).toBe(true);
  });

  it('dispatches select-curve on item click', async () => {
    const el = makeLegend();
    await el.updateComplete;
    const spy = vi.fn();
    el.addEventListener('select-curve', spy);
    const firstItem = el.renderRoot.querySelector<HTMLElement>('.legend-item')!;
    firstItem.click();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0]![0].detail).toEqual({ entityId: 'light.a' });
  });

  it('dispatches toggle-curve on eye-icon click', async () => {
    const el = makeLegend();
    await el.updateComplete;
    const spy = vi.fn();
    el.addEventListener('toggle-curve', spy);
    const eye = el.renderRoot.querySelector<SVGElement>('.eye-icon')!;
    eye.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0]![0].detail).toEqual({ entityId: 'light.a' });
  });

  it('stops propagation on eye click so select-curve is NOT fired', async () => {
    const el = makeLegend();
    await el.updateComplete;
    const selectSpy = vi.fn();
    const toggleSpy = vi.fn();
    el.addEventListener('select-curve', selectSpy);
    el.addEventListener('toggle-curve', toggleSpy);
    const eye = el.renderRoot.querySelector<SVGElement>('.eye-icon')!;
    eye.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
    expect(toggleSpy).toHaveBeenCalledTimes(1);
    expect(selectSpy).not.toHaveBeenCalled();
  });

  it('dispatches select-curve on item Enter key', async () => {
    const el = makeLegend();
    await el.updateComplete;
    const spy = vi.fn();
    el.addEventListener('select-curve', spy);
    const firstItem = el.renderRoot.querySelector<HTMLElement>('.legend-item')!;
    firstItem.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('dispatches select-curve on item Space key', async () => {
    const el = makeLegend();
    await el.updateComplete;
    const spy = vi.fn();
    el.addEventListener('select-curve', spy);
    const firstItem = el.renderRoot.querySelector<HTMLElement>('.legend-item')!;
    firstItem.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('moves focus with ArrowDown and ArrowUp', async () => {
    const el = makeLegend();
    await el.updateComplete;
    const items = el.renderRoot.querySelectorAll<HTMLElement>('.legend-item');
    const root = el.renderRoot as ShadowRoot;
    items[0]!.focus();
    items[0]!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(root.activeElement).toBe(items[1]);
    items[1]!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    expect(root.activeElement).toBe(items[0]);
  });

  it('dispatches toggle-curve on eye Enter/Space keys', async () => {
    const el = makeLegend();
    await el.updateComplete;
    const spy = vi.fn();
    el.addEventListener('toggle-curve', spy);
    const eye = el.renderRoot.querySelector<SVGElement>('.eye-icon')!;
    eye.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    eye.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('does not react to other keys on item', async () => {
    const el = makeLegend();
    await el.updateComplete;
    const spy = vi.fn();
    el.addEventListener('select-curve', spy);
    const firstItem = el.renderRoot.querySelector<HTMLElement>('.legend-item')!;
    firstItem.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    firstItem.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
    expect(spy).not.toHaveBeenCalled();
  });

  it('bubbles and composes select-curve across shadow boundary', async () => {
    const el = makeLegend();
    await el.updateComplete;
    const outerSpy = vi.fn();
    document.body.addEventListener('select-curve', outerSpy);
    const firstItem = el.renderRoot.querySelector<HTMLElement>('.legend-item')!;
    firstItem.click();
    expect(outerSpy).toHaveBeenCalledTimes(1);
    document.body.removeEventListener('select-curve', outerSpy);
  });

  it('bubbles and composes toggle-curve across shadow boundary', async () => {
    const el = makeLegend();
    await el.updateComplete;
    const outerSpy = vi.fn();
    document.body.addEventListener('toggle-curve', outerSpy);
    const eye = el.renderRoot.querySelector<SVGElement>('.eye-icon')!;
    eye.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
    expect(outerSpy).toHaveBeenCalledTimes(1);
    document.body.removeEventListener('toggle-curve', outerSpy);
  });

  it('omits aria-label on legend items — accessible name comes from descendant text', async () => {
    const el = makeLegend({ scrubberPosition: null });
    await el.updateComplete;
    const item = el.renderRoot.querySelector('.legend-item')!;
    expect(item.getAttribute('aria-label')).toBeNull();
    expect(item.textContent).toContain('Alpha');
  });

  it('includes sampled brightness in accessible name when scrubber is active', async () => {
    const curve: LightCurve = {
      entityId: 'light.a',
      friendlyName: 'Alpha',
      controlPoints: [
        { lightener: 0, target: 0 },
        { lightener: 100, target: 100 },
      ],
      visible: true,
      color: '#2563eb',
    };
    const el = makeLegend({ curves: [curve], scrubberPosition: 50 });
    await el.updateComplete;
    const item = el.renderRoot.querySelector('.legend-item')!;
    expect(item.getAttribute('aria-label')).toBeNull();
    const expectedPct = Math.round(sampleCurveAt(curve.controlPoints, 50));
    expect(item.textContent).toContain(`${expectedPct}%`);
    expect(item.textContent).toContain('Alpha');
  });
});
