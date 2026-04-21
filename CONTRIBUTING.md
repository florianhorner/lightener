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

tests/                         # pytest — backend unit tests
```

## Prerequisites

- Python 3.13 for local backend testing
- Node.js 20+
- A running Home Assistant dev instance (or the included Dev Container)

## Setting up

The easiest way to get started is to open this repository in VS Code with the
[Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
extension. The included `.devcontainer.json` provides a Home Assistant preview
server with the integration pre-loaded.

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
install and fail before test collection starts.

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
| Coverage | Coverage check     | `scripts/test-python --cov=custom_components/lightener --cov-fail-under=90` |

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
regenerate the bundled JS file in `custom_components/lightener/frontend/`.
This built file is committed to the repo so that HACS installs work without
a build step.

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

## Reporting security vulnerabilities

See [SECURITY.md](SECURITY.md).

## License

By contributing, you agree that your contributions will be licensed under the
[MIT License](http://choosealicense.com/licenses/mit/) that covers this project.
