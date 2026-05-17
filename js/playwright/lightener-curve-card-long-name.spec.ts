import { expect, test } from '@playwright/test';

type LayoutReport = {
  documentWidth: number;
  viewportWidth: number;
  cardWidth: number;
  legendItems: number;
  curveLines: number;
  longNameTitles: {
    minTitleLength: number;
    uniqueTitles: number;
  };
  graphContracts: {
    editingLabelClipWidth: string | null;
    editingLabelClipPath: string | null;
    editingLabelText: string;
    hitCircleRadius: string | null;
    initialHint: string;
    selectedLegendItems: number;
  };
  failures: string[];
};

const WIDTHS = [320, 500, 700, 1100] as const;
const HEIGHT = 900;
const TOLERANCE_PX = 1;
const MOBILE_THRESHOLD = 500;

test.describe('20-light long-name curve card layout', () => {
  for (const width of WIDTHS) {
    test(`does not horizontally overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: HEIGHT });
      await page.goto('/js/playwright/fixtures/long-name-card.html');
      await page.evaluate(() => window.__LIGHTENER_CARD_READY__);

      const report = await page.evaluate<LayoutReport, number>(async (tolerance) => {
        const failures: string[] = [];
        const viewportWidth = document.documentElement.clientWidth;
        const card = document.querySelector('lightener-curve-card');
        const typedCard = card as
          | (HTMLElement & {
              renderRoot: ShadowRoot;
              updateComplete: Promise<unknown>;
            })
          | null;

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

        function normalizeText(text: string | null | undefined): string {
          return (text ?? '').replace(/\s+/g, ' ').trim();
        }

        function expectEllipsisStyles(label: string, element: Element): void {
          const style = window.getComputedStyle(element);
          if (style.whiteSpace !== 'nowrap') {
            failures.push(`${label} must use nowrap, got ${style.whiteSpace}`);
          }
          if (style.overflowX !== 'hidden' && style.overflow !== 'hidden') {
            failures.push(`${label} must hide overflow, got ${style.overflow}`);
          }
          if (style.textOverflow !== 'ellipsis') {
            failures.push(`${label} must use ellipsis, got ${style.textOverflow}`);
          }
        }

        if (!typedCard?.shadowRoot) {
          throw new Error('lightener-curve-card did not render a shadow root');
        }

        rect('card', typedCard);
        const legend = typedCard.shadowRoot.querySelector('curve-legend') as
          | (HTMLElement & { updateComplete: Promise<unknown> })
          | null;
        const graph = typedCard.shadowRoot.querySelector('curve-graph') as
          | (HTMLElement & { updateComplete: Promise<unknown> })
          | null;
        const scrubber = typedCard.shadowRoot.querySelector('curve-scrubber') as
          | (HTMLElement & { updateComplete: Promise<unknown> })
          | null;
        if (!legend?.shadowRoot || !graph?.shadowRoot || !scrubber?.shadowRoot) {
          throw new Error('curve-legend, curve-graph, and curve-scrubber must render shadow roots');
        }

        const initialHint = normalizeText(
          graph.shadowRoot.querySelector('.hint-select')?.textContent
        );

        scrubber.dispatchEvent(
          new CustomEvent('scrubber-move', {
            detail: { position: 50 },
            bubbles: true,
            composed: true,
          })
        );
        await Promise.all([
          typedCard.updateComplete,
          scrubber.updateComplete,
          legend.updateComplete,
          graph.updateComplete,
        ]);

        rect('curve-graph', graph);
        rect('curve-legend', legend);

        const legendPanel = legend.shadowRoot.querySelector('.legend-panel');
        const legendList = legend.shadowRoot.querySelector('.legend');
        if (legendPanel) rect('legend panel', legendPanel);
        if (legendList) rect('legend list', legendList);

        const legendItems = [...legend.shadowRoot.querySelectorAll('.legend-item')];
        const titles = legendItems.map(
          (item) => item.querySelector('.name')?.getAttribute('title') ?? ''
        );
        for (const [idx, item] of legendItems.entries()) {
          const itemBox = rect(`legend item ${idx + 1}`, item);
          for (const selector of [
            '.name-block',
            '.name',
            '.prefix',
            '.entity-id',
            '.brightness-value',
            '.eye-btn',
          ]) {
            const child = item.querySelector(selector);
            if (!child) continue;
            const childBox = rect(`legend item ${idx + 1} ${selector}`, child);
            if (childBox.right > itemBox.right + tolerance) {
              failures.push(`legend item ${idx + 1} ${selector} exceeds its row`);
            }
          }
        }

        const firstItem = legendItems[0] as HTMLElement | undefined;
        firstItem?.click();
        await typedCard.updateComplete;
        await legend.updateComplete;
        await graph.updateComplete;

        const nameBlock = legendItems[0]?.querySelector('.name-block');
        if (nameBlock && window.getComputedStyle(nameBlock).minWidth !== '0px') {
          failures.push('.name-block must have computed min-width 0px');
        }
        for (const selector of ['.name', '.prefix', '.entity-id']) {
          const sample = legendItems[0]?.querySelector(selector);
          if (sample) expectEllipsisStyles(selector, sample);
        }
        const brightnessValue = legendItems[0]?.querySelector('.brightness-value');
        if (brightnessValue) {
          expectEllipsisStyles('.brightness-value', brightnessValue);
          const minWidth = parseFloat(window.getComputedStyle(brightnessValue).minWidth);
          if (!Number.isFinite(minWidth) || minWidth < 34) {
            failures.push(`.brightness-value min-width ${minWidth} is less than 34px`);
          }
        } else {
          failures.push('brightness value did not render after setting scrubber position');
        }

        const curveLines = graph.shadowRoot.querySelectorAll('path.curve-line').length;
        const hitCircleRadius =
          graph.shadowRoot.querySelector('circle.hit-circle')?.getAttribute('r') ?? null;
        const editingLabel = graph.shadowRoot.querySelector('.editing-label');
        const editingLabelText = normalizeText(editingLabel?.textContent);
        const editingLabelClipPath = editingLabel?.getAttribute('clip-path') ?? null;
        const editingLabelClipWidth =
          graph.shadowRoot
            .querySelector('clipPath[id^="editing-label-clip"] rect')
            ?.getAttribute('width') ?? null;
        const selectedLegendItems =
          legend.shadowRoot.querySelectorAll('.legend-item.selected').length;

        // Re-read layout after all mutations so the overflow guard covers the
        // post-mutation DOM (scrubber active + editing state).
        const finalDocumentWidth = Math.max(
          document.documentElement.scrollWidth,
          document.body.scrollWidth
        );
        const finalCardWidth = typedCard.getBoundingClientRect().width;

        if (finalDocumentWidth > viewportWidth + tolerance) {
          failures.push(
            `document scrollWidth ${finalDocumentWidth} exceeds viewport ${viewportWidth}`
          );
        }
        if (finalCardWidth > viewportWidth + tolerance) {
          failures.push(`card width ${finalCardWidth.toFixed(2)} exceeds viewport ${viewportWidth}`);
        }

        return {
          documentWidth: finalDocumentWidth,
          viewportWidth,
          cardWidth: finalCardWidth,
          legendItems: legendItems.length,
          curveLines,
          longNameTitles: {
            minTitleLength: Math.min(...titles.map((title) => title.length)),
            uniqueTitles: new Set(titles).size,
          },
          graphContracts: {
            editingLabelClipWidth,
            editingLabelClipPath,
            editingLabelText,
            hitCircleRadius,
            initialHint,
            selectedLegendItems,
          },
          failures,
        };
      }, TOLERANCE_PX);

      expect(report.legendItems).toBe(20);
      expect(report.curveLines).toBe(20);
      expect(report.longNameTitles.minTitleLength).toBeGreaterThan(40);
      expect(report.longNameTitles.uniqueTitles).toBe(20);
      expect(report.graphContracts.initialHint).toContain(
        width <= MOBILE_THRESHOLD ? 'double-tap' : 'double-click'
      );
      expect(report.graphContracts.editingLabelClipWidth).not.toBeNull();
      expect(report.graphContracts.editingLabelClipPath).toContain('editing-label-clip-');
      expect(report.graphContracts.editingLabelText).toContain(
        'Living Room Overhead Ambient Controller Zone 001'
      );
      expect(report.graphContracts.hitCircleRadius).toBe(width <= MOBILE_THRESHOLD ? '28' : '22');
      expect(report.graphContracts.selectedLegendItems).toBe(1);
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
