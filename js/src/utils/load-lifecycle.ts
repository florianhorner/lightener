/**
 * Pure state model for the curve-editor load lifecycle.
 *
 * Framework-free — no Lit, no DOM, no timers, no async. It captures the
 * curve-load state machine only: the seven flags that used to live as loose
 * fields on the Lit element. All side effects (the `lightener/get_curves`
 * WebSocket call, the `_tryLoadCurves` recursion, assigning `_curves`) stay in
 * the element; the element calls these functions, reassigns its `@state()
 * _load` field to the returned state, and acts on the returned decision tag.
 *
 * This mirrors `save-lifecycle.ts`: the element owns effects, the module owns
 * the branch decisions.
 *
 *   set hass()/entity change ──> clearForEntity ──> needsLoad? ──no──> idle
 *                                                       │ yes
 *                                                       v
 *                                                  beginLoad
 *                                                       │
 *                                          callWS lightener/get_curves
 *                                                       │
 *                            ┌──────────────────────────┼──────────────┐
 *                       resolveSuccess            resolveError     finishLoad
 *                    apply │ defer-dirty │       error │ discarded   followUp:
 *                    discard │ run-queued-reload                     reload-changed
 *                                                                  | run-queued-reload
 *                                                                  | none
 */

export interface LoadState {
  /** True once a load response (success or error) has been seen for the current entity. */
  loaded: boolean;
  /** Entity id of the last load that completed (success or error). */
  loadedEntityId?: string;
  /** Entity id that hit a load error — blocks re-request on re-mount. */
  loadErrorEntityId?: string;
  /** Entity id whose reload is deferred because the user has unsaved edits. */
  pendingReloadEntityId?: string;
  /** Entity id to reload once the in-flight load finishes. */
  reloadAfterLoadEntityId?: string;
  /** True while a `lightener/get_curves` request is in flight. */
  loading: boolean;
  /** Load error message, or null. */
  loadError: string | null;
}

export const INITIAL_LOAD_STATE: LoadState = {
  loaded: false,
  loading: false,
  loadError: null,
};

/**
 * Whether a fresh `lightener/get_curves` request should be issued.
 * False when the current entity is already loaded, or a load is in flight.
 */
export function needsLoad(s: LoadState, entityId: string | undefined): boolean {
  if (s.loaded && s.loadedEntityId === entityId) return false;
  if (s.loading) return false;
  return true;
}

/** Enter the loading phase: clear any prior error, mark the request in flight. */
export function beginLoad(s: LoadState): LoadState {
  return { ...s, loadError: null, loading: true };
}

export type ResolveSuccessAction = 'discard' | 'run-queued-reload' | 'defer-dirty' | 'apply';

/**
 * Classify a successful `lightener/get_curves` response.
 *  - `discard`            — entity changed while the request was in flight.
 *  - `run-queued-reload`  — a reload was queued for this entity; finishLoad runs it.
 *  - `defer-dirty`        — the user has unsaved edits; mark loaded but keep edits.
 *  - `apply`              — write the curves into the card.
 */
export function resolveSuccess(
  s: LoadState,
  requestedEntity: string,
  currentEntity: string | undefined,
  isDirty: boolean
): { state: LoadState; action: ResolveSuccessAction } {
  if (currentEntity !== requestedEntity) return { state: s, action: 'discard' };
  // Branch order is load-bearing: the queued-reload check MUST precede the
  // isDirty check. A queued reload re-fetches and the follow-up fetch re-runs
  // resolveSuccess, where isDirty is then honored — so edits still survive.
  // Reordering these would let a queued reload's response take the apply path
  // and overwrite unsaved edits. Keep `run-queued-reload` first.
  if (s.reloadAfterLoadEntityId === requestedEntity) {
    return { state: s, action: 'run-queued-reload' };
  }
  if (isDirty) {
    return {
      state: {
        ...s,
        pendingReloadEntityId: requestedEntity,
        loaded: true,
        loadedEntityId: requestedEntity,
        loadErrorEntityId: undefined,
      },
      action: 'defer-dirty',
    };
  }
  return {
    state: {
      ...s,
      pendingReloadEntityId: undefined,
      loaded: true,
      loadedEntityId: requestedEntity,
      loadErrorEntityId: undefined,
    },
    action: 'apply',
  };
}

/**
 * Classify a failed `lightener/get_curves` response. `discarded` is true when
 * the entity changed mid-flight — the caller should ignore the error.
 */
export function resolveError(
  s: LoadState,
  requestedEntity: string,
  currentEntity: string | undefined,
  message: string
): { state: LoadState; discarded: boolean } {
  if (currentEntity !== requestedEntity) return { state: s, discarded: true };
  return {
    state: {
      ...s,
      loadError: message,
      loaded: true,
      loadedEntityId: requestedEntity,
      loadErrorEntityId: requestedEntity,
    },
    discarded: false,
  };
}

export type FinishFollowUp = 'reload-changed-entity' | 'run-queued-reload' | 'none';

/**
 * Clear the in-flight flag and decide the post-load follow-up:
 *  - `reload-changed-entity` — entity changed mid-flight; load the new one.
 *  - `run-queued-reload`     — a reload was queued for this entity; run it.
 *  - `none`                  — done.
 */
export function finishLoad(
  s: LoadState,
  requestedEntity: string,
  currentEntity: string | undefined
): { state: LoadState; followUp: FinishFollowUp } {
  const cleared: LoadState = { ...s, loading: false };
  if (currentEntity !== requestedEntity) {
    return { state: cleared, followUp: 'reload-changed-entity' };
  }
  if (s.reloadAfterLoadEntityId === requestedEntity) {
    return {
      state: { ...cleared, reloadAfterLoadEntityId: undefined, loaded: false },
      followUp: 'run-queued-reload',
    };
  }
  return { state: cleared, followUp: 'none' };
}

/** Reset load flags so the next `_tryLoadCurves` re-requests (the "Retry" link). */
export function retryLoad(s: LoadState): LoadState {
  return {
    ...s,
    loaded: false,
    loadError: null,
    loadErrorEntityId: undefined,
    pendingReloadEntityId: undefined,
    reloadAfterLoadEntityId: undefined,
  };
}

/**
 * Request a reload of `entityId`. `runNow` is true when the caller should fire
 * `_tryLoadCurves` immediately; false when a load is in flight and the reload
 * has been queued instead.
 */
export function queueReload(s: LoadState, entityId: string): { state: LoadState; runNow: boolean } {
  const cleared: LoadState = { ...s, loaded: false };
  if (cleared.loading) {
    return { state: { ...cleared, reloadAfterLoadEntityId: entityId }, runNow: false };
  }
  return { state: cleared, runNow: true };
}

/**
 * Take a dirty-deferred reload if one is pending for the current entity.
 * `reloadEntityId` is set when the caller should now queue that reload.
 */
export function takePendingDirtyReload(
  s: LoadState,
  currentEntity: string | undefined
): { state: LoadState; reloadEntityId?: string } {
  const entityId = s.pendingReloadEntityId;
  if (!entityId || entityId !== currentEntity) return { state: s };
  return { state: { ...s, pendingReloadEntityId: undefined }, reloadEntityId: entityId };
}

/**
 * Full reset for an entity switch (`setConfig`): forget every entity-scoped
 * marker so the new entity loads cleanly.
 */
export function clearForEntity(s: LoadState): LoadState {
  return {
    ...s,
    loaded: false,
    loadedEntityId: undefined,
    loadErrorEntityId: undefined,
    pendingReloadEntityId: undefined,
    reloadAfterLoadEntityId: undefined,
  };
}

/**
 * Partial reset used on re-mount (`connectedCallback`): drop only the loaded
 * flag so data refreshes, while preserving `loadErrorEntityId` so a
 * misconfigured entity is not re-requested (and the HA log not re-spammed).
 */
export function clearLoadedFlag(s: LoadState): LoadState {
  return { ...s, loaded: false, loadedEntityId: undefined };
}

export function isLoaded(s: LoadState): boolean {
  return s.loaded;
}

export function isLoading(s: LoadState): boolean {
  return s.loading;
}

export function loadErrorMessage(s: LoadState): string | null {
  return s.loadError;
}
