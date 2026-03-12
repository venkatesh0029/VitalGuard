import os
import time
import datetime
import pandas as pd
from predictor import GroqHealthPredictor

# CONFIG
CSV_FILE = "watch_data.csv"
CHECK_INTERVAL = 3  # Check for new data every 3 seconds

# Colors
GREEN = '\033[92m'
YELLOW = '\033[93m'
RED = '\033[91m'
RESET = '\033[0m'

def get_last_modified(filepath):
    """Get last modified time of file"""
    if os.path.exists(filepath):
        return os.path.getmtime(filepath)
    return 0

def read_latest_vitals(filepath):
    """Read the last row from CSV"""
    try:
        df = pd.read_csv(filepath)
        if len(df) == 0:
            return None
        
        last = df.iloc[-1]
        return {
            'heart_rate': float(last.get('heart_rate', last.get('Heart Rate', 75))),
            'spo2': float(last.get('spo2', last.get('SpO2', 98))),
            'steps': int(last.get('steps', last.get('Steps', 0))),
            'stress_level': int(last.get('stress_level', last.get('Stress', 2)))
        }
    except Exception as e:
        print(f"⚠️ CSV error: {e}")
        return None

def run_monitor():
    print("=" * 60)
    print("🏥 VITALGUARD AI - Health Monitor")
    print("=" * 60)
    print()
    
    # Initialize AI
    try:
        ai = GroqHealthPredictor()
    except Exception as e:
        print(f"❌ {e}")
        print("💡 Get Groq API key from: https://console.groq.com")
        return
    
    # Check CSV exists
    if not os.path.exists(CSV_FILE):
        print(f"❌ {CSV_FILE} not found!")
        print("💡 Create it with: python create_sample_csv.py")
        return
    
    print(f"📁 Watching: {CSV_FILE}")
    print("💡 Update the CSV file → AI auto-detects and predicts!")
    print("   Press Ctrl+C to stop\n")
    
    last_modified = get_last_modified(CSV_FILE)
    iteration = 0
    
    while True:
        try:
            iteration += 1
            current_modified = get_last_modified(CSV_FILE)
            
            # Check if CSV was updated
            if current_modified > last_modified:
                last_modified = current_modified
                vitals = read_latest_vitals(CSV_FILE)
                
                if vitals:
                    # Get AI prediction
                    print(f"  📡 New data detected! Analyzing...", end='\r')
                    result = ai.predict(vitals)
                    
                    # Display
                    risk = result.get('risk_level', 'Normal')
                    color = GREEN if risk == 'Normal' else YELLOW if risk == 'Warning' else RED
                    
                    print(f"  ✅ Analysis Complete!{' ' * 30}\n")
                    print(f"{color}{'=' * 60}{RESET}")
                    print(f"{color}📊 READING #{iteration} | {datetime.datetime.now().strftime('%H:%M:%S')}{RESET}")
                    print(f"{color}{'=' * 60}{RESET}")
                    print(f"{color}  ❤️  Heart Rate:  {vitals['heart_rate']:.0f} BPM{RESET}")
                    print(f"{color}  🩸  SpO2:        {vitals['spo2']:.0f}%{RESET}")
                    print(f"{color}  🚶  Steps:       {vitals['steps']}{RESET}")
                    print(f"{color}  😰  Stress:      {vitals['stress_level']}/10{RESET}")
                    print(f"{color}{'=' * 60}{RESET}")
                    print(f"{color}  🎯  RISK:        {result['risk_level']}{RESET}")
                    print(f"{color}  💭  Reason:      {result.get('reasoning', 'N/A')}{RESET}")
                    print(f"{color}{'=' * 60}{RESET}")
                    
                    if risk == 'Critical':
                        print(f"\n{RED}🚨 CRITICAL ALERT! Seek medical help!{RESET}\n")
                    elif risk == 'Warning':
                        print(f"\n{YELLOW}⚠️  WARNING! Monitor closely!{RESET}\n")
                else:
                    print("  ⚠️  Could not read CSV data")
            else:
                # No new data
                print(f"  ⏳  Waiting for new data... ({iteration}){' ' * 20}", end='\r')
            
            time.sleep(CHECK_INTERVAL)
            
        except KeyboardInterrupt:
            print(f"\n\n{RESET}👋 Stopped. Good luck! 🚀\n")
            break
        except Exception as e:
            print(f"\n❌ Error: {e}\n")
            time.sleep(2)

if __name__ == "__main__":
    run_monitor()