import { describe, expect, it } from 'vitest';

import {
  INITIAL_LOAD_STATE,
  type LoadState,
  beginLoad,
  clearForEntity,
  clearLoadedFlag,
  finishLoad,
  isLoaded,
  isLoading,
  loadErrorMessage,
  needsLoad,
  queueReload,
  resolveError,
  resolveSuccess,
  retryLoad,
  takePendingDirtyReload,
} from './load-lifecycle';

const E = 'light.lightener';
const OTHER = 'light.other';

/** A loaded, idle state for `E`. */
const loadedFor = (entity: string): LoadState => ({
  loaded: true,
  loadedEntityId: entity,
  loading: false,
  loadError: null,
});

describe('load-lifecycle: needsLoad', () => {
  it('initial state needs a load', () => {
    expect(needsLoad(INITIAL_LOAD_STATE, E)).toBe(true);
  });

  it('does not load when the current entity is already loaded', () => {
    expect(needsLoad(loadedFor(E), E)).toBe(false);
  });

  it('loads when a different entity is now current', () => {
    expect(needsLoad(loadedFor(E), OTHER)).toBe(true);
  });

  it('does not load while a request is in flight', () => {
    expect(needsLoad({ ...INITIAL_LOAD_STATE, loading: true }, E)).toBe(false);
  });
});

describe('load-lifecycle: beginLoad', () => {
  it('sets loading and clears any prior error', () => {
    const s = beginLoad({ ...INITIAL_LOAD_STATE, loadError: 'boom' });
    expect(s.loading).toBe(true);
    expect(s.loadError).toBeNull();
  });
});

describe('load-lifecycle: resolveSuccess', () => {
  it('discards when the entity changed mid-flight', () => {
    const s = beginLoad(INITIAL_LOAD_STATE);
    const { state, action } = resolveSuccess(s, E, OTHER, false);
    expect(action).toBe('discard');
    expect(state).toBe(s);
  });

  it('signals run-queued-reload when a reload is queued for this entity', () => {
    const s: LoadState = { ...beginLoad(INITIAL_LOAD_STATE), reloadAfterLoadEntityId: E };
    const { state, action } = resolveSuccess(s, E, E, false);
    expect(action).toBe('run-queued-reload');
    expect(state).toBe(s);
  });

  it('defers when the user has unsaved edits', () => {
    const { state, action } = resolveSuccess(beginLoad(INITIAL_LOAD_STATE), E, E, true);
    expect(action).toBe('defer-dirty');
    expect(state.pendingReloadEntityId).toBe(E);
    expect(state.loaded).toBe(true);
    expect(state.loadedEntityId).toBe(E);
    expect(state.loadErrorEntityId).toBeUndefined();
  });

  it('applies when clean — clears the pending-reload marker', () => {
    const s: LoadState = { ...beginLoad(INITIAL_LOAD_STATE), pendingReloadEntityId: E };
    const { state, action } = resolveSuccess(s, E, E, false);
    expect(action).toBe('apply');
    expect(state.pendingReloadEntityId).toBeUndefined();
    expect(state.loaded).toBe(true);
    expect(state.loadedEntityId).toBe(E);
    expect(state.loadErrorEntityId).toBeUndefined();
  });
});

describe('load-lifecycle: resolveError', () => {
  it('discards when the entity changed mid-flight', () => {
    const s = beginLoad(INITIAL_LOAD_STATE);
    const { state, discarded } = resolveError(s, E, OTHER, 'boom');
    expect(discarded).toBe(true);
    expect(state).toBe(s);
  });

  it('records the error and marks the entity as errored', () => {
    const { state, discarded } = resolveError(beginLoad(INITIAL_LOAD_STATE), E, E, 'boom');
    expect(discarded).toBe(false);
    expect(state.loadError).toBe('boom');
    expect(state.loaded).toBe(true);
    expect(state.loadedEntityId).toBe(E);
    expect(state.loadErrorEntityId).toBe(E);
  });
});

describe('load-lifecycle: finishLoad', () => {
  it('always clears the loading flag', () => {
    const { state } = finishLoad({ ...INITIAL_LOAD_STATE, loading: true }, E, E);
    expect(state.loading).toBe(false);
  });

  it('follows up with reload-changed-entity when the entity changed mid-flight', () => {
    const { followUp } = finishLoad({ ...INITIAL_LOAD_STATE, loading: true }, E, OTHER);
    expect(followUp).toBe('reload-changed-entity');
  });

  it('follows up with run-queued-reload and resets loaded when a reload is queued', () => {
    const s: LoadState = { ...INITIAL_LOAD_STATE, loading: true, reloadAfterLoadEntityId: E };
    const { state, followUp } = finishLoad(s, E, E);
    expect(followUp).toBe('run-queued-reload');
    expect(state.reloadAfterLoadEntityId).toBeUndefined();
    expect(state.loaded).toBe(false);
  });

  it('follows up with none on a plain finished load', () => {
    const { followUp } = finishLoad({ ...INITIAL_LOAD_STATE, loading: true }, E, E);
    expect(followUp).toBe('none');
  });
});

describe('load-lifecycle: retryLoad', () => {
  it('clears loaded, error, and reload markers', () => {
    const s: LoadState = {
      loaded: true,
      loadedEntityId: E,
      loadErrorEntityId: E,
      pendingReloadEntityId: E,
      reloadAfterLoadEntityId: E,
      loading: false,
      loadError: 'boom',
    };
    const next = retryLoad(s);
    expect(next.loaded).toBe(false);
    expect(next.loadError).toBeNull();
    expect(next.loadErrorEntityId).toBeUndefined();
    expect(next.pendingReloadEntityId).toBeUndefined();
    expect(next.reloadAfterLoadEntityId).toBeUndefined();
  });
});

describe('load-lifecycle: queueReload', () => {
  it('runs now when no load is in flight', () => {
    const { state, runNow } = queueReload(loadedFor(E), E);
    expect(runNow).toBe(true);
    expect(state.loaded).toBe(false);
    expect(state.reloadAfterLoadEntityId).toBeUndefined();
  });

  it('queues for later when a load is in flight', () => {
    const { state, runNow } = queueReload({ ...beginLoad(INITIAL_LOAD_STATE) }, E);
    expect(runNow).toBe(false);
    expect(state.loaded).toBe(false);
    expect(state.reloadAfterLoadEntityId).toBe(E);
  });
});

describe('load-lifecycle: takePendingDirtyReload', () => {
  it('returns the entity and clears the marker when one is pending for the current entity', () => {
    const s: LoadState = { ...loadedFor(E), pendingReloadEntityId: E };
    const { state, reloadEntityId } = takePendingDirtyReload(s, E);
    expect(reloadEntityId).toBe(E);
    expect(state.pendingReloadEntityId).toBeUndefined();
  });

  it('is a no-op when nothing is pending', () => {
    const s = loadedFor(E);
    const { state, reloadEntityId } = takePendingDirtyReload(s, E);
    expect(reloadEntityId).toBeUndefined();
    expect(state).toBe(s);
  });

  it('is a no-op when the pending entity is not the current entity', () => {
    const s: LoadState = { ...loadedFor(E), pendingReloadEntityId: E };
    const { state, reloadEntityId } = takePendingDirtyReload(s, OTHER);
    expect(reloadEntityId).toBeUndefined();
    expect(state).toBe(s);
  });
});

describe('load-lifecycle: clearForEntity', () => {
  it('forgets every entity-scoped marker', () => {
    const s: LoadState = {
      loaded: true,
      loadedEntityId: E,
      loadErrorEntityId: E,
      pendingReloadEntityId: E,
      reloadAfterLoadEntityId: E,
      loading: false,
      loadError: null,
    };
    const next = clearForEntity(s);
    expect(next.loaded).toBe(false);
    expect(next.loadedEntityId).toBeUndefined();
    expect(next.loadErrorEntityId).toBeUndefined();
    expect(next.pendingReloadEntityId).toBeUndefined();
    expect(next.reloadAfterLoadEntityId).toBeUndefined();
  });
});

describe('load-lifecycle: clearLoadedFlag', () => {
  it('drops the loaded flag but preserves loadErrorEntityId', () => {
    const s: LoadState = { ...loadedFor(E), loadErrorEntityId: E };
    const next = clearLoadedFlag(s);
    expect(next.loaded).toBe(false);
    expect(next.loadedEntityId).toBeUndefined();
    expect(next.loadErrorEntityId).toBe(E);
  });
});

describe('load-lifecycle: selectors', () => {
  it('isLoaded / isLoading', () => {
    expect(isLoaded(loadedFor(E))).toBe(true);
    expect(isLoaded(INITIAL_LOAD_STATE)).toBe(false);
    expect(isLoading(beginLoad(INITIAL_LOAD_STATE))).toBe(true);
    expect(isLoading(INITIAL_LOAD_STATE)).toBe(false);
  });

  it('loadErrorMessage', () => {
    expect(loadErrorMessage({ ...INITIAL_LOAD_STATE, loadError: 'boom' })).toBe('boom');
    expect(loadErrorMessage(INITIAL_LOAD_STATE)).toBeNull();
  });
});

describe('load-lifecycle: end-to-end', () => {
  it('happy path: needsLoad -> beginLoad -> resolveSuccess(apply) -> finishLoad(none)', () => {
    let s = INITIAL_LOAD_STATE;
    expect(needsLoad(s, E)).toBe(true);
    s = beginLoad(s);
    const success = resolveSuccess(s, E, E, false);
    expect(success.action).toBe('apply');
    s = success.state;
    const fin = finishLoad(s, E, E);
    expect(fin.followUp).toBe('none');
    s = fin.state;
    expect(isLoaded(s)).toBe(true);
    expect(isLoading(s)).toBe(false);
    expect(needsLoad(s, E)).toBe(false);
  });

  it('dirty-defer then reload: edits survive, then takePendingDirtyReload re-fetches', () => {
    let s = beginLoad(INITIAL_LOAD_STATE);
    const success = resolveSuccess(s, E, E, true);
    expect(success.action).toBe('defer-dirty');
    s = success.state;
    s = finishLoad(s, E, E).state;
    // User saves/cancels -> now clean -> drain the deferred reload.
    const pending = takePendingDirtyReload(s, E);
    expect(pending.reloadEntityId).toBe(E);
    s = pending.state;
    const q = queueReload(s, E);
    expect(q.runNow).toBe(true);
  });
});
