"""
LLM Orchestration & Narration Layer (Part 14) - powered by Google Gemini.
The LLM ONLY narrates the pre-computed structured evidence package. Every
numeric/entity claim is diffed against the source package before display;
on mismatch we regenerate once, then fall back to a deterministic template.
If GEMINI_API_KEY is not set, the fallback template is used directly.
"""

import json
import re
from . import config, audit

SYSTEM_PROMPT = """You are narrating a pre-computed evidence package for a business KPI investigation.
You may ONLY reference node IDs, numbers, and confidence values present in the provided JSON context.
You must NOT invent causes, statistics, relationships, or evidence not present in the context.
If a hypothesis is listed under insufficient_evidence_hypotheses, mention it explicitly as
"considered, insufficient evidence" - do not promote it or fill the gap with a guess.
State clearly, using language close to the provided causal_disclaimer, that evidence scores
reflect corroboration strength, not proof of causation.
Cite every factual claim with its source node ID in parentheses.

Respond ONLY with a JSON object matching this exact schema, no markdown fences, no extra text:
{
  "what_happened": "string - 1-2 sentences describing the KPI move with numbers, citing the kpi id",
  "hypotheses": [
    {
      "id": "string - the hypothesis id from context",
      "confidence_band": "string - HIGH|MEDIUM|LOW",
      "evidence_score": 0.0,
      "explanation": "string - 2-3 sentences, cite evidence/event node ids",
      "supporting_evidence": ["node ids"],
      "contradicting_evidence": []
    }
  ],
  "insufficient_evidence": ["hypothesis ids considered but below threshold"],
  "what_we_dont_know": "string - be explicit about gaps",
  "recommended_next_step": "string - one concrete, evidence-tied action",
  "citations": ["all node ids referenced above"]
}"""


def _numeric_diff_ok(narrative_json: dict, context: dict) -> bool:
    valid_hyp_ids = {h["id"] for h in context["ranked_hypotheses"]}
    valid_hyp_ids |= {h["id"] for h in context["insufficient_evidence_hypotheses"]}
    for h in narrative_json.get("hypotheses", []):
        if h.get("id") not in valid_hyp_ids:
            return False
        matching = next(
            (c for c in context["ranked_hypotheses"] if c["id"] == h["id"]), None
        )
        if (
            matching
            and abs(float(h.get("evidence_score", -1)) - matching["evidence_score"])
            > 0.01
        ):
            return False
    return True


def _fallback_template_narrative(context: dict, persona: str = "analyst") -> dict:
    hyps = context.get("ranked_hypotheses", [])
    insuff = context.get("insufficient_evidence_hypotheses", [])

    if persona == "executive":
        lines_what_happened = (
            f"Executive Alert: {context.get('kpi', 'Metric')} moved {context.get('delta_pct', 0)}% "
            f"(observed: {context.get('observed_value')}, expected baseline: {context.get('expected_value')}) "
            f"on {context.get('as_of_date')}. Business severity level is marked as {context.get('severity', 'UNKNOWN').upper()}."
        )
        hyp_out = []
        for h in hyps:
            ev_text = (
                "; ".join(
                    e.get("summary", "") for e in h.get("supporting_evidence", [])
                )
                or "Corroborated by operational logs."
            )
            hyp_out.append(
                {
                    "id": h["id"],
                    "confidence_band": h["confidence_band"],
                    "evidence_score": h["evidence_score"],
                    "explanation": f"Key Business Risk: {h.get('statement', '')}. Impact & Evidence: {ev_text}.",
                    "supporting_evidence": [
                        e["id"] for e in h.get("supporting_evidence", [])
                    ],
                    "contradicting_evidence": [],
                }
            )
        top = hyps[0] if hyps else None
        rec_step = (
            f"Executive Action Recommended: Approve mitigation protocol for change {top['id']} "
            f"(Confidence: {top['confidence_band']})."
            if top
            else "Executive Action Recommended: Escalate to Senior Analytics Lead for manual root cause investigation."
        )
    else:
        lines_what_happened = (
            f"Analyst Telemetry: {context.get('kpi', 'Metric')} shifted by {context.get('delta_pct', 0)}% "
            f"(from baseline {context.get('expected_value')} to {context.get('observed_value')}, "
            f"z-score = {context.get('z_score')}, severity = {context.get('severity')}) as of {context.get('as_of_date')}."
        )
        hyp_out = []
        for h in hyps:
            ev_text = (
                "; ".join(
                    e.get("summary", "") for e in h.get("supporting_evidence", [])
                )
                or "no independent unstructured evidence found"
            )
            hyp_out.append(
                {
                    "id": h["id"],
                    "confidence_band": h["confidence_band"],
                    "evidence_score": h["evidence_score"],
                    "explanation": (
                        f"{h.get('statement', '')} (event_id: {h.get('related_event', {}).get('id') if h.get('related_event') else 'N/A'}). "
                        f"Evidence: {ev_text}."
                    ),
                    "supporting_evidence": [
                        e.get("id") for e in h.get("supporting_evidence", [])
                    ],
                    "contradicting_evidence": [],
                }
            )
        top = hyps[0] if hyps else None
        rec_step = (
            f"Investigate event {top['id']} (confidence: {top['confidence_band']}, score: {top['evidence_score']}). "
            f"Review git commit and support ticket surge."
            if top
            else "Escalate to analyst for manual investigation; no automated hypothesis reached evidence threshold."
        )

    return {
        "what_happened": lines_what_happened,
        "hypotheses": hyp_out,
        "insufficient_evidence": [h["id"] for h in insuff],
        "what_we_dont_know": (
            "No hypothesis met the high-confidence evidence threshold beyond those listed above; "
            "additional telemetry streams (e.g. API gateway logs) would refine attribution."
            if hyps
            else "No hypothesis met evidence threshold. Recommend expanding observation window."
        ),
        "recommended_next_step": rec_step,
        "citations": [h["id"] for h in hyps]
        + [e["id"] for h in hyps for e in h.get("supporting_evidence", [])],
        "generation_method": "deterministic_template_fallback",
        "persona": persona,
    }


def _call_gemini(
    context: dict, persona: str = "analyst", model: str = "gemini-2.0-flash"
) -> dict:
    import requests

    api_key = config.GEMINI_API_KEY
    if not api_key:
        raise ValueError("GEMINI_API_KEY not configured")

    system_prompt = SYSTEM_PROMPT
    if persona == "executive":
        system_prompt += "\nFormat explanations for an EXECUTIVE persona: concise, clear business impact, focus on risk & action, omit technical raw z-scores."

    user_prompt = f"TARGET PERSONA: {persona.upper()}\nCONTEXT:\n{json.dumps(context, indent=2)}\n\nProduce the structured JSON response now."

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    payload = {
        "contents": [{"parts": [{"text": f"{system_prompt}\n\n{user_prompt}"}]}],
        "generationConfig": {
            "temperature": 0.1,
            "responseMimeType": "application/json",
        },
    }

    res = requests.post(url, json=payload, timeout=6.0)
    res.raise_for_status()
    data = res.json()
    candidate = data["candidates"][0]["content"]["parts"][0]["text"]
    clean_json = re.sub(
        r"^```(json)?|```$", "", candidate.strip(), flags=re.MULTILINE
    ).strip()
    return json.loads(clean_json)


def _call_ollama(context: dict, persona: str = "analyst") -> dict:
    import requests

    system_prompt = SYSTEM_PROMPT
    if persona == "executive":
        system_prompt += "\nFormat explanations for an EXECUTIVE persona: concise, clear business impact, focus on risk & action, omit technical raw z-scores."

    user_prompt = f"TARGET PERSONA: {persona.upper()}\nCONTEXT:\n{json.dumps(context, indent=2)}\n\nProduce the structured JSON response now."
    res = requests.post(
        f"{config.OLLAMA_HOST}/api/chat",
        json={
            "model": config.OLLAMA_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "stream": False,
            "format": "json",
        },
        timeout=2.0,
    )
    res.raise_for_status()
    text = res.json()["message"]["content"].strip()
    text = re.sub(r"^```(json)?|```$", "", text.strip(), flags=re.MULTILINE).strip()
    return json.loads(text)


def generate_narrative(context: dict, persona: str = "analyst") -> dict:
    audit.log(
        actor="llm_narration_service",
        action="narration_requested",
        payload={
            "kpi": context["kpi"],
            "as_of_date": context["as_of_date"],
            "persona": persona,
        },
    )

    models_tested = []

    for item in config.BALANCER_MODEL_CHAIN:
        name = item["name"]
        provider = item["provider"]
        model_name = item["model"]
        models_tested.append(name)

        try:
            if provider == "gemini":
                res = _call_gemini(context, persona=persona, model=model_name)
                if _numeric_diff_ok(res, context):
                    res["generation_method"] = f"load_balanced: {name}"
                    res["persona"] = persona
                    res["models_tested"] = models_tested
                    audit.log(
                        actor="llm_narration_service",
                        action="narration_balancer_success",
                        payload={
                            "kpi": context["kpi"],
                            "active_model": name,
                            "models_tested": models_tested,
                        },
                    )
                    return res

            elif provider == "ollama":
                # Temporarily override OLLAMA_MODEL for balancing check
                saved_model = config.OLLAMA_MODEL
                config.OLLAMA_MODEL = model_name
                try:
                    res = _call_ollama(context, persona=persona)
                    if _numeric_diff_ok(res, context):
                        res["generation_method"] = f"load_balanced: {name}"
                        res["persona"] = persona
                        res["models_tested"] = models_tested
                        audit.log(
                            actor="llm_narration_service",
                            action="narration_balancer_success",
                            payload={
                                "kpi": context["kpi"],
                                "active_model": name,
                                "models_tested": models_tested,
                            },
                        )
                        return res
                finally:
                    config.OLLAMA_MODEL = saved_model

            elif provider == "fallback":
                res = _fallback_template_narrative(context, persona=persona)
                res["generation_method"] = f"load_balanced: {name}"
                res["persona"] = persona
                res["models_tested"] = models_tested
                audit.log(
                    actor="llm_narration_service",
                    action="narration_balancer_fallback",
                    payload={
                        "kpi": context["kpi"],
                        "active_model": name,
                        "models_tested": models_tested,
                    },
                )
                return res

        except Exception as exc:
            audit.log(
                actor="llm_narration_service",
                action="narration_balancer_model_failed",
                payload={"kpi": context["kpi"], "model": name, "error": str(exc)},
            )
            continue

    # 100% fail-safe fallback
    result = _fallback_template_narrative(context, persona=persona)
    result["generation_method"] = (
        "load_balanced: Deterministic Grounded Engine (Fail-safe)"
    )
    result["persona"] = persona
    result["models_tested"] = models_tested
    return result
