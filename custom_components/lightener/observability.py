"""Observability helpers for structured logs, metrics, and traces."""

from __future__ import annotations

import hashlib
import json
import logging
import uuid
from dataclasses import dataclass
from time import monotonic
from typing import Any


@dataclass(slots=True)
class Span:
    """Represents a trace span."""

    name: str
    trace_id: str
    span_id: str
    parent_span_id: str | None
    start_ts: float
    sampled: bool = True


def entity_ref(entity_id: str) -> str:
    """Return a short stable hash for entity identifiers."""
    return hashlib.sha256(entity_id.encode("utf-8")).hexdigest()[:12]


def _serialize(fields: dict[str, Any]) -> str:
    """Serialize fields to compact JSON."""
    return json.dumps(fields, separators=(",", ":"), sort_keys=True, default=str)


def log_event(
    logger: logging.Logger,
    level: int,
    event: str,
    **fields: Any,
) -> None:
    """Emit a structured event log."""
    if not logger.isEnabledFor(level):
        return
    payload = {"event": event, **fields}
    logger.log(level, _serialize(payload))


def metric(
    logger: logging.Logger,
    name: str,
    metric_type: str,
    value: int | float,
    **fields: Any,
) -> None:
    """Emit a structured metric event."""
    log_event(
        logger,
        logging.DEBUG,
        "metric",
        metric_name=name,
        metric_type=metric_type,
        metric_value=value,
        **fields,
    )


def start_span(
    logger: logging.Logger,
    name: str,
    *,
    trace_id: str | None = None,
    parent_span_id: str | None = None,
    sampled: bool = True,
    **fields: Any,
) -> Span:
    """Start a new span and emit a start event."""
    span = Span(
        name=name,
        trace_id=trace_id or uuid.uuid4().hex,
        span_id=uuid.uuid4().hex[:16],
        parent_span_id=parent_span_id,
        start_ts=monotonic(),
        sampled=sampled,
    )
    log_event(
        logger,
        logging.DEBUG,
        "trace.start",
        trace_id=span.trace_id,
        span_id=span.span_id,
        parent_span_id=span.parent_span_id,
        span_name=span.name,
        **fields,
    )
    return span


def end_span(
    logger: logging.Logger,
    span: Span,
    *,
    status: str = "ok",
    **fields: Any,
) -> float:
    """End a span and emit a finish event with duration."""
    duration_ms = (monotonic() - span.start_ts) * 1000
    log_event(
        logger,
        logging.DEBUG,
        "trace.end",
        trace_id=span.trace_id,
        span_id=span.span_id,
        parent_span_id=span.parent_span_id,
        span_name=span.name,
        status=status,
        duration_ms=round(duration_ms, 2),
        **fields,
    )
    return duration_ms
