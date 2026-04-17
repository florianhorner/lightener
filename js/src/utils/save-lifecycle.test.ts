import { describe, expect, it } from 'vitest';

import {
  INITIAL_SAVE_STATE,
  type SaveAction,
  type SaveState,
  errorMessage,
  isSaved,
  isSaving,
  reduce,
} from './save-lifecycle';

const idle: SaveState = { phase: 'idle' };
const dirty: SaveState = { phase: 'dirty' };
const saving: SaveState = { phase: 'saving' };
const saved: SaveState = { phase: 'saved' };
const errored: SaveState = { phase: 'error', message: 'Save failed.' };

describe('save-lifecycle reducer', () => {
  it('initial state is idle', () => {
    expect(INITIAL_SAVE_STATE).toEqual({ phase: 'idle' });
  });

  describe("action 'reset'", () => {
    const reset: SaveAction = { type: 'reset' };
    it.each<[string, SaveState]>([
      ['idle', idle],
      ['dirty', dirty],
      ['saving', saving],
      ['saved', saved],
      ['error', errored],
    ])('resets %s -> idle', (_label, from) => {
      expect(reduce(from, reset)).toEqual({ phase: 'idle' });
    });
  });

  describe("action 'dirty'", () => {
    const dirtyAction: SaveAction = { type: 'dirty' };

    it('idle -> dirty', () => {
      expect(reduce(idle, dirtyAction)).toEqual({ phase: 'dirty' });
    });

    it.each<[string, SaveState]>([
      ['dirty', dirty],
      ['saving', saving],
      ['saved', saved],
      ['error', errored],
    ])('preserves %s (no override of in-flight / visible banner)', (_label, from) => {
      expect(reduce(from, dirtyAction)).toBe(from);
    });
  });

  describe("action 'save-start'", () => {
    const start: SaveAction = { type: 'save-start' };

    it.each<[string, SaveState]>([
      ['dirty', dirty],
      ['saved', saved],
      ['error', errored],
    ])('%s -> saving', (_label, from) => {
      expect(reduce(from, start)).toEqual({ phase: 'saving' });
    });

    it.each<[string, SaveState]>([
      ['idle', idle],
      ['saving', saving],
    ])('ignores from %s', (_label, from) => {
      expect(reduce(from, start)).toBe(from);
    });
  });

  describe("action 'save-success'", () => {
    const success: SaveAction = { type: 'save-success' };

    it('saving -> saved', () => {
      expect(reduce(saving, success)).toEqual({ phase: 'saved' });
    });

    it.each<[string, SaveState]>([
      ['idle', idle],
      ['dirty', dirty],
      ['saved', saved],
      ['error', errored],
    ])('ignores from %s', (_label, from) => {
      expect(reduce(from, success)).toBe(from);
    });
  });

  describe("action 'save-error'", () => {
    const err: SaveAction = { type: 'save-error', message: 'Network down' };

    it('saving -> error with message', () => {
      expect(reduce(saving, err)).toEqual({
        phase: 'error',
        message: 'Network down',
      });
    });

    it.each<[string, SaveState]>([
      ['idle', idle],
      ['dirty', dirty],
      ['saved', saved],
      ['error', errored],
    ])('ignores from %s', (_label, from) => {
      expect(reduce(from, err)).toBe(from);
    });
  });

  describe("action 'save-clear'", () => {
    const clear: SaveAction = { type: 'save-clear' };

    it.each<[string, SaveState]>([
      ['saved', saved],
      ['error', errored],
    ])('%s -> idle', (_label, from) => {
      expect(reduce(from, clear)).toEqual({ phase: 'idle' });
    });

    it.each<[string, SaveState]>([
      ['idle', idle],
      ['dirty', dirty],
      ['saving', saving],
    ])('ignores from %s', (_label, from) => {
      expect(reduce(from, clear)).toBe(from);
    });
  });

  it('end-to-end happy path: idle -> dirty -> saving -> saved -> idle', () => {
    let s: SaveState = INITIAL_SAVE_STATE;
    s = reduce(s, { type: 'dirty' });
    expect(s).toEqual({ phase: 'dirty' });
    s = reduce(s, { type: 'save-start' });
    expect(s).toEqual({ phase: 'saving' });
    s = reduce(s, { type: 'save-success' });
    expect(s).toEqual({ phase: 'saved' });
    s = reduce(s, { type: 'save-clear' });
    expect(s).toEqual({ phase: 'idle' });
  });

  it('error recovery: dirty -> saving -> error -> saving -> saved', () => {
    let s: SaveState = dirty;
    s = reduce(s, { type: 'save-start' });
    s = reduce(s, { type: 'save-error', message: 'oops' });
    expect(s).toEqual({ phase: 'error', message: 'oops' });
    // Retry directly from error.
    s = reduce(s, { type: 'save-start' });
    expect(s).toEqual({ phase: 'saving' });
    s = reduce(s, { type: 'save-success' });
    expect(s).toEqual({ phase: 'saved' });
  });

  it('re-save during saved-banner window: saved -> saving', () => {
    let s: SaveState = saved;
    // User edits (no-op in saved), then clicks save before the timer fires.
    s = reduce(s, { type: 'dirty' });
    expect(s).toEqual(saved);
    s = reduce(s, { type: 'save-start' });
    expect(s).toEqual({ phase: 'saving' });
  });
});

describe('save-lifecycle selectors', () => {
  it('isSaving', () => {
    expect(isSaving(saving)).toBe(true);
    expect(isSaving(idle)).toBe(false);
    expect(isSaving(saved)).toBe(false);
  });

  it('isSaved', () => {
    expect(isSaved(saved)).toBe(true);
    expect(isSaved(idle)).toBe(false);
    expect(isSaved(errored)).toBe(false);
  });

  it('errorMessage', () => {
    expect(errorMessage(errored)).toBe('Save failed.');
    expect(errorMessage(idle)).toBeNull();
    expect(errorMessage(saving)).toBeNull();
  });
});
