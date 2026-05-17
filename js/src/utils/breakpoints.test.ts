import { describe, expect, it } from 'vitest';
import { MOBILE_BREAKPOINT_MEDIA_QUERY, MOBILE_BREAKPOINT_PX } from './breakpoints.js';
import { CurveGraph } from '../components/curve-graph.js';
import { CurveLegend } from '../components/curve-legend.js';
import { CurveScrubber } from '../components/curve-scrubber.js';
import { CurveFooter } from '../components/curve-footer.js';

describe('responsive breakpoints', () => {
  it('uses one shared mobile breakpoint value for component CSS and matchMedia', () => {
    expect(MOBILE_BREAKPOINT_PX).toBe(500);
    expect(MOBILE_BREAKPOINT_MEDIA_QUERY).toBe('(max-width: 500px)');
  });

  it('does not keep the old 499px preset-grid breakpoint in component styles', () => {
    const cssText = [
      CurveGraph.styles.cssText,
      CurveLegend.styles.cssText,
      CurveScrubber.styles.cssText,
      CurveFooter.styles.cssText,
    ].join('\n');

    expect(cssText).toContain('@media (max-width: 500px)');
    expect(cssText).not.toContain('@media (max-width: 499px)');
  });
});
