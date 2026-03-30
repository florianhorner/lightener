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
  config_flow.py               # Configuration UI flow
  light.py                     # Virtual light platform + brightness mapping
  websocket.py                 # WebSocket API (get_curves / save_curves)
  frontend/                    # Built JS bundle (committed, do not edit by hand)

js/                            # TypeScript — Lit 3.x frontend card
  src/
    lightener-curve-card.ts    # Main card component
    components/                # Sub-components (graph, legend, scrubber, footer)
    utils/                     # Data helpers, interpolation, types

tests/                         # pytest — backend unit tests
```

## Prerequisites

- Python 3.12+
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
pip install -r requirements_test.txt   # or: pip install pytest pytest-asyncio pytest_homeassistant_custom_component
scripts/setup                          # if available

# Frontend
cd js
npm install
```

## Tooling

### Python (backend)

| Tool   | Purpose             | Command              |
| ------ | ------------------- | -------------------- |
| Ruff   | Linting + formatting | `ruff check . --fix` / `ruff format .` |
| Mypy   | Type checking        | `mypy custom_components/lightener/` |
| Pytest | Unit tests           | `pytest tests/`      |

Configuration lives in `pyproject.toml`.

### TypeScript (frontend)

| Tool     | Purpose     | Command                |
| -------- | ----------- | ---------------------- |
| ESLint   | Linting     | `npm run lint`         |
| Prettier | Formatting  | `npm run format`       |
| tsc      | Type check  | `npx tsc --noEmit`     |
| Rollup   | Build       | `npm run build`        |

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
