"""
Decision Memory Reinforcement Learning & Edge Recalibration Engine (Phase 3).
Dynamically recalibrates Business Evidence Graph edge confidences and hypothesis priors
using confirmed human checkpoint outcomes as reinforcement learning reward signals.
"""

import json
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from . import db, audit


class EdgeRecalibrationEngine:
    def __init__(self, learning_rate: float = 0.08):
        self.learning_rate = learning_rate

    def recalibrate_from_outcome(
        self,
        decision_id: str,
        hypothesis_confirmed: bool,
        kpi_delta: float,
        expected_recovery: float = 35.0,
    ) -> Dict[str, Any]:
        """
        Computes RL reward signal from real-world outcome and updates graph edge weights.
        
        Reward Formulation:
          R = +1.0 if confirmed with full recovery
          R = -1.0 if false positive / disconfirmed
        """
        now_iso = datetime.now(timezone.utc).isoformat()

        # 1. Retrieve Decision and Associated Hypothesis
        with db.get_conn() as conn:
            dec_row = conn.execute("SELECT * FROM decision WHERE id = ?", (decision_id,)).fetchone()
            if not dec_row:
                return {"status": "decision_not_found", "decision_id": decision_id}
            
            dec_dict = dict(dec_row)
            hyp_id = dec_dict.get("hypothesis_id") or "hypothesis:checkout_flow_v5_4"

        # 2. Compute RL Reward Signal
        if hypothesis_confirmed:
            recovery_ratio = min(1.0, max(0.0, abs(kpi_delta) / max(expected_recovery, 1.0)))
            reward = 0.5 + (0.5 * recovery_ratio)  # Scale between +0.5 and +1.0
            reward_type = "POSITIVE_REINFORCEMENT"
            rationale = f"Hypothesis confirmed by operator outcome (recovery ratio: {recovery_ratio:.2f})."
        else:
            reward = -0.75  # Negative penalty for false attribution
            reward_type = "NEGATIVE_REINFORCEMENT"
            rationale = "Hypothesis disconfirmed post-intervention. Penalizing related causal edges."

        # 3. Find Graph Edges Connected to this Hypothesis
        updated_edges = []
        with db.get_conn() as conn:
            edges = conn.execute(
                "SELECT * FROM graph_edge WHERE from_id = ? OR to_id = ?",
                (hyp_id, hyp_id),
            ).fetchall()

            for edge in edges:
                e_id = edge["id"]
                old_w = float(edge["confidence"])
                e_type = edge["edge_type"]

                # RL Policy Gradient / Value Update:
                # delta = alpha * (Reward - baseline_confidence)
                delta = self.learning_rate * (reward - (old_w - 0.5))
                new_w = round(max(0.05, min(0.99, old_w + delta)), 4)

                # Update graph edge confidence in DB
                conn.execute(
                    "UPDATE graph_edge SET confidence = ? WHERE id = ?",
                    (new_w, e_id),
                )

                # Record in recalibration log
                conn.execute(
                    """INSERT INTO recalibration_log 
                       (decision_id, edge_id, from_id, to_id, old_weight, new_weight, reward, delta, rationale, recalibrated_at)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (
                        decision_id,
                        e_id,
                        edge["from_id"],
                        edge["to_id"],
                        old_w,
                        new_w,
                        reward,
                        round(new_w - old_w, 4),
                        f"RL update ({e_type}): {rationale}",
                        now_iso,
                    ),
                )

                updated_edges.append({
                    "edge_id": e_id,
                    "edge_type": e_type,
                    "from_id": edge["from_id"],
                    "to_id": edge["to_id"],
                    "old_weight": old_w,
                    "new_weight": new_w,
                    "delta": round(new_w - old_w, 4),
                })

            # 4. Update Persistent Hypothesis Prior
            prior_row = conn.execute(
                "SELECT * FROM hypothesis_prior WHERE hypothesis_id = ?", (hyp_id,)
            ).fetchone()

            if prior_row:
                old_prior = float(prior_row["prior_score"])
                cnt = int(prior_row["sample_count"])
                new_prior = round((old_prior * cnt + (1.0 if hypothesis_confirmed else 0.0)) / (cnt + 1), 4)
                conn.execute(
                    "UPDATE hypothesis_prior SET prior_score = ?, sample_count = ?, last_updated = ? WHERE hypothesis_id = ?",
                    (new_prior, cnt + 1, now_iso, hyp_id),
                )
            else:
                new_prior = 0.85 if hypothesis_confirmed else 0.35
                conn.execute(
                    "INSERT INTO hypothesis_prior (hypothesis_id, prior_score, sample_count, last_updated) VALUES (?, ?, ?, ?)",
                    (hyp_id, new_prior, 1, now_iso),
                )

        # 5. Audit Log
        audit.log(
            actor="rl_edge_recalibration_engine",
            action="graph_edges_recalibrated",
            payload={
                "decision_id": decision_id,
                "hypothesis_id": hyp_id,
                "reward": reward,
                "edges_updated_count": len(updated_edges),
            },
        )

        return {
            "status": "recalibrated",
            "decision_id": decision_id,
            "hypothesis_id": hyp_id,
            "reward_signal": round(reward, 3),
            "reward_type": reward_type,
            "edges_recalibrated_count": len(updated_edges),
            "recalibrated_edges": updated_edges,
            "hypothesis_prior": new_prior,
            "timestamp": now_iso,
        }

    def get_recalibration_history(self, limit: int = 30) -> List[Dict[str, Any]]:
        """Returns history of dynamic RL edge recalibrations."""
        with db.get_conn() as conn:
            rows = conn.execute(
                "SELECT * FROM recalibration_log ORDER BY recalibrated_at DESC LIMIT ?",
                (limit,),
            ).fetchall()
            return [dict(r) for r in rows]

    def get_hypothesis_priors(self) -> List[Dict[str, Any]]:
        """Returns learned Bayesian prior scores for candidate hypotheses."""
        with db.get_conn() as conn:
            rows = conn.execute(
                "SELECT * FROM hypothesis_prior ORDER BY prior_score DESC"
            ).fetchall()
            return [dict(r) for r in rows]


edge_recalibration_engine = EdgeRecalibrationEngine()
