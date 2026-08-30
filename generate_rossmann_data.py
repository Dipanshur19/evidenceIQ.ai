"""
Generates realistic Rossmann Store Sales dataset & synthetic support tickets
matching Section 4 of the Master Specification.
"""

import os
import numpy as np
import pandas as pd

np.random.seed(42)

STORES = [101, 102, 103, 104, 105, 106, 107, 108]
STORE_REGIONS = {
    101: "Region_A",
    102: "Region_A",
    103: "Region_B",
    104: "Region_B",
    105: "Region_C",
    106: "Region_C",
    107: "Region_D",
    108: "Region_D",
}
STORE_TYPES = {
    101: "StoreType_A",
    102: "StoreType_B",
    103: "StoreType_A",
    104: "StoreType_C",
    105: "StoreType_A",
    106: "StoreType_B",
    107: "StoreType_C",
    108: "StoreType_A",
}

DAYS = pd.date_range("2026-06-01", "2026-08-20", freq="D")
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
os.makedirs(DATA_DIR, exist_ok=True)


def generate_rossmann_data():
    rows = []
    for d in DAYS:
        dow = d.dayofweek
        is_weekend = dow in (5, 6)
        # Promo active every 2nd week on weekdays
        is_promo = 1 if (d.isocalendar().week % 2 == 0 and not is_weekend) else 0
        is_state_holiday = (
            1 if d == pd.Timestamp("2026-08-12") else 0
        )  # Injected holiday / release event

        for s in STORES:
            base_cust = 800 if not is_weekend else 400
            if is_promo:
                base_cust *= 1.35

            cust_noise = np.random.normal(0, base_cust * 0.05)
            customers = int(max(base_cust + cust_noise, 100))

            avg_basket = 14.5 + np.random.normal(0, 1.2)
            sales = customers * avg_basket

            # Anomaly injection: Store 101 on Aug 12 drops 40% due to checkout system disruption
            if s == 101 and d >= pd.Timestamp("2026-08-12"):
                sales *= 0.60
                customers = int(customers * 0.65)

            rows.append(
                {
                    "Date": d.date().isoformat(),
                    "Store": s,
                    "Region": STORE_REGIONS[s],
                    "StoreType": STORE_TYPES[s],
                    "Sales": round(max(sales, 50.0), 2),
                    "Customers": customers,
                    "Open": 0 if is_weekend and s % 2 == 0 else 1,
                    "Promo": is_promo,
                    "StateHoliday": "a" if is_state_holiday else "0",
                    "SchoolHoliday": 1 if d.month == 8 else 0,
                }
            )

    df = pd.DataFrame(rows)
    out_path = os.path.join(DATA_DIR, "rossmann_store_sales.csv")
    df.to_csv(out_path, index=False)
    print(f"Generated Rossmann dataset: {len(df)} rows at {out_path}")


def generate_tickets():
    tickets = [
        {
            "ticket_id": "TICK-1001",
            "timestamp": "2026-08-12T10:15:00Z",
            "store_id": 101,
            "category": "Checkout Failure",
            "summary": "Payment POS terminal timed out during checkout promotion",
        },
        {
            "ticket_id": "TICK-1002",
            "timestamp": "2026-08-12T11:45:00Z",
            "store_id": 101,
            "category": "Register Crash",
            "summary": "Barcode scanner error on promotional items",
        },
        {
            "ticket_id": "TICK-1003",
            "timestamp": "2026-08-13T09:30:00Z",
            "store_id": 101,
            "category": "Payment Gateway",
            "summary": "Card payment declined repeatedly at Store 101",
        },
        {
            "ticket_id": "TICK-1004",
            "timestamp": "2026-08-11T14:00:00Z",
            "store_id": 103,
            "category": "Inventory Query",
            "summary": "Stock query for promo item",
        },
    ]
    df = pd.DataFrame(tickets)
    out_path = os.path.join(DATA_DIR, "support_tickets.csv")
    df.to_csv(out_path, index=False)
    print(f"Generated support tickets: {len(df)} rows at {out_path}")


if __name__ == "__main__":
    generate_rossmann_data()
    generate_tickets()
