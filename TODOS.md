# TODOs

This is a short public backlog. Completed historical review notes belong in
`CHANGELOG.md` or GitHub history, not in this file. Larger work should be
tracked as GitHub Issues before implementation.

## Open Follow-Ups

- [ ] **[P3 — save lifecycle]** Consider replacing the blocking `confirming` phase with an optimistic save + silent background re-fetch. Both CEO review models flagged this as the more resilient architecture for slow HA environments. User deferred this during the issue-92 review.
- [ ] Reproduce hidden-parent rendering in real HA tabs, popups, and stacked dashboards; add a resize/intersection guard only if the browser repro confirms graph space collapses.
- [ ] Path-stamp the sidebar panel script if upgrade testing shows stale cached panels after HACS updates.
- [ ] Investigate usable upper bound for the curve card light count: what should happen with 30+ lights? Legend virtualization, scroll, or count cap? Flagged by Codex during issue-90 autoplan review as a strategic product question unaddressed by the test fixture.
- [ ] Continue the `lightener-curve-card.ts` god-file extraction after `load-lifecycle`, `preview-controller`, and `edit-operations`: extract cohesive render/orchestration modules until the card file is coherent. The goal is a well-factored card, not a specific line count.
- [ ] Decide the curve-card coverage strategy: either lower the `lightener-curve-card.ts` size threshold in `js/vitest.config.ts` to the card's real size so it is coverage-tracked, or add explicit coverage tests for the card. The 400-line threshold is a coverage-tool heuristic, not a design target.
