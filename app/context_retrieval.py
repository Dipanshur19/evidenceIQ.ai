"""
Unstructured Evidence Retrieval (Part 6/13 support role). TF-IDF surfaces
candidate ticket-spike signals formalized into Evidence graph nodes BEFORE
the LLM ever sees them.
"""

from datetime import datetime, timezone
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from . import db
from .data_layer import load_tickets


def detect_ticket_spike_evidence(
    region: str,
    channel: str,
    anomaly_date: str,
    window_days: int = 3,
    keyword_query: str = "checkout error payment failed",
) -> dict:
    tickets = load_tickets()
    anomaly_ts = pd.Timestamp(anomaly_date)
    window_start = anomaly_ts - pd.Timedelta(days=window_days)
    window_end = anomaly_ts + pd.Timedelta(days=window_days)

    mask = (tickets["created_at"] >= window_start) & (
        tickets["created_at"] <= window_end
    )
    if "region" in tickets.columns and region:
        mask = mask & (tickets["region"] == region)
    if "channel" in tickets.columns and channel:
        mask = mask & (tickets["channel"] == channel)

    sub = tickets[mask]
    if sub.empty:
        # Fallback to all tickets in window
        sub = tickets[
            (tickets["created_at"] >= window_start)
            & (tickets["created_at"] <= window_end)
        ]

    if sub.empty:
        return {"status": "no_tickets_found"}

    text_col = "summary" if "summary" in sub.columns else "text"
    corpus = sub[text_col].astype(str).tolist()

    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf_matrix = vectorizer.fit_transform(corpus + [keyword_query])
    query_vec = tfidf_matrix[-1]
    doc_vecs = tfidf_matrix[:-1]
    sims = cosine_similarity(query_vec, doc_vecs).flatten()

    relevant = sub.assign(similarity=sims)
    relevant = relevant[relevant["similarity"] > 0.1].sort_values(
        "similarity", ascending=False
    )
    if relevant.empty:
        return {"status": "tickets_found_but_not_relevant", "ticket_count": len(sub)}

    evidence_id = f"evidence:ticket_spike_{region}_{channel}_{anomaly_date}".lower()
    strength = min(0.5 + 0.1 * len(relevant), 0.95)
    attrs = {
        "node_type": "Evidence",
        "id": evidence_id,
        "evidence_type": "unstructured_signal",
        "summary": f"{len(relevant)} support tickets mentioning checkout/payment issues in {region}/{channel} within {window_days} days of the anomaly.",
        "source": "support_ticket_system",
        "source_refs": relevant["ticket_id"].tolist(),
        "extraction_method": "TF-IDF topic relevance + volume in window",
        "strength": round(float(strength), 3),
        "timestamp_range": [str(window_start.date()), str(window_end.date())],
        "provenance": "derived",
    }
    db.upsert_node(
        evidence_id, "Evidence", attrs, datetime.now(timezone.utc).isoformat()
    )
    return {"status": "evidence_created", "evidence_id": evidence_id, **attrs}
