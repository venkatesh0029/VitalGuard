import pandas as pd
from datetime import datetime

# Create sample watch data
data = [
    {"timestamp": datetime.now(), "heart_rate": 72, "spo2": 98, "steps": 15, "stress_level": 2},
]

df = pd.DataFrame(data)
df.to_csv("watch_data.csv", index=False)
print("✅ Created watch_data.csv")
print(df)