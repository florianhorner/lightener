# Contributing

Contributing to this project should be as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features

## Development workflow

1. Fork the repo and create your branch from `master`.
2. Make your changes (see tooling below).
3. Run the linters and tests.
4. Update the changelog if the change is user-facing.
5. Open a pull request.

## Project structure

```
custom_components/lightener/   # Python — HA integration backend
  __init__.py                  # Integration setup, static file serving
  brightness.py                # Pure brightness-map helpers (no HA deps)
  config_flow.py               # Configuration UI flow (name → lights + preset → done)
  const.py                     # Constants, curve presets, domain config
  light.py                     # Virtual light platform (re-exports brightness helpers)
  observability.py             # Structured logging / tracing / metrics
  util.py                      # Small cross-cutting helpers
  websocket.py                 # WebSocket API (get_curves / save_curves / list_entities)
  translations/                # HA config/options flow UI strings (en, de, sk, pt-BR)
  frontend/                    # Built JS bundle (committed, do not edit by hand)

js/                            # TypeScript — Lit 3.x frontend card
  src/
    lightener-curve-card.ts    # Main card component
    components/                # Sub-components (graph, legend, scrubber, footer)
    utils/                     # Data helpers, curve math, presets, save-lifecycle reducer, types

docs/                          # GitHub Pages demo site (live demo)

.github/assets/                # README screenshots and demo GIF
.config/                       # Commit-message rules consumed by local hooks/CI
config/                        # Minimal Home Assistant dev configuration
images/                        # HACS/Home Assistant brand assets

tests/                         # pytest — backend unit tests
```

## Prerequisites

- Python 3.13 for local backend testing
- Node.js 20+
- A running Home Assistant dev instance (or the included Dev Container)

## Setting up

The easiest way to get started is to open this repository in VS Code with the
[Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
extension. The included `.devcontainer.json` provides a Python test environment
with all backend and frontend dependencies pre-installed.

For a manual setup:

```sh
# Backend
scripts/setup-python
source .env.workspace

# Frontend
cd js
npm install
```

Do not use bare `pytest` for local backend work. This repository standardizes on
`scripts/test-python`, which always runs the Home Assistant pytest stack inside
the repo-managed Python 3.13 `.venv`. A global `pytest` can resolve to a stale
install and fail before test collection starts. If you `source .env.workspace`
first, the shell also gets a `pytest()` wrapper that routes to the same venv.

## Fast loop

For the normal local inner loop, use:

```sh
scripts/test-fast
```

That runs the fast checks we expect before touching a real Home Assistant box:
backend pytest, frontend vitest, and frontend typecheck.

If you want to test on a live Home Assistant instance without cutting a release
or waiting for HACS, sync the integration directly over SSH:

```sh
cat > .context/ha-sync.env <<'EOF'
HA_SSH_TARGET=root@your-ha-host
HA_CONFIG_DIR=/config
EOF

scripts/ha-sync --frontend-only
```

Notes:

- `scripts/ha-sync --frontend-only` is the fastest UI loop. It builds the
  frontend bundle and syncs only `custom_components/lightener/frontend/`.
- `scripts/ha-sync` syncs the full integration directory.
- The script never restarts Home Assistant. Frontend-only changes usually just
  need a browser refresh. Python changes still require a manual HA restart or
  equivalent reload on your test box.

## Tooling

### Python (backend)

| Tool   | Purpose             | Command              |
| ------ | ------------------- | -------------------- |
| Ruff   | Linting + formatting | `ruff check . --fix` / `ruff format .` |
| Mypy   | Type checking        | `mypy custom_components/lightener/` |
| Pytest | Unit tests           | `scripts/test-python` |
| Coverage | Coverage check     | `scripts/test-python --cov=custom_components/lightener --cov-fail-under=92` |

Configuration lives in `pyproject.toml`. Ruff and Mypy still target `py312` /
Python 3.12 there as tooling compatibility settings. Local backend pytest
runtime is standardized on Python 3.13.

### TypeScript (frontend)

| Tool     | Purpose     | Command                |
| -------- | ----------- | ---------------------- |
| ESLint   | Linting     | `npm run lint`         |
| Prettier | Formatting  | `npm run format`       |
| tsc      | Type check  | `npx tsc --noEmit`     |
| Vitest   | Unit tests  | `npm test`             |
| Coverage | Coverage check | `npm run test:coverage` |
| Rollup   | Build       | `npm run build`        |

Fast local loop: `scripts/test-fast frontend`

After changing any TypeScript file, run `npm run build` inside `js/` to
regenerate the committed bundles in `custom_components/lightener/frontend/`
and `docs/`. The Home Assistant bundle is committed so that HACS installs work
without a build step, and the docs bundle keeps the GitHub Pages demo in sync
with the shipped card.

### Pre-commit hooks

The repo includes a `.pre-commit-config.yaml` that runs ruff and JS lint-staged
on commit. Install with:

```sh
pip install pre-commit
pre-commit install
```

## Changelog

If your change is user-facing (new feature, bug fix, behaviour change), add an
entry to `CHANGELOG.md` under the `[Unreleased]` section.

## Reporting bugs

GitHub issues are used to track bugs. Report a bug by
[opening a new issue](../../issues/new/choose).

Good bug reports include:

- A quick summary and/or background
- Steps to reproduce (be specific, include sample config if relevant)
- What you expected vs. what actually happened
- Home Assistant version and browser/device info

If the card UI looks like an older version after an upgrade, see
[TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) for the diagnostic snippet and
recovery sequence before filing an issue.

## Reporting security vulnerabilities

See [SECURITY.md](SECURITY.md).

## License

By contributing, you agree that your contributions will be licensed under the
[MIT License](http://choosealicense.com/licenses/mit/) that covers this project.




<!-- BEGIN: commit-message-standards (do not hand-edit — update .config/commit-rules.json instead) -->
## Commit messages

This repo follows the [engineering-standards commit-message spec](https://github.com/florianhorner/engineering-standards/blob/main/specs/commit-message-spec.md). The cheat sheet below is self-sufficient — you do not need to leave the repo to write a conformant commit.

### 30-second cheat sheet

1. **Format:** `type(scope): subject` — e.g. `fix(auth): handle expired session cookie`
2. **Allowed types:** `feat fix docs style refactor test chore ci build perf revert`
3. **Subject:** ≤72 chars total, imperative mood ("fix bug" not "fixed bug"), no trailing period, no `v1.2.3` prefix
4. **Body required only when:** type is `feat` AND >50 lines changed. Body must include a `Why: <one-line>` (rule_id `WHY_REQUIRED`)
5. **Bypass:** `--no-verify` is allowed only with a `Policy-Override: <reason>` trailer (otherwise CI blocks)

### Good examples

```
fix(auth): handle expired session cookie returning undefined
```

```
docs(readme): clarify install prerequisites
```

```
feat(curve-card): add brightness scrubber with bar gauges

Why: ops team needs at-a-glance brightness state without opening editor.
Tested: e2e curve-editor + unit tests for scrubber state.
Refs: closes #67
```

### Bad examples (with the rule_id they violate)

```
Add files via upload                                 # rule_id: WEB_UI_DEFAULT
v2.10.11 feat(jamendo): country + order filters     # rule_id: VERSION_IN_SUBJECT
chore: addressed all the review comments             # rule_id: AGENT_SELF_TALK
```

```
feat(auth): add OAuth flow

florian asked me to add this                         # rule_id: OPERATOR_ATTRIBUTION (body)
```

### Body-when-required rule

A `Why:` body line is REQUIRED when **both** conditions hold:
- type is `feat`
- `git diff --shortstat` shows >50 lines changed

For all other commits the body is optional. Acceptable terse `Why:` templates:
- `Why: closes #N` (when issue body has the context)
- `Why: incident response — outage 2026-05-08T03:00Z`
- `Why: spec at <url>; see decision log section 3`

### Banned patterns — body only

| rule_id | Disallowed | Fix |
|---|---|---|
| `OPERATOR_ATTRIBUTION` | `florian asked`, `as requested`, `per request`, `per my request` | Replace with WHY: "fix X because Y" |
| `AGENT_SELF_TALK` | `addressed all`, `fix all`, `fixed all`, `cleaned up everything` | Name specific changes: "fix N+1 in Foo.query, dedupe Bar.helper" |

### Banned patterns — subject only

| rule_id | Disallowed | Fix |
|---|---|---|
| `WEB_UI_DEFAULT` | `Add files via upload`, `Update Foo.md`, `Initial commit` | Use `type(scope): subject`; describe what changed |
| `VERSION_IN_SUBJECT` | Subject starting with `v[0-9]` | Drop the version prefix; use `chore(release): 1.2.3` if needed |

### Exempt subjects (skip the format check entirely)

- Subjects starting with `Merge ` (git merge commits)
- Subjects starting with `Revert ` (`git revert`-generated)
- Subjects starting with `cherry-pick: ` (labeled cherry-picks)
- Subjects starting with `[hotfix] ` (emergency hotfix override)

### Bot allowlist

Commits authored by these identities skip the `WHY_REQUIRED` rule (subject banned-patterns still apply):

- `renovate[bot]`
- `dependabot[bot]` (this repo's `.github/dependabot.yml` sets `commit-message.prefix: "chore"` so the format check passes)
- `pre-commit-ci[bot]`
- `app/github-actions`

### Bypass policy

`git commit --no-verify` skips the local commit-msg hook. CI still validates on push. To pass CI on a sanctioned bypass:

1. Subject matches an exempt prefix (`Merge `, `Revert `, `cherry-pick: `, `[hotfix] `), OR
2. Body includes a `Policy-Override: <reason>` trailer

Example sanctioned bypass:

```bash
git commit --no-verify -m "[hotfix] fix prod outage from migration 0042" \
  -m "" \
  -m "Policy-Override: prod outage; migrating roll-forward fix; full review tomorrow"
```

The pre-push hook logs every `--no-verify` to `~/.commit-bypass.log` with the override reason.

### Where the rules live

- **Canonical spec:** https://github.com/florianhorner/engineering-standards/blob/main/specs/commit-message-spec.md
- **Vendored copy in this repo:** [`.config/commit-rules.json`](.config/commit-rules.json) — SHA-pinned snapshot consumed by the local hook, the commitlint config, and CI. Do not hand-edit.
<!-- END: commit-message-standards -->

<!-- BEGIN: commit-message-standards (managed by bootstrap-repo.sh — do not hand-edit) -->
## Commit messages

This repo follows the [engineering-standards commit-message spec](https://github.com/florianhorner/engineering-standards/blob/main/specs/commit-message-spec.md). The cheat sheet below is self-sufficient — you do not need to leave the repo to write a conformant commit.

### 30-second cheat sheet

1. **Format:** `type(scope): subject` — e.g. `fix(auth): handle expired session cookie`
2. **Allowed types:** `feat fix docs style refactor test chore ci build perf revert`
3. **Subject:** ≤72 chars total, imperative mood ("fix bug" not "fixed bug"), no trailing period, no `v1.2.3` prefix
4. **Body required only when:** type is `feat` AND >50 lines changed. Body must include a `Why: <one-line>` (rule_id `WHY_REQUIRED`)
5. **Bypass:** `--no-verify` is allowed only with a `Policy-Override: <reason>` trailer (otherwise CI blocks)

### Good examples

```
fix(auth): handle expired session cookie returning undefined
```

```
docs(readme): clarify install prerequisites
```

```
feat(curve-card): add brightness scrubber with bar gauges

Why: ops team needs at-a-glance brightness state without opening editor.
Tested: e2e curve-editor + unit tests for scrubber state.
Refs: closes #67
```

### Bad examples (with the rule_id they violate)

```
Add files via upload                                 # rule_id: WEB_UI_DEFAULT
v2.10.11 feat(jamendo): country + order filters     # rule_id: VERSION_IN_SUBJECT
chore: addressed all the review comments             # rule_id: AGENT_SELF_TALK
```

```
feat(auth): add OAuth flow

florian asked me to add this                         # rule_id: OPERATOR_ATTRIBUTION (body)
```

### Body-when-required rule

A `Why:` body line is REQUIRED when **both** conditions hold:
- type is `feat`
- `git diff --shortstat` shows >50 lines changed

For all other commits the body is optional. Acceptable terse `Why:` templates:
- `Why: closes #N` (when issue body has the context)
- `Why: incident response — outage 2026-05-08T03:00Z`
- `Why: spec at <url>; see decision log section 3`

### Banned patterns — body only

| rule_id | Disallowed | Fix |
|---|---|---|
| `OPERATOR_ATTRIBUTION` | `florian asked`, `as requested`, `per request`, `per my request` | Replace with WHY: "fix X because Y" |
| `AGENT_SELF_TALK` | `addressed all`, `fix all`, `fixed all`, `cleaned up everything` | Name specific changes: "fix N+1 in Foo.query, dedupe Bar.helper" |

### Banned patterns — subject only

| rule_id | Disallowed | Fix |
|---|---|---|
| `WEB_UI_DEFAULT` | `Add files via upload`, `Update Foo.md`, `Initial commit` | Use `type(scope): subject`; describe what changed |
| `VERSION_IN_SUBJECT` | Subject starting with `v[0-9]` | Drop the version prefix; use `chore(release): 1.2.3` if needed |

### Exempt subjects (skip the format check entirely)

- Subjects starting with `Merge ` (git merge commits)
- Subjects starting with `Revert ` (`git revert`-generated)
- Subjects starting with `cherry-pick: ` (labeled cherry-picks)
- Subjects starting with `[hotfix] ` (emergency hotfix override)

### Bot allowlist

Commits authored by these identities skip the `WHY_REQUIRED` rule (subject banned-patterns still apply):

- `renovate[bot]`
- `dependabot[bot]` (this repo's `.github/dependabot.yml` sets `commit-message.prefix: "chore"` so the format check passes)
- `pre-commit-ci[bot]`
- `app/github-actions`

### Bypass policy

`git commit --no-verify` skips the local commit-msg hook. CI still validates on push. To pass CI on a sanctioned bypass:

1. Subject matches an exempt prefix (`Merge `, `Revert `, `cherry-pick: `, `[hotfix] `), OR
2. Body includes a `Policy-Override: <reason>` trailer

Example sanctioned bypass:

```bash
git commit --no-verify -m "[hotfix] fix prod outage from migration 0042" \
  -m "" \
  -m "Policy-Override: prod outage; migrating roll-forward fix; full review tomorrow"
```

The pre-push hook logs every `--no-verify` to `~/.commit-bypass.log` with the override reason.

### Where the rules live

- **Canonical spec:** https://github.com/florianhorner/engineering-standards/blob/main/specs/commit-message-spec.md
- **Vendored copy in this repo:** [`.config/commit-rules.json`](.config/commit-rules.json) — SHA-pinned snapshot consumed by the local hook, the commitlint config, and CI. Do not hand-edit.
<!-- END: commit-message-standards -->
