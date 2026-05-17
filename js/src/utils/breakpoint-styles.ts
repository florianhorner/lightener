import { css, unsafeCSS } from 'lit';

import { MOBILE_BREAKPOINT_PX } from './breakpoints.js';

/**
 * Lit `css` fragment for the shared mobile-breakpoint media condition.
 * Use inside a static `css` block as: `` @media ${MOBILE_MEDIA} { ... } ``.
 *
 * `breakpoints.ts` stays framework-free (a plain number + string); this module
 * is the Lit-aware adapter so the `@media (max-width: …)` wrapper lives in one
 * place instead of being hand-written in every component.
 */
export const MOBILE_MEDIA = css`(max-width: ${unsafeCSS(MOBILE_BREAKPOINT_PX)}px)`;
