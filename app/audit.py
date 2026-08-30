"""
Audit Service (Part 22, simplified, append-only, fail-closed).
"""

from datetime import datetime, timezone
import json
from . import db


class AuditWriteFailure(Exception):
    pass


def log(actor: str, action: str, payload: dict):
    try:
        with db.get_conn() as conn:
            conn.execute(
                "INSERT INTO audit_log (actor, action, payload, created_at) VALUES (?, ?, ?, ?)",
                (
                    actor,
                    action,
                    json.dumps(payload, default=str),
                    datetime.now(timezone.utc).isoformat(),
                ),
            )
    except Exception as exc:
        raise AuditWriteFailure(
            f"Audit log write failed, halting caller: {exc}"
        ) from exc


def get_logs(limit: int = 50) -> list:
    with db.get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM audit_log ORDER BY created_at DESC LIMIT ?", (limit,)
        ).fetchall()
        return [dict(r) for r in rows]
