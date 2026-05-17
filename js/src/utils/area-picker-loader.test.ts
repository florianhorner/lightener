// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AreaPickerLoader } from './area-picker-loader.js';

describe('AreaPickerLoader', () => {
  let isConnected: () => boolean;
  let requestUpdate: ReturnType<typeof vi.fn>;

  function makeLoader(): AreaPickerLoader {
    return new AreaPickerLoader(isConnected, () => (requestUpdate as () => void)());
  }

  beforeEach(() => {
    isConnected = () => true;
    requestUpdate = vi.fn();
    vi.useFakeTimers();
  });

  afterEach(() => {
    delete (window as unknown as Record<string, unknown>).loadCardHelpers;
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('sets ready=true immediately when ha-area-picker is already registered', () => {
    vi.spyOn(customElements, 'get').mockReturnValue(class {} as CustomElementConstructor);

    const loader = makeLoader();
    loader.ensureLoaded();

    expect(loader.ready).toBe(true);
    expect(requestUpdate).not.toHaveBeenCalled();
  });

  it('kicks Home Assistant helper loaders before waiting for ha-area-picker', async () => {
    const loadCardHelpers = vi.fn().mockResolvedValue(undefined);
    const getConfigElement = vi.fn().mockResolvedValue(document.createElement('div'));
    (window as unknown as Record<string, unknown>).loadCardHelpers = loadCardHelpers;

    vi.spyOn(customElements, 'get').mockImplementation((name) => {
      if (name === 'hui-entities-card') {
        return class {
          static getConfigElement = getConfigElement;
        } as unknown as CustomElementConstructor;
      }
      return undefined;
    });
    vi.spyOn(customElements, 'whenDefined').mockReturnValue(new Promise(() => {}));

    const loader = makeLoader();
    loader.ensureLoaded();

    await vi.runAllTimersAsync();

    expect(loadCardHelpers).toHaveBeenCalled();
    expect(getConfigElement).toHaveBeenCalled();
  });

  it('sets ready=false and requests an update when ha-area-picker times out', async () => {
    vi.spyOn(customElements, 'get').mockReturnValue(undefined);
    vi.spyOn(customElements, 'whenDefined').mockReturnValue(new Promise(() => {}));

    const loader = makeLoader();
    loader.ensureLoaded();

    await vi.advanceTimersByTimeAsync(1600);

    expect(loader.ready).toBe(false);
    expect(requestUpdate).toHaveBeenCalled();
  });

  it('is idempotent — ensureLoaded() called twice only runs once', () => {
    const customGetSpy = vi.spyOn(customElements, 'get').mockReturnValue(undefined);
    vi.spyOn(customElements, 'whenDefined').mockReturnValue(new Promise(() => {}));

    const loader = makeLoader();
    loader.ensureLoaded();
    const countAfterFirst = customGetSpy.mock.calls.length;

    loader.ensureLoaded();
    // The second call is a no-op — call count must not grow.
    expect(customGetSpy.mock.calls.length).toBe(countAfterFirst);
  });

  it('sets ready=true and calls requestUpdate after the race resolves', async () => {
    let resolveWhenDefined!: () => void;
    const pickerCtor = class {} as CustomElementConstructor;
    vi.spyOn(customElements, 'get')
      .mockImplementationOnce(() => undefined)
      .mockImplementation((name) => (name === 'ha-area-picker' ? pickerCtor : undefined));
    vi.spyOn(customElements, 'whenDefined').mockReturnValue(
      new Promise<CustomElementConstructor>((resolve) => {
        resolveWhenDefined = () => resolve(pickerCtor);
      })
    );

    const loader = makeLoader();
    loader.ensureLoaded();

    resolveWhenDefined();
    await vi.runAllTimersAsync();

    expect(loader.ready).toBe(true);
    expect(requestUpdate).toHaveBeenCalled();
  });

  it('does not call requestUpdate after timeout when component is disconnected', async () => {
    isConnected = () => false;
    vi.spyOn(customElements, 'get').mockReturnValue(undefined);
    vi.spyOn(customElements, 'whenDefined').mockReturnValue(new Promise(() => {}));

    const loader = makeLoader();
    loader.ensureLoaded();

    await vi.advanceTimersByTimeAsync(1600);

    expect(loader.ready).toBe(false);
    expect(requestUpdate).not.toHaveBeenCalled();
  });

  it('upgrades to ready via late-registration whenDefined after timeout', async () => {
    let resolveAfterTimeout!: () => void;
    const whenDefinedPromise = new Promise<CustomElementConstructor>((resolve) => {
      resolveAfterTimeout = () => resolve(class {} as CustomElementConstructor);
    });

    vi.spyOn(customElements, 'get').mockReturnValue(undefined);
    vi.spyOn(customElements, 'whenDefined').mockReturnValue(whenDefinedPromise);

    const loader = makeLoader();
    loader.ensureLoaded();

    // Advance past the 1500ms timeout so we enter the fallback path.
    await vi.advanceTimersByTimeAsync(1600);
    expect(loader.ready).toBe(false);
    const firstCallCount = requestUpdate.mock.calls.length;

    // The picker registers late — the inner whenDefined callback fires.
    resolveAfterTimeout();
    await vi.runAllTimersAsync();

    expect(loader.ready).toBe(true);
    expect(requestUpdate.mock.calls.length).toBeGreaterThan(firstCallCount);
  });

  it('still flips ready on late registration but skips requestUpdate when disconnected', async () => {
    let connected = true;
    isConnected = () => connected;

    let resolveAfterTimeout!: () => void;
    const whenDefinedPromise = new Promise<CustomElementConstructor>((resolve) => {
      resolveAfterTimeout = () => resolve(class {} as CustomElementConstructor);
    });

    vi.spyOn(customElements, 'get').mockReturnValue(undefined);
    vi.spyOn(customElements, 'whenDefined').mockReturnValue(whenDefinedPromise);

    const loader = makeLoader();
    loader.ensureLoaded();

    await vi.advanceTimersByTimeAsync(1600);
    expect(loader.ready).toBe(false);
    const callCountAtTimeout = requestUpdate.mock.calls.length;

    // Component disconnects before the late whenDefined fires.
    connected = false;
    resolveAfterTimeout();
    await vi.runAllTimersAsync();

    // AreaPickerLoader flips `ready` regardless of connection — only the
    // requestUpdate flush is guarded by isConnected().
    expect(loader.ready).toBe(true);
    expect(requestUpdate.mock.calls.length).toBe(callCountAtTimeout);
  });
});
