import { expect, test } from '@playwright/test';

type LayoutReport = {
  mode: FixtureMode;
  documentWidth: number;
  viewportWidth: number;
  cardWidth: number;
  embedded: boolean;
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
    graphSvgMaxHeight: string | null;
    graphRenderedHeight: number;
  };
  sidebarContracts: {
    columnCount: number | null;
    footerBeforeSideRail: boolean | null;
  };
  failures: string[];
};

type FixtureMode = 'standalone' | 'lovelace' | 'sidebar';

const WIDTHS = [320, 500, 700, 1100] as const;
const MODES: FixtureMode[] = ['standalone', 'lovelace', 'sidebar'];
const HEIGHT = 900;
const TOLERANCE_PX = 1;
const MOBILE_THRESHOLD = 500;

test.describe('20-light long-name curve card layout', () => {
  for (const mode of MODES) {
    for (const width of WIDTHS) {
      test(`${mode} mode does not horizontally overflow at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: HEIGHT });
        await page.goto(`/js/playwright/fixtures/long-name-card.html?mode=${mode}`);
        await page.evaluate(() => window.__LIGHTENER_CARD_READY__);

        const report = await page.evaluate<
          LayoutReport,
          { mode: FixtureMode; tolerance: number; width: number }
        >(
          async ({ mode, tolerance, width }) => {
            const failures: string[] = [];
            const viewportWidth = document.documentElement.clientWidth;
            const card = window.__LIGHTENER_CARD_ELEMENT__;
            const panel = window.__LIGHTENER_PANEL_ELEMENT__;
            const typedCard = card as
              | (HTMLElement & {
                  renderRoot: ShadowRoot;
                  updateComplete: Promise<unknown>;
                })
              | null;

            function rect(label: string, element: Element, container?: DOMRect): DOMRect {
              const box = element.getBoundingClientRect();
              if (box.left < -tolerance || box.right > viewportWidth + tolerance) {
                failures.push(
                  `${label} escapes viewport: left=${box.left.toFixed(2)} right=${box.right.toFixed(
                    2
                  )} viewport=${viewportWidth}`
                );
              }
              if (container) {
                if (
                  box.left < container.left - tolerance ||
                  box.right > container.right + tolerance
                ) {
                  failures.push(
                    `${label} escapes container: left=${box.left.toFixed(
                      2
                    )} right=${box.right.toFixed(2)} containerLeft=${container.left.toFixed(
                      2
                    )} containerRight=${container.right.toFixed(2)}`
                  );
                }
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

            if (mode === 'sidebar') {
              if (!panel?.shadowRoot?.querySelector('#card-mount')) {
                failures.push('sidebar mode must mount the card through lightener-editor-panel');
              }
            } else if (panel) {
              failures.push(`${mode} mode should not create lightener-editor-panel`);
            }

            const cardBox = rect('card', typedCard);
            const cardFrame = typedCard.shadowRoot.querySelector('.card');
            if (!cardFrame) throw new Error('card frame did not render');
            const embedded = cardFrame.classList.contains('embedded');
            if (embedded !== (mode === 'sidebar')) {
              failures.push(`embedded=${embedded} in ${mode} mode`);
            }

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
              throw new Error(
                'curve-legend, curve-graph, and curve-scrubber must render shadow roots'
              );
            }

            const graphPanel = typedCard.shadowRoot.querySelector('.graph-panel');
            const mainStack = typedCard.shadowRoot.querySelector('.main-stack');
            const sideRail = typedCard.shadowRoot.querySelector('.side-rail');
            const footerSlot = typedCard.shadowRoot.querySelector('.footer-slot');
            const workspace = typedCard.shadowRoot.querySelector('.workspace');
            if (!graphPanel || !mainStack || !sideRail || !footerSlot || !workspace) {
              throw new Error('card layout regions did not render');
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
            graph.dispatchEvent(
              new CustomEvent('point-move', {
                detail: { curveIndex: 0, pointIndex: 1, lightener: 100, target: 95 },
                bubbles: true,
                composed: true,
              })
            );
            graph.dispatchEvent(
              new CustomEvent('point-drop', {
                detail: { curveIndex: 0, pointIndex: 1 },
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

            const graphPanelBox = rect('graph panel', graphPanel, cardBox);
            const mainStackBox = rect('main stack', mainStack, cardBox);
            const sideRailBox = rect('side rail', sideRail, cardBox);
            const footerSlotBox = rect('footer slot', footerSlot, cardBox);
            rect('curve-graph', graph, graphPanelBox);
            rect('curve-legend', legend, sideRailBox);
            rect('curve-scrubber', scrubber, mainStackBox);
            const footer = typedCard.shadowRoot.querySelector('curve-footer') as
              | (HTMLElement & { shadowRoot: ShadowRoot | null })
              | null;
            if (!footer?.shadowRoot) {
              throw new Error('curve-footer must render a shadow root');
            }
            rect('curve-footer', footer, footerSlotBox);
            const footerInner = footer.shadowRoot.querySelector('.footer');
            if (!footerInner) {
              failures.push('footer controls did not render after dirtying the card');
            } else {
              rect('footer controls', footerInner, footer.getBoundingClientRect());
            }

            const legendPanel = legend.shadowRoot.querySelector('.legend-panel');
            const legendList = legend.shadowRoot.querySelector('.legend');
            if (legendPanel) rect('legend panel', legendPanel, legend.getBoundingClientRect());
            if (legendList) rect('legend list', legendList, legend.getBoundingClientRect());

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

            const firstEntityId =
              legendItems[0]?.querySelector('.entity-id')?.getAttribute('title') ?? null;
            if (!firstEntityId) {
              failures.push('first legend item did not expose an entity-id title');
            } else {
              (
                typedCard as HTMLElement & {
                  _selectedCurveId: string;
                  requestUpdate: () => void;
                }
              )._selectedCurveId = firstEntityId;
              (
                typedCard as HTMLElement & {
                  requestUpdate: () => void;
                }
              ).requestUpdate();
            }
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
            // Embedded (sidebar) mode no longer overrides the graph height vars,
            // so every surface should fall through to the 320px component default
            // and render a non-collapsed graph.
            const graphSvg = graph.shadowRoot.querySelector('svg');
            const graphSvgMaxHeight = graphSvg
              ? window.getComputedStyle(graphSvg).maxHeight
              : null;
            const graphRenderedHeight = graphSvg
              ? graphSvg.getBoundingClientRect().height
              : 0;
            const workspaceStyle = window.getComputedStyle(workspace);
            const columnCount =
              mode === 'sidebar' && width >= 1100
                ? workspaceStyle.gridTemplateColumns.split(' ').filter(Boolean).length
                : null;
            let footerBeforeSideRail: boolean | null = null;
            if (mode === 'sidebar' && width < 1100) {
              const footerTop = footerSlot.getBoundingClientRect().top;
              const sideRailTop = sideRail.getBoundingClientRect().top;
              footerBeforeSideRail = footerTop <= sideRailTop + tolerance;
              if (!footerBeforeSideRail) {
                failures.push(
                  `sidebar footer should appear before side rail: footerTop=${footerTop.toFixed(
                    2
                  )} sideRailTop=${sideRailTop.toFixed(2)}`
                );
              }
            }
            if (mode === 'sidebar' && width >= 1100 && columnCount !== 2) {
              failures.push(`wide sidebar should use two columns, got ${columnCount}`);
            }

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
              failures.push(
                `card width ${finalCardWidth.toFixed(2)} exceeds viewport ${viewportWidth}`
              );
            }

            return {
              mode,
              documentWidth: finalDocumentWidth,
              viewportWidth,
              cardWidth: finalCardWidth,
              embedded,
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
                graphSvgMaxHeight,
                graphRenderedHeight,
              },
              sidebarContracts: {
                columnCount,
                footerBeforeSideRail,
              },
              failures,
            };
          },
          { mode, tolerance: TOLERANCE_PX, width }
        );

        expect(report.embedded).toBe(mode === 'sidebar');
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
        expect(report.graphContracts.graphSvgMaxHeight).toBe('320px');
        expect(report.graphContracts.graphRenderedHeight).toBeGreaterThan(0);
        if (mode === 'sidebar' && width >= 1100) {
          expect(report.sidebarContracts.columnCount).toBe(2);
        }
        if (mode === 'sidebar' && width < 1100) {
          expect(report.sidebarContracts.footerBeforeSideRail).toBe(true);
        }
        expect(report.failures).toEqual([]);
        expect(report.documentWidth).toBeLessThanOrEqual(report.viewportWidth + TOLERANCE_PX);
        expect(report.cardWidth).toBeLessThanOrEqual(report.viewportWidth + TOLERANCE_PX);
      });
    }
  }
});

declare global {
  interface Window {
    __LIGHTENER_CARD_READY__: Promise<void>;
    __LIGHTENER_CARD_ELEMENT__?: HTMLElement & {
      renderRoot: ShadowRoot;
      updateComplete: Promise<unknown>;
    };
    __LIGHTENER_PANEL_ELEMENT__?: HTMLElement & { shadowRoot: ShadowRoot | null };
    __LIGHTENER_STRESS_FIXTURE__: unknown;
  }
}
