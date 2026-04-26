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

- **Python:** `pyproject.toml` `[tool.coverage.report] fail_under = 90`
  (baseline ~94.74% after PR-B). Enforced in `.github/workflows/lint.yml`
  pytest job via `--cov-fail-under=90`.
- **Frontend:** `js/vitest.config.ts` thresholds `lines: 75`, `branches: 65`,
  `functions: 75`, `statements: 75` (baseline 82.52/73.76/83.47/80.52).
  `src/lightener-curve-card.ts` is excluded until the god-file is under
  400 lines and can be covered directly.
- **Raising a gate:** run the suite locally (`npm run test:coverage` or
  `scripts/test-python --cov=custom_components/lightener`), confirm the new
  floor has at least ~3pp cushion above the measured number, then bump the
  config. Don't chase the measured baseline exactly — that creates false
  failures on every PR.

### Shipping procedure

1. Bump version in `manifest.json` (the release workflow also patches it from the tag, but keep them in sync)
2. Create a GitHub release with tag `vX.Y.Z`
3. Let the Release workflow run — it builds the zip, validates structure, uploads
4. **Do not** manually re-upload or replace the release zip asset
5. After HACS picks up the new version, test on HA: verify the integration loads (`manifest/get` via websocket must succeed)

## Development

- `conductor.json` — Conductor Mac app config: `setup` runs `scripts/conductor-setup`, `run` button starts `scripts/develop`
- `scripts/conductor-setup` — one-shot workspace bootstrap (macOS-safe local bootstrap or Debian/root system bootstrap, plus JS deps)
- `scripts/setup-python` — create the local Python 3.13 `.venv`, install backend deps, and write `.env.workspace`
- `scripts/setup` — Debian/system bootstrap that installs system packages, then delegates to `scripts/setup-python`
- `scripts/test-python` — canonical backend test command; runs `.venv/bin/python -m pytest`
- `scripts/test-fast` — fast local inner loop: backend pytest + frontend vitest + frontend typecheck
- `scripts/ha-sync` — direct SSH sync to a test Home Assistant config dir; bypasses release/HACS and never restarts HA
- `scripts/develop` — run HA locally with the integration
- `scripts/lint` — run linters
- Integration source lives in `custom_components/lightener/`
- Frontend card JS lives in `custom_components/lightener/frontend/`
- Card source (if editing) lives in `js/`

### Fast Testing Loop (default)

- Future agents should default to the fast loop in this repo instead of asking for a release cut or HACS update for routine testing.
- First local validation step: `scripts/test-fast`
- Fastest live HA UI loop: `scripts/ha-sync --frontend-only`
- Full live HA sync when needed: `scripts/ha-sync`
- Store SSH target configuration in the gitignored `.context/ha-sync.env` file.
- `scripts/ha-sync` never restarts Home Assistant. If Python code changed, tell the user a manual HA restart or equivalent reload is still required.
- Only use the release/HACS flow when validating packaging, distribution, or an actual release candidate.

### Curve editor release baseline

- Before changing the Lightener curve editor UI, graph behavior, scrubber,
  presets, add/remove-light flow, or card layout, inspect both MemPalace
  (`wing=lightener`) and the latest relevant release tag.
- Treat the released editor interaction model as the baseline. Do not replace
  native-feeling Home Assistant patterns, smooth curve behavior, or existing
  add/edit/remove-light features unless the task explicitly asks for that
  behavioral change.
- When fixing regressions, prefer a narrow patch on top of the released behavior
  over reworking the whole editor surface.
- Before landing curve editor changes, write down the editor contract being
  preserved: current feature inventory, native Home Assistant interaction
  pattern, visual curve behavior, backend brightness semantics, and local
  preview scenarios. Validate against that contract, not just against tests.
- Keep visual rendering and real integration behavior separate. A curve may be
  rendered smoothly, but badges, list values, saved config, and live light
  preview must stay aligned with backend interpolation unless the backend
  behavior changes in the same PR.

### Triaging bundle / caching issues

If a user reports that a recently-shipped card feature is missing, a card
editor field is blank, or a button "does nothing" after an upgrade, **do
not treat them as independent bugs**. The most common cause is that the
live `lightener-curve-card` class in the user's browser is from a prior
bundle (HACS install-version vs on-disk mismatch, or browser
SW/HTTP-cache serving the old bundle first; `customElements.define` is
one-shot, so the old class wins and the fresh bundle is silently ignored).

See [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) for the diagnostic
snippet and full recovery sequence before writing any source patch.

### Backend test entrypoint

- Never rely on bare `pytest` from the ambient shell PATH in this repo.
- Default to `scripts/test-python` for backend tests.
- If you need direct pytest flags, use `.venv/bin/python -m pytest ...` or `source .env.workspace` first. The generated `.env.workspace` defines a shell `pytest()` wrapper that routes to the repo-managed Python 3.13 venv.
