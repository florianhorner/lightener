"""Tests for integration manifest invariants."""

import json
from pathlib import Path


def test_manifest_does_not_require_frontend_component() -> None:
    """Keep frontend optional so tests don't fail in minimal HA environments."""
    manifest_path = (
        Path(__file__).resolve().parents[3]
        / "custom_components"
        / "lightener"
        / "manifest.json"
    )
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    dependencies = manifest.get("dependencies", [])

    assert "http" in dependencies
    assert "frontend" not in dependencies
