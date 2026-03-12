import os
import csv
import json
import time
import pandas as pd
from datetime import datetime, timedelta

# Optional: Google Fit import (will fail gracefully if not configured)
try:
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build
    GOOGLE_FIT_AVAILABLE = True
except ImportError:
    GOOGLE_FIT_AVAILABLE = False

class WatchDataFetcher:
    def __init__(self, csv_path="watch_data.csv", use_google_fit=False):
        self.csv_path = csv_path
        self.use_google_fit = use_google_fit and GOOGLE_FIT_AVAILABLE
        self.last_fetch_time = {}
        self.cached_data = {}
        
        if self.use_google_fit:
            self._init_google_fit()
        
        print(f"✅ WatchDataFetcher initialized (CSV: {csv_path}, Google Fit: {self.use_google_fit})")
    
    def _init_google_fit(self):
        """Initialize Google Fit API (optional)"""
        creds_file = os.getenv("GOOGLE_CREDENTIALS_FILE", "credentials.json")
        token_file = "token.pkl"
        scopes = ["https://www.googleapis.com/auth/fitness.activity.read"]
        
        creds = None
        if os.path.exists(token_file):
            import pickle
            with open(token_file, 'rb') as token:
                creds = pickle.load(token)
        
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            elif os.path.exists(creds_file):
                flow = InstalledAppFlow.from_client_secrets_file(creds_file, scopes)
                creds = flow.run_local_server(port=0)
                import pickle
                with open(token_file, 'wb') as token:
                    pickle.dump(creds, token)
        
        if creds:
            self.fit_service = build('fitness', 'v1', credentials=creds)
            print("✅ Google Fit connected (steps only)")
        else:
            self.use_google_fit = False
            print("⚠️ Google Fit setup failed - using CSV fallback")
    
    def fetch_google_fit_steps(self):
        """Fetch steps from last 60 seconds via Google Fit"""
        if not self.use_google_fit:
            return None
        
        try:
            now = int(datetime.now().timestamp() * 1e9)
            start = now - (60 * 1e9)
            
            # Find steps data source
            response = self.fit_service.users().dataSources().list(userId='me').execute()
            steps_source = None
            for ds in response.get('dataSource', []):
                if ds.get('dataType', {}).get('name') == 'com.google.step_count.delta':
                    steps_source = ds['dataSourceId']
                    break
            
            if not steps_source:
                return 0
            
            dataset = self.fit_service.users().dataSources().datasets().get(
                userId='me', dataSourceId=steps_source,
                startTime=start, endTime=now
            ).execute()
            
            points = dataset.get('point', [])
            if points:
                return sum(int(p['value'][0]['intVal']) for p in points)
            return 0
        except Exception as e:
            print(f"⚠️ Google Fit steps error: {e}")
            return None
    
    def fetch_from_csv(self):
        """
        Fetch latest vitals from NoiseFit CSV export.
        
        How to export from NoiseFit app:
        1. Open NoiseFit app → Profile → Data Export
        2. Export as CSV → Save to phone/computer
        3. Copy to ai-engine/watch_data.csv
        4. Update this file every few minutes during demo
        """
        if not os.path.exists(self.csv_path):
            return None
        
        try:
            df = pd.read_csv(self.csv_path)
            
            # Get latest row (most recent reading)
            latest = df.iloc[-1]
            
            # Map NoiseFit columns to our format (adjust column names as needed)
            vitals = {
                'heart_rate': float(latest.get('heart_rate', latest.get('Heart Rate', 0))),
                'spo2': float(latest.get('spo2', latest.get('SpO2', latest.get('Blood Oxygen', 0)))),
                'steps': int(latest.get('steps', latest.get('Steps', 0))),
                'stress_level': int(latest.get('stress_level', latest.get('Stress', 0))),
                'timestamp': latest.get('timestamp', latest.get('Timestamp', datetime.now().isoformat())),
                'source': 'watch'
            }
            
            # Clean invalid values
            if vitals['heart_rate'] <= 0: vitals['heart_rate'] = None
            if vitals['spo2'] <= 0: vitals['spo2'] = None
            
            return vitals
            
        except Exception as e:
            print(f"⚠️ CSV read error: {e}")
            return None
    
    def fetch_vitals(self):
        """
        Main method: Fetch real watch data with fallbacks.
        Priority: Google Fit steps + CSV HR/SpO2 → CSV only → Simulated
        """
        vitals = {}
        
        # Try CSV first (most reliable for HR/SpO2 from Noise)
        csv_data = self.fetch_from_csv()
        if csv_data:
            vitals.update(csv_data)
        
        # Try Google Fit for steps (if available and CSV didn't have steps)
        if self.use_google_fit and (not vitals.get('steps') or vitals.get('steps') == 0):
            steps = self.fetch_google_fit_steps()
            if steps is not None:
                vitals['steps'] = steps
                vitals['source'] = 'watch'
        
        # If we have at least HR or SpO2 from watch, mark as real
        if vitals.get('heart_rate') or vitals.get('spo2'):
            vitals['source'] = 'watch'
            print(f"📡 Real watch data: HR={vitals.get('heart_rate')}, SpO2={vitals.get('spo2')}")
            return vitals
        
        # Fallback: Return None to trigger simulated mode
        print("⚠️ No real watch data available - using simulated fallback")
        return None

# Quick test
if __name__ == "__main__":
    fetcher = WatchDataFetcher()
    data = fetcher.fetch_vitals()
    print("📊 Fetched:", data)