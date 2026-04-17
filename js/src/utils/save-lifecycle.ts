/**
 * Pure reducer for the curve-editor save lifecycle.
 *
 * The reducer is framework-free — no Lit, no DOM, no timers. It captures the
 * UI feedback state machine only: idle / dirty / saving / saved / error.
 * All side effects (RPC call, RAF cancel animation, success timer,
 * entity-switch guard) live in the Lit element; the element dispatches
 * actions into `reduce` and reads the resulting state out.
 *
 * Semantics are conservative so the existing behaviour is preserved:
 *   - A `dirty` action does not override a visible `saved` or `error` banner.
 *     The banner clears when its effect completes (success timer fires → the
 *     element dispatches `save-clear`, or the user clicks save → `save-start`).
 *   - `save-start` is accepted from `dirty`, `saved`, and `error` so the user
 *     can re-save during the success-banner window or retry after an error.
 */

export type SaveState =
  | { phase: 'idle' }
  | { phase: 'dirty' }
  | { phase: 'saving' }
  | { phase: 'saved' }
  | { phase: 'error'; message: string };

export type SaveAction =
  | { type: 'dirty' }
  | { type: 'save-start' }
  | { type: 'save-success' }
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
      if (state.phase === 'idle' || state.phase === 'saving') return state;
      return { phase: 'saving' };

    case 'save-success':
      if (state.phase !== 'saving') return state;
      return { phase: 'saved' };

    case 'save-error':
      if (state.phase !== 'saving') return state;
      return { phase: 'error', message: action.message };

    case 'save-clear':
      if (state.phase === 'saved' || state.phase === 'error') {
        return { phase: 'idle' };
      }
      return state;
  }
}

export function isSaving(state: SaveState): boolean {
  return state.phase === 'saving';
}

export function isSaved(state: SaveState): boolean {
  return state.phase === 'saved';
}

export function errorMessage(state: SaveState): string | null {
  return state.phase === 'error' ? state.message : null;
}
