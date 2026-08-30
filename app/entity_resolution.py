"""
Entity Resolution (Part 5, MVP: deterministic + fuzzy matching).
"""

from difflib import SequenceMatcher
from typing import Optional, Tuple

CANONICAL_REGIONS = {
    "North_India": ["north india", "north region", "up belt", "north zone", "north"],
    "South_India": ["south india", "south region", "south zone", "south"],
    "East_India": ["east india", "east region", "east zone", "east"],
    "West_India": ["west india", "west region", "west zone", "west"],
}
CANONICAL_CHANNELS = {
    "Mobile_App": ["mobile app", "mobile", "app", "android app", "ios app"],
    "Web": ["web", "website", "desktop site", "online"],
    "Store": ["store", "retail store", "offline", "in-store"],
}


def _best_fuzzy_match(mention: str, canonical_map: dict) -> Tuple[Optional[str], float]:
    mention_l = mention.lower().strip()
    best_id, best_score = None, 0.0
    for canonical_id, aliases in canonical_map.items():
        candidates = [canonical_id.lower().replace("_", " ")] + aliases
        for alias in candidates:
            score = SequenceMatcher(None, mention_l, alias).ratio()
            if score > best_score:
                best_score, best_id = score, canonical_id
    return best_id, best_score


def resolve_region(mention: str) -> dict:
    if mention in CANONICAL_REGIONS:
        return {"canonical_id": mention, "confidence": 1.0, "method": "deterministic"}
    best_id, score = _best_fuzzy_match(mention, CANONICAL_REGIONS)
    return {"canonical_id": best_id, "confidence": round(score, 3), "method": "fuzzy"}


def resolve_channel(mention: str) -> dict:
    if mention in CANONICAL_CHANNELS:
        return {"canonical_id": mention, "confidence": 1.0, "method": "deterministic"}
    best_id, score = _best_fuzzy_match(mention, CANONICAL_CHANNELS)
    return {"canonical_id": best_id, "confidence": round(score, 3), "method": "fuzzy"}


def resolution_status(confidence: float) -> str:
    if confidence >= 0.95:
        return "auto_merged"
    if confidence >= 0.75:
        return "merged_low_confidence"
    return "unresolved_needs_review"
