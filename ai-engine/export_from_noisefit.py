"""
Helper: Guide to export real data from NoiseFit app

Since NoiseFit doesn't have a public API, use this workflow:

1. BEFORE DEMO:
   - Open NoiseFit app on your phone
   - Go to: Profile → Data Export → Export Health Data
   - Save as CSV to your computer
   - Copy to: ai-engine/watch_data.csv

2. DURING DEMO (to show "live" updates):
   - Keep NoiseFit app open on phone
   - Every 30 seconds, re-export and replace watch_data.csv
   - OR: Use a file watcher script (advanced)

3. CSV Format Expected:
   timestamp,heart_rate,spo2,steps,stress_level
   2024-01-15 14:30:00,72,98,15,2

If your CSV has different column names, edit fetch_from_csv() in watch_data_fetcher.py
"""

import os
import pandas as pd
from datetime import datetime

def create_sample_csv(filename="watch_data.csv"):
    """Create a sample CSV file for testing"""
    sample_data = [
        {"timestamp": datetime.now().isoformat(), "heart_rate": 72, "spo2": 98, "steps": 15, "stress_level": 2},
        {"timestamp": datetime.now().isoformat(), "heart_rate": 145, "spo2": 87, "steps": 5, "stress_level": 9},  # Critical
    ]
    df = pd.DataFrame(sample_data)
    df.to_csv(filename, index=False)
    print(f"✅ Created sample {filename}")
    print(df)

if __name__ == "__main__":
    create_sample_csv()