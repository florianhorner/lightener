# Lightener Curve Editor — CLAUDE.md

## What this is

A Home Assistant custom integration (HACS) that controls groups of lights with
per-light brightness curves. Fork of fredck/lightener with an interactive
curve-editor card.

## Quality gates

### Release ZIP structure (critical)

HACS `zip_release: true` extracts the zip **directly** into
`/config/custom_components/lightener/`. If the zip contains a
`custom_components/lightener/` prefix, files land at
`…/lightener/custom_components/lightener/` and HA silently fails with
"Integration not found" — no import error, no traceback, just gone.

**Rule:** The release zip MUST have `manifest.json` at the root. No
`custom_components/` prefix anywhere in the archive.

**Enforcement:** The `release.yml` workflow validates this automatically and
fails the release if the structure is wrong.

**Manual uploads:** Never manually upload a zip to a GitHub release. Always let
the release workflow build it via the `cd … && zip -r ./` pattern. If you must
rebuild manually, run from inside `custom_components/lightener/`:

```bash
cd custom_components/lightener
zip lightener.zip -r ./
# Verify:
unzip -l lightener.zip | grep -c "custom_components/"  # must be 0
```

### Coverage gates

CI enforces minimum coverage on both sides. Gates are floors (not strict
ratchets) set 3-6pp below measured baseline — they catch meaningful
regressions without flagging small refactors.

- **Python:** `pyproject.toml` `[tool.coverage.report] fail_under = 60`
  (baseline ~94%). Enforced in `.github/workflows/lint.yml` pytest job via
  `--cov-fail-under=60`.
- **Frontend:** `js/vitest.config.ts` thresholds `lines: 75`, `branches: 65`,
  `functions: 75`, `statements: 75` (baseline 81/71/82/79). `src/lightener-curve-card.ts`
  is excluded until PR-B extracts it; re-include once the god-file is under
  400 lines and covered directly.
- **Raising a gate:** run the suite locally (`npm run test:coverage` or
  `pytest --cov=custom_components/lightener`), confirm the new floor has
  at least ~3pp cushion above the measured number, then bump the config.
  Don't chase the measured baseline exactly — that creates false failures
  on every PR.

### Shipping procedure

1. Bump version in `manifest.json` (the release workflow also patches it from the tag, but keep them in sync)
2. Create a GitHub release with tag `vX.Y.Z`
3. Let the Release workflow run — it builds the zip, validates structure, uploads
4. **Do not** manually re-upload or replace the release zip asset
5. After HACS picks up the new version, test on HA: verify the integration loads (`manifest/get` via websocket must succeed)

## Development

- `conductor.json` — Conductor Mac app config: `setup` runs `scripts/conductor-setup`, `run` button starts `scripts/develop`
- `scripts/conductor-setup` — one-shot workspace bootstrap (Python venv, Node.js 22, gh CLI, jq, JS deps); requires root
- `scripts/setup` — create venv and install deps
- `scripts/develop` — run HA locally with the integration
- `scripts/lint` — run linters
- Integration source lives in `custom_components/lightener/`
- Frontend card JS lives in `custom_components/lightener/frontend/`
- Card source (if editing) lives in `js/`
