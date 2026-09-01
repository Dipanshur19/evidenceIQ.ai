"""
Standalone script to (re)generate the synthetic Regional Revenue dataset,
Change Log, and support tickets used by EvidenceIQ.ai.
Run with: python generate_sample_data.py

The default scenario simulates a mobile checkout redesign (event v5.4)
released Aug 12, 2026 that damages North_India/Mobile_App revenue - this is
the running example traced throughout EvidenceIQ_Full_Architecture_HLD_LLD.md.
Adjust REGIONS/CHANNELS/DISRUPTION_START below to simulate a different scenario.
"""

import os
import numpy as np
import pandas as pd

np.random.seed(7)

REGIONS = ["North_India", "South_India", "East_India", "West_India"]
CHANNELS = ["Web", "Mobile_App", "Store"]
DAYS = pd.date_range("2026-06-01", "2026-08-20", freq="D")
REGION_BASE = {"North_India": 42, "South_India": 38, "East_India": 30, "West_India": 33}
CHANNEL_SHARE = {"Web": 0.35, "Mobile_App": 0.40, "Store": 0.25}
DISRUPTION_START = pd.Timestamp("2026-08-12")
COMPETITOR_PROMO_START = pd.Timestamp("2026-08-11")

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
os.makedirs(DATA_DIR, exist_ok=True)


def generate_revenue():
    rows = []
    for d in DAYS:
        dow_factor = 1.0 + (0.12 if d.dayofweek in (5, 6) else 0.0)
        for r in REGIONS:
            for c in CHANNELS:
                base_val = REGION_BASE[r] * CHANNEL_SHARE[c] * dow_factor
                noise = np.random.normal(0, base_val * 0.06)
                value = base_val + noise
                if r == "North_India" and c == "Mobile_App" and d >= DISRUPTION_START:
                    value *= 0.58
                if r == "South_India" and c == "Web" and d >= COMPETITOR_PROMO_START:
                    value *= 0.94
                rows.append([d.date().isoformat(), r, c, round(max(value, 0.5), 3)])
    df = pd.DataFrame(rows, columns=["date", "region", "channel", "revenue_lakh_inr"])
    out_path = os.path.join(DATA_DIR, "revenue_daily.csv")
    df.to_csv(out_path, index=False)
    print(f"Wrote {len(df)} rows to {out_path}")


def generate_change_log():
    rows = [
        {
            "event_id": "event:mobile_app_release_v5_4",
            "event_type": "product_release",
            "timestamp": "2026-08-12T09:00:00Z",
            "region": "North_India",
            "channel": "Mobile_App",
            "description": "Mobile checkout flow redesign (v5.4) rolled out to North India users.",
            "source": "change_log",
            "provenance": "system-of-record",
        },
        {
            "event_id": "event:competitor_diwali_promo",
            "event_type": "market_event",
            "timestamp": "2026-08-11T00:00:00Z",
            "region": "South_India",
            "channel": "Web",
            "description": "Competitor launched an early Diwali promotional campaign targeting South India web shoppers.",
            "source": "change_log",
            "provenance": "system-of-record",
        },
        {
            "event_id": "event:pricing_update_east",
            "event_type": "price_change",
            "timestamp": "2026-07-20T00:00:00Z",
            "region": "East_India",
            "channel": "Store",
            "description": "Routine price list update applied to East India store channel, no major shift expected.",
            "source": "change_log",
            "provenance": "system-of-record",
        },
    ]
    out_path = os.path.join(DATA_DIR, "change_log.csv")
    pd.DataFrame(rows).to_csv(out_path, index=False)
    print(f"Wrote {len(rows)} rows to {out_path}")


def generate_tickets():
    rows = [
        {
            "ticket_id": "ticket:44201",
            "created_at": "2026-08-12T10:15:00Z",
            "region": "North_India",
            "channel": "Mobile_App",
            "text": "Customer unable to complete checkout on the mobile app, payment step keeps failing after the latest update.",
        },
        {
            "ticket_id": "ticket:44214",
            "created_at": "2026-08-12T14:02:00Z",
            "region": "North_India",
            "channel": "Mobile_App",
            "text": "App crashes at the final checkout screen since yesterday's app update, cart items disappear.",
        },
        {
            "ticket_id": "ticket:44229",
            "created_at": "2026-08-13T09:40:00Z",
            "region": "North_India",
            "channel": "Mobile_App",
            "text": "Checkout error message 'payment could not be processed' appearing repeatedly on mobile app after new release.",
        },
        {
            "ticket_id": "ticket:44255",
            "created_at": "2026-08-13T18:20:00Z",
            "region": "North_India",
            "channel": "Mobile_App",
            "text": "Mobile app checkout page is stuck loading, unable to place order, very frustrating since the redesign.",
        },
        {
            "ticket_id": "ticket:44301",
            "created_at": "2026-08-14T11:05:00Z",
            "region": "North_India",
            "channel": "Mobile_App",
            "text": "Getting repeated payment failures on the app checkout, tried multiple cards, all fail at the same step.",
        },
        {
            "ticket_id": "ticket:44088",
            "created_at": "2026-08-05T08:30:00Z",
            "region": "South_India",
            "channel": "Web",
            "text": "Website is slightly slower than usual during checkout but orders are going through fine.",
        },
        {
            "ticket_id": "ticket:44340",
            "created_at": "2026-08-15T13:10:00Z",
            "region": "South_India",
            "channel": "Web",
            "text": "Noticed a competitor offering bigger discounts this week, considering switching my purchase there instead.",
        },
        {
            "ticket_id": "ticket:44012",
            "created_at": "2026-07-22T09:00:00Z",
            "region": "East_India",
            "channel": "Store",
            "text": "In-store prices updated correctly after the recent price list change, no issues reported.",
        },
    ]
    out_path = os.path.join(DATA_DIR, "support_tickets.csv")
    pd.DataFrame(rows).to_csv(out_path, index=False)
    print(f"Wrote {len(rows)} rows to {out_path}")


if __name__ == "__main__":
    generate_revenue()
    generate_change_log()
    generate_tickets()
