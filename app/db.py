"""
Database layer (Part 19, simplified: relational schema + adjacency tables
stand in for a dedicated graph database at MVP scale).
"""

import sqlite3
import json
from contextlib import contextmanager
from . import config

SCHEMA = """
CREATE TABLE IF NOT EXISTS metric_definition (
    metric_id       TEXT PRIMARY KEY,
    display_name    TEXT NOT NULL,
    formula         TEXT NOT NULL,
    grain           TEXT NOT NULL,
    owner_team      TEXT NOT NULL,
    version         INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS kpi_observation (
    kpi_id          TEXT NOT NULL,
    metric_id       TEXT NOT NULL,
    dimension_scope TEXT NOT NULL,
    observed_at     TEXT NOT NULL,
    observed_value  REAL,
    expected_value  REAL,
    z_score         REAL,
    severity        TEXT,
    PRIMARY KEY (kpi_id, observed_at)
);

CREATE TABLE IF NOT EXISTS graph_node (
    id          TEXT PRIMARY KEY,
    node_type   TEXT NOT NULL,
    attrs       TEXT NOT NULL,
    created_at  TEXT NOT NULL,
    version     INTEGER DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_graph_node_type ON graph_node(node_type);

CREATE TABLE IF NOT EXISTS graph_edge (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    edge_type       TEXT NOT NULL,
    from_id         TEXT NOT NULL,
    to_id           TEXT NOT NULL,
    confidence      REAL NOT NULL,
    methodology     TEXT,
    provenance      TEXT,
    created_at      TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_edge_from ON graph_edge(from_id);
CREATE INDEX IF NOT EXISTS idx_edge_to ON graph_edge(to_id);
CREATE INDEX IF NOT EXISTS idx_edge_type ON graph_edge(edge_type);

CREATE TABLE IF NOT EXISTS investigation (
    id              TEXT PRIMARY KEY,
    kpi_id          TEXT NOT NULL,
    triggered_at    TEXT NOT NULL,
    severity        TEXT,
    status          TEXT DEFAULT 'open'
);

CREATE TABLE IF NOT EXISTS decision (
    id                  TEXT PRIMARY KEY,
    recommendation_id   TEXT,
    hypothesis_id       TEXT,
    investigation_id    TEXT,
    decided_by          TEXT,
    decision            TEXT,
    justification       TEXT,
    decided_at           TEXT
);

CREATE TABLE IF NOT EXISTS outcome (
    id                  TEXT PRIMARY KEY,
    decision_id         TEXT,
    measured_at         TEXT,
    kpi_delta           REAL,
    hypothesis_confirmed INTEGER
);

CREATE TABLE IF NOT EXISTS audit_log (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    actor       TEXT NOT NULL,
    action      TEXT NOT NULL,
    payload     TEXT,
    created_at  TEXT NOT NULL
);
"""


@contextmanager
def get_conn():
    conn = sqlite3.connect(config.DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db():
    with get_conn() as conn:
        conn.executescript(SCHEMA)
        for metric_id, m in config.METRIC_DEFINITIONS.items():
            conn.execute(
                """INSERT OR IGNORE INTO metric_definition
                   (metric_id, display_name, formula, grain, owner_team, version)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                (
                    metric_id,
                    m["display_name"],
                    m["formula"],
                    m["grain"],
                    m["owner_team"],
                    m["version"],
                ),
            )


def reset_db():
    import os

    if os.path.exists(config.DB_PATH):
        os.remove(config.DB_PATH)
    init_db()


def upsert_node(node_id: str, node_type: str, attrs: dict, created_at: str):
    with get_conn() as conn:
        conn.execute(
            """INSERT INTO graph_node (id, node_type, attrs, created_at)
               VALUES (?, ?, ?, ?)
               ON CONFLICT(id) DO UPDATE SET attrs=excluded.attrs, version=version+1""",
            (node_id, node_type, json.dumps(attrs), created_at),
        )


def add_edge(
    edge_type: str,
    from_id: str,
    to_id: str,
    confidence: float,
    methodology: str,
    provenance: str,
    created_at: str,
):
    with get_conn() as conn:
        conn.execute(
            """INSERT INTO graph_edge (edge_type, from_id, to_id, confidence, methodology, provenance, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (
                edge_type,
                from_id,
                to_id,
                confidence,
                methodology,
                provenance,
                created_at,
            ),
        )


def get_node(node_id: str):
    with get_conn() as conn:
        row = conn.execute(
            "SELECT * FROM graph_node WHERE id = ?", (node_id,)
        ).fetchone()
        if not row:
            return None
        d = dict(row)
        d["attrs"] = json.loads(d["attrs"])
        return d


def get_nodes_by_type(node_type: str):
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM graph_node WHERE node_type = ?", (node_type,)
        ).fetchall()
        out = []
        for row in rows:
            d = dict(row)
            d["attrs"] = json.loads(d["attrs"])
            out.append(d)
        return out


def get_edges_from(node_id: str, edge_type: str = None):
    with get_conn() as conn:
        if edge_type:
            rows = conn.execute(
                "SELECT * FROM graph_edge WHERE from_id = ? AND edge_type = ?",
                (node_id, edge_type),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM graph_edge WHERE from_id = ?", (node_id,)
            ).fetchall()
        return [dict(r) for r in rows]


def get_edges_to(node_id: str, edge_type: str = None):
    with get_conn() as conn:
        if edge_type:
            rows = conn.execute(
                "SELECT * FROM graph_edge WHERE to_id = ? AND edge_type = ?",
                (node_id, edge_type),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM graph_edge WHERE to_id = ?", (node_id,)
            ).fetchall()
        return [dict(r) for r in rows]
