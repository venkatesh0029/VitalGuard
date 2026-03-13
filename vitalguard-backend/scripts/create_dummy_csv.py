import csv
import random
import argparse
from datetime import datetime, timedelta
from pathlib import Path

OUTPUT_PATH = Path(__file__).resolve().parent / "dummy_patient_vitals.csv"

def generate_rows(count: int = 200, patient_count: int = 5):
    now = datetime.utcnow()
    for i in range(count):
        # Create bursts of unhealthy data
        roll = random.random()
        if roll < 0.1:
            heart_rate = random.randint(140, 165)
            spo2 = random.randint(84, 89)
        elif roll < 0.3:
            heart_rate = random.randint(105, 125)
            spo2 = random.randint(90, 94)
        else:
            heart_rate = random.randint(65, 95)
            spo2 = random.randint(95, 100)

        steps = random.randint(0, 2000)
        user_id = f"user_{random.randint(1, patient_count):03d}"
        timestamp = (now - timedelta(seconds=5 * i)).isoformat()

        yield {
            "heart_rate": heart_rate,
            "spo2": spo2,
            "steps": steps,
            "user_id": user_id,
            "timestamp": timestamp
        }

def main():
    parser = argparse.ArgumentParser(description="Generate dummy patient vitals CSV")
    parser.add_argument("--rows", type=int, default=200, help="Number of rows to generate")
    parser.add_argument("--patients", type=int, default=5, help="Number of unique patients")
    parser.add_argument("--out", type=str, default=str(OUTPUT_PATH), help="Output CSV path")
    args = parser.parse_args()

    out_path = Path(args.out)
    rows = list(generate_rows(args.rows, args.patients))
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["heart_rate", "spo2", "steps", "user_id", "timestamp"])
        writer.writeheader()
        writer.writerows(rows)
    print(f"Created {len(rows)} rows for {args.patients} patients at {out_path}")

if __name__ == "__main__":
    main()
