import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PreviewController, type PreviewControllerHost } from './preview-controller.js';
import type { ControlPoint, Hass, LightCurve } from './types.js';

const LINEAR: ControlPoint[] = [
  { lightener: 0, target: 0 },
  { lightener: 100, target: 100 },
];

function makeCurve(entityId: string, points: ControlPoint[] = LINEAR): LightCurve {
  return { entityId, friendlyName: entityId, controlPoints: points, visible: true, color: '#fff' };
}

type MockHass = Hass & { callService: ReturnType<typeof vi.fn> };

function makeHass(states: Hass['states'] = {}): MockHass {
  return {
    user: { is_admin: true },
    callWS: vi.fn(),
    callApi: vi.fn(),
    callService: vi.fn().mockResolvedValue(undefined),
    states,
  } as unknown as MockHass;
}

interface TestHost extends PreviewControllerHost {
  hass: Hass | null;
  curves: LightCurve[];
  storageEntityId: string | undefined;
  scrubber: number | null;
  previewActive: boolean;
  persisted: Array<[string, number]>;
}

function makeHost(hass: Hass | null, curves: LightCurve[] = []): TestHost {
  const host: TestHost = {
    hass,
    curves,
    storageEntityId: 'light.group',
    scrubber: null,
    previewActive: false,
    persisted: [],
    getHass: () => host.hass,
    getCurves: () => host.curves,
    getScrubberPosition: () => host.scrubber,
    setScrubberPosition: (p: number) => {
      host.scrubber = p;
    },
    getStorageEntityId: () => host.storageEntityId,
    persistScrubberPosition: (e: string, p: number) => {
      host.persisted.push([e, p]);
    },
    setPreviewActive: (a: boolean) => {
      host.previewActive = a;
    },
  };
  return host;
}

// Drives requestAnimationFrame synchronously: each frame's callback is queued
// here and only runs when flushRaf() is called, so throttle/RAF tests can
// inspect state between scheduling and execution.
let rafQueue: FrameRequestCallback[] = [];
function flushRaf(): void {
  const cbs = rafQueue;
  rafQueue = [];
  cbs.forEach((cb) => cb(0));
}

beforeEach(() => {
  rafQueue = [];
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    rafQueue.push(cb);
    return rafQueue.length;
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('PreviewController — lifecycle', () => {
  it('start() is a no-op when hass is null', () => {
    const host = makeHost(null, [makeCurve('light.a')]);
    const ctrl = new PreviewController(host);
    ctrl.start();
    expect(ctrl.active).toBe(false);
    expect(host.previewActive).toBe(false);
  });

  it('start() activates, defaults the scrubber to 50, and persists it', () => {
    const host = makeHost(makeHass(), [makeCurve('light.a')]);
    const ctrl = new PreviewController(host);
    ctrl.start();
    expect(ctrl.active).toBe(true);
    expect(host.previewActive).toBe(true);
    expect(host.scrubber).toBe(50);
    expect(host.persisted).toContainEqual(['light.group', 50]);
  });

  it('start() keeps an existing scrubber position', () => {
    const host = makeHost(makeHass(), [makeCurve('light.a')]);
    host.scrubber = 20;
    const ctrl = new PreviewController(host);
    ctrl.start();
    expect(host.scrubber).toBe(20);
    expect(host.persisted).toHaveLength(0);
  });

  it('start() is a no-op when already active', () => {
    const host = makeHost(makeHass(), [makeCurve('light.a')]);
    const ctrl = new PreviewController(host);
    ctrl.start();
    host.persisted = [];
    host.scrubber = 80;
    ctrl.start();
    // Second start did not re-default the scrubber or re-persist.
    expect(host.scrubber).toBe(80);
    expect(host.persisted).toHaveLength(0);
  });

  it('stop() restores off / on-no-brightness / numeric brightness', () => {
    const hass = makeHass({
      'light.off': { state: 'off', attributes: {} },
      'light.on': { state: 'on', attributes: {} },
      'light.dim': { state: 'on', attributes: { brightness: 120 } },
    });
    const host = makeHost(hass, [
      makeCurve('light.off'),
      makeCurve('light.on'),
      makeCurve('light.dim'),
    ]);
    const ctrl = new PreviewController(host);
    ctrl.start();
    flushRaf();
    hass.callService.mockClear();

    ctrl.stop();
    expect(hass.callService).toHaveBeenCalledWith('light', 'turn_off', { entity_id: 'light.off' });
    expect(hass.callService).toHaveBeenCalledWith('light', 'turn_on', { entity_id: 'light.on' });
    expect(hass.callService).toHaveBeenCalledWith('light', 'turn_on', {
      entity_id: 'light.dim',
      brightness: 120,
    });
  });

  it('stop() with a null hass still deactivates and stays restartable (C3 regression)', () => {
    const hass = makeHass();
    const host = makeHost(hass, [makeCurve('light.a')]);
    const ctrl = new PreviewController(host);
    ctrl.start();
    expect(ctrl.active).toBe(true);

    // hass disappears (card lost its hass), then preview stops.
    host.hass = null;
    ctrl.stop();
    expect(ctrl.active).toBe(false);
    expect(host.previewActive).toBe(false);

    // The controller must be restartable once hass returns.
    host.hass = hass;
    ctrl.start();
    expect(ctrl.active).toBe(true);
  });

  it('disconnect() with a null hass still deactivates (C3 regression)', () => {
    const hass = makeHass();
    const host = makeHost(hass, [makeCurve('light.a')]);
    const ctrl = new PreviewController(host);
    ctrl.start();

    host.hass = null;
    ctrl.disconnect();
    expect(ctrl.active).toBe(false);
    expect(host.previewActive).toBe(false);
  });

  it('stop() is a no-op when the controller is not active', () => {
    const hass = makeHass();
    const ctrl = new PreviewController(makeHost(hass, [makeCurve('light.a')]));
    expect(() => ctrl.stop()).not.toThrow();
    expect(hass.callService).not.toHaveBeenCalled();
  });
});

describe('PreviewController — throttle / RAF / dedupe', () => {
  it('start() pushes brightness to every visible curve on the first frame', () => {
    const hass = makeHass();
    const host = makeHost(hass, [makeCurve('light.a'), makeCurve('light.b')]);
    new PreviewController(host).start();
    flushRaf();
    // Scrubber defaults to 50 -> linear curve -> brightness 128.
    expect(hass.callService).toHaveBeenCalledWith('light', 'turn_on', {
      entity_id: 'light.a',
      brightness: 128,
    });
    expect(hass.callService).toHaveBeenCalledWith('light', 'turn_on', {
      entity_id: 'light.b',
      brightness: 128,
    });
  });

  it('coalesces rapid previewLights() calls behind a single trailing update', () => {
    vi.useFakeTimers();
    const hass = makeHass();
    const host = makeHost(hass, [makeCurve('light.a')]);
    const ctrl = new PreviewController(host);
    ctrl.start();
    flushRaf();
    hass.callService.mockClear();

    // A call within the throttle interval schedules a trailing timer only —
    // no immediate frame, no service call yet.
    ctrl.previewLights(90);
    expect(rafQueue).toHaveLength(0);
    expect(hass.callService).not.toHaveBeenCalled();

    // After the interval elapses the trailing update runs.
    vi.advanceTimersByTime(300);
    flushRaf();
    expect(hass.callService).toHaveBeenCalledWith('light', 'turn_on', {
      entity_id: 'light.a',
      brightness: 230,
    });
  });

  it('does not re-send an unchanged brightness', () => {
    vi.useFakeTimers();
    const hass = makeHass();
    const host = makeHost(hass, [makeCurve('light.a')]);
    const ctrl = new PreviewController(host);
    ctrl.start();
    flushRaf();
    hass.callService.mockClear();

    // Same position again -> same brightness -> deduped away.
    vi.advanceTimersByTime(300);
    ctrl.previewLights(50);
    flushRaf();
    expect(hass.callService).not.toHaveBeenCalled();
  });

  it('turns a light off when the curve samples to zero brightness', () => {
    const hass = makeHass();
    const host = makeHost(hass, [makeCurve('light.a')]);
    const ctrl = new PreviewController(host);
    ctrl.start();
    flushRaf();
    hass.callService.mockClear();

    ctrl.previewLights(0, true);
    flushRaf();
    expect(hass.callService).toHaveBeenCalledWith('light', 'turn_off', { entity_id: 'light.a' });
  });

  it('a frame scheduled before stop() does nothing when it later runs', () => {
    const hass = makeHass();
    const host = makeHost(hass, [makeCurve('light.a')]);
    const ctrl = new PreviewController(host);
    ctrl.start();
    // A frame is pending from start(); stop() bumps the frame generation.
    ctrl.stop();
    hass.callService.mockClear();
    flushRaf();
    expect(hass.callService).not.toHaveBeenCalled();
  });

  it('skips hidden curves', () => {
    const hass = makeHass();
    const hidden = { ...makeCurve('light.hidden'), visible: false };
    const host = makeHost(hass, [makeCurve('light.shown'), hidden]);
    new PreviewController(host).start();
    flushRaf();
    const touched = hass.callService.mock.calls.map(
      (c) => (c[2] as { entity_id: string }).entity_id
    );
    expect(touched).toContain('light.shown');
    expect(touched).not.toContain('light.hidden');
  });

  it('refresh() re-applies the current position while active and is inert when inactive', () => {
    const hass = makeHass();
    const host = makeHost(hass, [makeCurve('light.a')]);
    const ctrl = new PreviewController(host);

    // Inactive: refresh is a no-op.
    ctrl.refresh(true);
    flushRaf();
    expect(hass.callService).not.toHaveBeenCalled();

    ctrl.start();
    flushRaf();
    hass.callService.mockClear();
    ctrl.refresh(true);
    flushRaf();
    expect(hass.callService).toHaveBeenCalled();
  });
});
