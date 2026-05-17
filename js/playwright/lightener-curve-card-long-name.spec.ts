import { expect, test } from '@playwright/test';

type LayoutReport = {
  documentWidth: number;
  viewportWidth: number;
  cardWidth: number;
  legendItems: number;
  curveLines: number;
  failures: string[];
};

const WIDTHS = [320, 1100] as const;
const HEIGHT = 900;
const TOLERANCE_PX = 1;

test.describe('20-light long-name curve card layout', () => {
  for (const width of WIDTHS) {
    test(`does not horizontally overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: HEIGHT });
      await page.goto('/js/playwright/fixtures/long-name-card.html');
      await page.evaluate(() => window.__LIGHTENER_CARD_READY__);

      const report = await page.evaluate<LayoutReport, number>((tolerance) => {
        const failures: string[] = [];
        const viewportWidth = document.documentElement.clientWidth;
        const documentWidth = Math.max(
          document.documentElement.scrollWidth,
          document.body.scrollWidth
        );
        const card = document.querySelector('lightener-curve-card');

        function rect(label: string, element: Element): DOMRect {
          const box = element.getBoundingClientRect();
          if (box.left < -tolerance || box.right > viewportWidth + tolerance) {
            failures.push(
              `${label} escapes viewport: left=${box.left.toFixed(2)} right=${box.right.toFixed(
                2
              )} viewport=${viewportWidth}`
            );
          }
          return box;
        }

        if (!card?.shadowRoot) {
          throw new Error('lightener-curve-card did not render a shadow root');
        }

        const cardBox = rect('card', card);
        const legend = card.shadowRoot.querySelector('curve-legend');
        const graph = card.shadowRoot.querySelector('curve-graph');
        if (!legend?.shadowRoot || !graph?.shadowRoot) {
          throw new Error('curve-legend and curve-graph must render shadow roots');
        }

        rect('curve-graph', graph);
        rect('curve-legend', legend);

        const legendPanel = legend.shadowRoot.querySelector('.legend-panel');
        const legendList = legend.shadowRoot.querySelector('.legend');
        if (legendPanel) rect('legend panel', legendPanel);
        if (legendList) rect('legend list', legendList);

        const legendItems = [...legend.shadowRoot.querySelectorAll('.legend-item')];
        for (const [idx, item] of legendItems.entries()) {
          const itemBox = rect(`legend item ${idx + 1}`, item);
          for (const selector of ['.name-block', '.name', '.prefix', '.entity-id', '.eye-btn']) {
            const child = item.querySelector(selector);
            if (!child) continue;
            const childBox = rect(`legend item ${idx + 1} ${selector}`, child);
            if (childBox.right > itemBox.right + tolerance) {
              failures.push(`legend item ${idx + 1} ${selector} exceeds its row`);
            }
          }
        }

        const curveLines = graph.shadowRoot.querySelectorAll('path.curve-line').length;
        if (documentWidth > viewportWidth + tolerance) {
          failures.push(`document scrollWidth ${documentWidth} exceeds viewport ${viewportWidth}`);
        }
        if (cardBox.width > viewportWidth + tolerance) {
          failures.push(`card width ${cardBox.width.toFixed(2)} exceeds viewport ${viewportWidth}`);
        }

        return {
          documentWidth,
          viewportWidth,
          cardWidth: cardBox.width,
          legendItems: legendItems.length,
          curveLines,
          failures,
        };
      }, TOLERANCE_PX);

      expect(report.legendItems).toBe(20);
      expect(report.curveLines).toBe(20);
      expect(report.failures).toEqual([]);
      expect(report.documentWidth).toBeLessThanOrEqual(report.viewportWidth + TOLERANCE_PX);
      expect(report.cardWidth).toBeLessThanOrEqual(report.viewportWidth + TOLERANCE_PX);
    });
  }
});

declare global {
  interface Window {
    __LIGHTENER_CARD_READY__: Promise<void>;
    __LIGHTENER_STRESS_FIXTURE__: unknown;
  }
}
