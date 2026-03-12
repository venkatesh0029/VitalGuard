import pandas as pd
from datetime import datetime
import sys

def update_vitals(hr, spo2, steps=0, stress=0):
    """Update CSV with new vitals reading"""
    try:
        df = pd.read_csv("watch_data.csv")
    except:
        df = pd.DataFrame(columns=["timestamp", "heart_rate", "spo2", "steps", "stress_level"])
    
    new_row = {
        "timestamp": datetime.now(),
        "heart_rate": hr,
        "spo2": spo2,
        "steps": steps,
        "stress_level": stress
    }
    
    df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
    df.to_csv("watch_data.csv", index=False)
    print(f"✅ Updated: HR={hr} | SpO2={spo2}% | Steps={steps} | Stress={stress}/10")

if __name__ == "__main__":
    # Preset scenarios for easy demo
    scenarios = {
        "normal": (72, 98, 150, 2),
        "walking": (85, 97, 500, 3),
        "warning": (115, 93, 50, 6),
        "critical": (145, 87, 10, 9),
        "recovery": (78, 97, 200, 3)
    }
    
    if len(sys.argv) > 1:
        scenario = sys.argv[1].lower()
        if scenario in scenarios:
            hr, spo2, steps, stress = scenarios[scenario]
            update_vitals(hr, spo2, steps, stress)
        elif len(sys.argv) == 5:
            # Custom values: python update_vitals.py 72 98 150 2
            update_vitals(int(sys.argv[1]), int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4]))
        else:
            print("❌ Invalid arguments")
    else:
        print("🏥 VITALGUARD - Quick Update")
        print("=" * 40)
        print("Usage: python update_vitals.py <scenario>")
        print()
        print("Scenarios:")
        print("  normal    - HR:72, SpO2:98%, Steps:150, Stress:2")
        print("  walking   - HR:85, SpO2:97%, Steps:500, Stress:3")
        print("  warning   - HR:115, SpO2:93%, Steps:50, Stress:6")
        print("  critical  - HR:145, SpO2:87%, Steps:10, Stress:9")
        print("  recovery  - HR:78, SpO2:97%, Steps:200, Stress:3")
        print()
        print("Or custom: python update_vitals.py <hr> <spo2> <steps> <stress>")