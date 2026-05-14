# TODOs

This is a short public backlog. Completed historical review notes belong in
`CHANGELOG.md` or GitHub history, not in this file. Larger work should be
tracked as GitHub Issues before implementation.

## Open Follow-Ups

- [ ] **[P2 — save lifecycle]** Add a confirmation timeout (~8s) to the `confirming` phase. Without it, a stalled HA re-fetch leaves the card permanently frozen with controls disabled and no recovery path short of page reload. Requires a `save-unverified` terminal FSM state or a timeout-triggered `save-error`. (Follow-up to issue #92)
- [ ] **[P3 — save lifecycle]** Consider replacing the blocking `confirming` phase with an optimistic save + silent background re-fetch. Both CEO review models flagged this as the more resilient architecture for slow HA environments. User deferred this during the issue-92 review.
- [ ] Consolidate responsive breakpoints across the demo page, card shell, graph, legend, and footer.
- [ ] Update `DESIGN.md` with the live `--secondary-text` token and breakpoint guidance.
- [ ] Investigate hidden-parent rendering with tabs, popups, and stacked dashboards; add a resize/intersection guard if reproducible.
- [ ] Path-stamp the sidebar panel script if upgrade testing shows stale cached panels after HACS updates.
- [ ] Improve secondary visual hierarchy on the GitHub Pages demo page.
- [ ] Strengthen the first-time visitor trust funnel with clearer install, demo, and troubleshooting paths.
- [ ] Add Playwright visual regression test for 20-light long-name fixture at real widths (issue-90 follow-up): jsdom CSS contract test cannot verify pixel-level overflow or actual box model behavior; a 30-second Playwright screenshot diff at 320px and 1100px would catch what the Vitest suite cannot.
- [ ] Investigate usable upper bound for the curve card light count: what should happen with 30+ lights? Legend virtualization, scroll, or count cap? Flagged by Codex during issue-90 autoplan review as a strategic product question unaddressed by the test fixture.
