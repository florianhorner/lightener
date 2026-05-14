/**
 * Pure reducer for the curve-editor save lifecycle.
 *
 * The reducer is framework-free — no Lit, no DOM, no timers. It captures the
 * UI feedback state machine only: idle / dirty / saving / confirming / saved / error.
 * All side effects (RPC call, RAF cancel animation, success timer,
 * entity-switch guard) live in the Lit element; the element dispatches
 * actions into `reduce` and reads the resulting state out.
 *
 * Semantics are conservative so the existing behaviour is preserved:
 *   - A `dirty` action does not override a visible `saved` or `error` banner.
 *     The banner clears when its effect completes (success timer fires → the
 *     element dispatches `save-clear`, or the user clicks save → `save-start`).
 *   - `save-start` is accepted from every non-saving phase so the user can
 *     re-save during the success-banner window, retry after an error, or
 *     trigger a programmatic save when the reducer has returned to idle
 *     (the pre-refactor `_onSave` had no dirty guard — this preserves that).
 *   - `save-success` transitions saving → confirming. The card awaits a
 *     post-save get_curves round-trip before dispatching `save-confirmed`.
 *   - `isSaving()` returns true for both saving and confirming so controls
 *     stay disabled until the backend state is confirmed.
 */

export type SaveState =
  | { phase: 'idle' }
  | { phase: 'dirty' }
  | { phase: 'saving' }
  | { phase: 'confirming' }
  | { phase: 'saved' }
  | { phase: 'error'; message: string };

export type SaveAction =
  | { type: 'dirty' }
  | { type: 'save-start' }
  | { type: 'save-success' }
  | { type: 'save-confirmed' }
  | { type: 'save-error'; message: string }
  | { type: 'save-clear' }
  | { type: 'reset' };

export const INITIAL_SAVE_STATE: SaveState = { phase: 'idle' };

export function reduce(state: SaveState, action: SaveAction): SaveState {
  switch (action.type) {
    case 'reset':
      return { phase: 'idle' };

    case 'dirty':
      if (state.phase === 'idle') return { phase: 'dirty' };
      return state;

    case 'save-start':
      if (state.phase === 'saving' || state.phase === 'confirming') return state;
      return { phase: 'saving' };

    case 'save-success':
      if (state.phase !== 'saving') return state;
      return { phase: 'confirming' };

    case 'save-confirmed':
      if (state.phase !== 'confirming') return state;
      return { phase: 'saved' };

    case 'save-error':
      if (state.phase !== 'saving' && state.phase !== 'confirming') return state;
      return { phase: 'error', message: action.message };

    case 'save-clear':
      if (state.phase === 'saved' || state.phase === 'error') {
        return { phase: 'idle' };
      }
      return state;
  }
}

export function isSaving(state: SaveState): boolean {
  return state.phase === 'saving' || state.phase === 'confirming';
}

export function isSaved(state: SaveState): boolean {
  return state.phase === 'saved';
}

export function errorMessage(state: SaveState): string | null {
  return state.phase === 'error' ? state.message : null;
}
