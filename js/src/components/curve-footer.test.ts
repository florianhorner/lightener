// @vitest-environment jsdom

import { beforeAll, describe, expect, it, vi } from 'vitest';
import type { CurveFooter } from './curve-footer.js';

beforeAll(async () => {
  await import('./curve-footer.js');
});

function makeFooter(opts?: {
  dirty?: boolean;
  readOnly?: boolean;
  saving?: boolean;
  canUndo?: boolean;
}): CurveFooter {
  const el = document.createElement('curve-footer') as CurveFooter;
  el.dirty = opts?.dirty ?? false;
  el.readOnly = opts?.readOnly ?? false;
  el.saving = opts?.saving ?? false;
  el.canUndo = opts?.canUndo ?? false;
  document.body.appendChild(el);
  return el;
}

describe('curve-footer — render states', () => {
  it('renders nothing when clean and canUndo=false', async () => {
    const el = makeFooter();
    await el.updateComplete;
    expect(el.renderRoot.querySelector('.footer')).toBeNull();
  });

  it('renders read-only view when readOnly=true', async () => {
    const el = makeFooter({ readOnly: true, dirty: true });
    await el.updateComplete;
    const readOnly = el.renderRoot.querySelector('.read-only');
    expect(readOnly).not.toBeNull();
    expect(readOnly?.textContent?.trim()).toContain('View only');
    expect(el.renderRoot.querySelector('.btn-save')).toBeNull();
    expect(el.renderRoot.querySelector('.btn-ghost')).toBeNull();
  });

  it('renders footer when dirty=true', async () => {
    const el = makeFooter({ dirty: true });
    await el.updateComplete;
    expect(el.renderRoot.querySelector('.footer')).not.toBeNull();
    expect(el.renderRoot.querySelector('.btn-save')).not.toBeNull();
  });

  it('renders footer when canUndo=true but not dirty', async () => {
    const el = makeFooter({ canUndo: true });
    await el.updateComplete;
    expect(el.renderRoot.querySelector('.footer')).not.toBeNull();
    expect(el.renderRoot.querySelector('.btn-undo')).not.toBeNull();
  });

  it('shows "Unsaved changes" label when dirty and NOT canUndo', async () => {
    const el = makeFooter({ dirty: true, canUndo: false });
    await el.updateComplete;
    const label = el.renderRoot.querySelector('.unsaved-label');
    expect(label?.textContent?.trim()).toBe('Unsaved changes');
    expect(el.renderRoot.querySelector('.btn-undo')).toBeNull();
  });

  it('shows Undo button when canUndo=true (replacing unsaved label)', async () => {
    const el = makeFooter({ dirty: true, canUndo: true });
    await el.updateComplete;
    expect(el.renderRoot.querySelector('.btn-undo')).not.toBeNull();
    expect(el.renderRoot.querySelector('.unsaved-label')).toBeNull();
  });
});

describe('curve-footer — save button', () => {
  it('says "Save" when not saving', async () => {
    const el = makeFooter({ dirty: true });
    await el.updateComplete;
    const btn = el.renderRoot.querySelector<HTMLButtonElement>('.btn-save')!;
    expect(btn.textContent?.trim()).toBe('Save');
    expect(btn.disabled).toBe(false);
  });

  it('says "Saving..." and is disabled when saving=true', async () => {
    const el = makeFooter({ dirty: true, saving: true });
    await el.updateComplete;
    const btn = el.renderRoot.querySelector<HTMLButtonElement>('.btn-save')!;
    expect(btn.textContent?.trim()).toBe('Saving...');
    expect(btn.disabled).toBe(true);
  });

  it('dispatches save-curves on click', async () => {
    const el = makeFooter({ dirty: true });
    await el.updateComplete;
    const spy = vi.fn();
    el.addEventListener('save-curves', spy);
    el.renderRoot.querySelector<HTMLButtonElement>('.btn-save')!.click();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('bubbles and composes save-curves across shadow boundary', async () => {
    const el = makeFooter({ dirty: true });
    await el.updateComplete;
    const outer = vi.fn();
    document.body.addEventListener('save-curves', outer);
    el.renderRoot.querySelector<HTMLButtonElement>('.btn-save')!.click();
    expect(outer).toHaveBeenCalledTimes(1);
    document.body.removeEventListener('save-curves', outer);
  });
});

describe('curve-footer — cancel button', () => {
  it('dispatches cancel-curves on click', async () => {
    const el = makeFooter({ dirty: true });
    await el.updateComplete;
    const spy = vi.fn();
    el.addEventListener('cancel-curves', spy);
    const cancelBtn = [...el.renderRoot.querySelectorAll<HTMLButtonElement>('button')].find(
      (b) => b.getAttribute('aria-label') === 'Cancel changes (Esc)'
    );
    expect(cancelBtn).toBeDefined();
    cancelBtn!.click();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('is disabled when saving=true', async () => {
    const el = makeFooter({ dirty: true, saving: true });
    await el.updateComplete;
    const cancelBtn = [...el.renderRoot.querySelectorAll<HTMLButtonElement>('button')].find(
      (b) => b.getAttribute('aria-label') === 'Cancel changes (Esc)'
    );
    expect(cancelBtn?.disabled).toBe(true);
  });
});

describe('curve-footer — undo button', () => {
  it('dispatches undo-curves on click', async () => {
    const el = makeFooter({ dirty: true, canUndo: true });
    await el.updateComplete;
    const spy = vi.fn();
    el.addEventListener('undo-curves', spy);
    el.renderRoot.querySelector<HTMLButtonElement>('.btn-undo')!.click();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('is disabled when saving=true', async () => {
    const el = makeFooter({ dirty: true, canUndo: true, saving: true });
    await el.updateComplete;
    const undoBtn = el.renderRoot.querySelector<HTMLButtonElement>('.btn-undo')!;
    expect(undoBtn.disabled).toBe(true);
  });

  it('has accessible aria-label "Undo"', async () => {
    const el = makeFooter({ dirty: true, canUndo: true });
    await el.updateComplete;
    const undoBtn = el.renderRoot.querySelector<HTMLButtonElement>('.btn-undo')!;
    expect(undoBtn.getAttribute('aria-label')).toBe('Undo');
  });
});

describe('curve-footer — state transitions', () => {
  it('re-renders when dirty flips from false to true', async () => {
    const el = makeFooter();
    await el.updateComplete;
    expect(el.renderRoot.querySelector('.footer')).toBeNull();
    el.dirty = true;
    await el.updateComplete;
    expect(el.renderRoot.querySelector('.footer')).not.toBeNull();
  });

  it('re-renders when readOnly flips from true to false', async () => {
    const el = makeFooter({ readOnly: true });
    await el.updateComplete;
    expect(el.renderRoot.querySelector('.read-only')).not.toBeNull();
    el.readOnly = false;
    el.dirty = true;
    await el.updateComplete;
    expect(el.renderRoot.querySelector('.read-only')).toBeNull();
    expect(el.renderRoot.querySelector('.btn-save')).not.toBeNull();
  });

  it('re-renders when canUndo flips from false to true', async () => {
    const el = makeFooter({ dirty: true });
    await el.updateComplete;
    expect(el.renderRoot.querySelector('.btn-undo')).toBeNull();
    expect(el.renderRoot.querySelector('.unsaved-label')).not.toBeNull();
    el.canUndo = true;
    await el.updateComplete;
    expect(el.renderRoot.querySelector('.btn-undo')).not.toBeNull();
    expect(el.renderRoot.querySelector('.unsaved-label')).toBeNull();
  });
});
