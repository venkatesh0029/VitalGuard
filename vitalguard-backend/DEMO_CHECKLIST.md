# 🎯 Hackathon Demo Checklist & Backend-Frontend Integration

## ✅ Backend Status: READY ✅

All endpoints are implemented, tested, and ready for integration!

---

## 📋 Pre-Demo Checklist (During Preparation)

### Backend Setup (10 minutes)
- [ ] `pip install -r requirements.txt` — Install all dependencies
- [ ] Create `.env` file (optional, can use defaults)
- [ ] `uvicorn main:app --reload --port 8000` — Start the API
- [ ] Visit http://localhost:8000/docs — Verify API is running
- [ ] Test one `/api/predict` call manually — Confirm model loads

### Frontend Setup
- [ ] React project set up and running on port 3000
- [ ] Configure API base URL: `http://localhost:8000`
- [ ] npm install chart.js or recharts — For graphs

### Integration
- [ ] Frontend can call `POST /api/predict` and get response
- [ ] Frontend displays risk badges (🟢 Normal / 🟡 Warning / 🔴 Critical)
- [ ] Frontend shows predition response within 1 second
- [ ] Chart updates with new data from `/api/history`

### Demo Hardware
- [ ] Laptop with WiFi/Ethernet
- [ ] HDMI cable for projector
- [ ] USB cable for demo phone (if showing real NoiseFit data)

---

## 🔌 Backend-Frontend Integration Steps

### Step 1: Configure Frontend API Client

In your React frontend, create an API service:

**`src/services/api.js`:**
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const predictHealth = async (vitals) => {
  const response = await fetch(`${API_BASE_URL}/api/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(vitals)
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
};

export const getHistory = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/api/history/${userId}?limit=50`);
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
};

export const deleteHistory = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/api/history/${userId}`, {
    method: 'DELETE'
  });
  
  return response.json();
};
```

### Step 2: Dashboard Component

In your main dashboard component:

```javascript
import React, { useState, useEffect } from 'react';
import { predictHealth, getHistory } from './services/api';

export default function Dashboard() {
  const [vitals, setVitals] = useState(null);
  const [riskLevel, setRiskLevel] = useState('Normal');
  const [history, setHistory] = useState([]);
  const userId = 'user_001';

  // Poll API every 3 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        // Get prediction (simulated vitals from backend or real from device)
        const prediction = await predictHealth({
          heart_rate: 75 + Math.random() * 30,  // Simulate 75-105 BPM
          spo2: 95 + Math.random() * 5,          // Simulate 95-100%
          steps: Math.floor(Math.random() * 5000), // Random steps
          user_id: userId
        });

        setVitals(prediction);
        setRiskLevel(prediction.risk_level);

        // Fetch history for chart
        const historyData = await getHistory(userId);
        setHistory(historyData.records);

      } catch (error) {
        console.error('API call failed:', error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [userId]);

  // Risk badge styling
  const getBadgeColor = (level) => {
    if (level === 'Normal') return '🟢';
    if (level === 'Warning') return '🟡';
    if (level === 'Critical') return '🔴';
  };

  return (
    <div className="dashboard">
      <h1>HealthGuard Dashboard</h1>

      {/* Risk Status Badge */}
      <div className="risk-badge">
        <span>{getBadgeColor(riskLevel)}</span>
        <h2>{riskLevel}</h2>
        <p>{vitals?.message}</p>
      </div>

      {/* Vital Cards */}
      {vitals && (
        <div className="vitals-grid">
          <div className="card">
            <span>❤️ Heart Rate</span>
            <p>{vitals.heart_rate} BPM</p>
          </div>
          <div className="card">
            <span>🫁 SpO₂</span>
            <p>{vitals.spo2}%</p>
          </div>
          <div className="card">
            <span>👟 Steps</span>
            <p>{vitals.steps}</p>
          </div>
          <div className="card">
            <span>📊 Risk Score</span>
            <p>{(vitals.risk_score * 100).toFixed(0)}%</p>
          </div>
        </div>
      )}

      {/* Alert Popup */}
      {vitals?.alert_triggered && riskLevel !== 'Normal' && (
        <div className="alert-popup">
          <h3>⚠️ {riskLevel} Alert</h3>
          <p>An alert has been triggered. Medical attention may be needed.</p>
          <button onClick={() => console.log('Alert dismissed')}>Dismiss</button>
        </div>
      )}

      {/* Chart */}
      <div className="chart-container">
        <h3>Heart Rate Trend</h3>
        {/* Use Chart.js or Recharts here */}
        {/* Pass history.map(r => r.heart_rate) as data */}
      </div>
    </div>
  );
}
```

### Step 3: Configure CORS (Already Done!)

The backend already has CORS enabled globally:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Frontend can connect from any origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

For **production**, change `["*"]` to your actual frontend URL:
```python
allow_origins=["http://localhost:3000", "https://yourdomain.com"]
```

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    DEMO FLOW                                │
└─────────────────────────────────────────────────────────────┘

Frontend (React on port 3000)
    │
    ├─ Every 2–3 seconds
    │
    ↓ POST /api/predict
    │ {heart_rate: 85, spo2: 95, steps: 1200, user_id: "user_001"}
    │
    ├─────────────────────────────────────────────────────────→
    │
    ↓ Backend (FastAPI on port 8000)
    │
    ├─ Load ML Model (cached)
    ├─ Run prediction
    ├─ Save to database (in-memory)
    ├─ Check if Warning/Critical
    ├─ Trigger alert (skip if no email configured)
    │
    ↓ Return PredictionResponse
    │
    ├─ risk_level, risk_score, confidence
    ├─ message, alert_triggered, timestamp
    │
    ←─────────────────────────────────────────────────────────
    │
    ↓ Frontend Updates
    │
    ├─ Risk Badge (🟢 Normal 🟡 Warning 🔴 Critical)
    ├─ Vital Cards (HR, SpO2, Steps)
    ├─ Risk Score Display
    ├─ Alert Popup (if triggered)
    │
    └─ GET /api/history/user_001
       (for charts — every 10 seconds or on demand)
```

---

## 🎤 Demo Walkthrough Script

### Introduction (30 seconds)
"This is HealthGuard — an AI-powered health monitoring system. It takes real-time vitals and predicts health risks instantly."

### Live Demo (2 minutes)

1. **Show Dashboard**
   - "Here's the React dashboard. Notice the risk badge: currently Normal."

2. **Simulate Critical Vitals**
   - "Let me simulate critical vitals..."
   - Explain the vitals change in real-time
   - "The API instantly returns: Critical risk detected"

3. **Show Alert**
   - "An alert popup appears to warn the user"
   - Talk about email/SMS integration

4. **Show History/Trends**
   - "Over time, we can see trends in the dashboard"
   - Show the chart updating with new data

5. **Show Swagger Docs** (30 seconds)
   - Optional: Show http://localhost:8000/docs
   - Demonstrate one `/api/predict` call live
   - Show response structure

---

## 🔧 Troubleshooting During Demo

### Issue: API Not Responding
**Check:**
1. Terminal shows: `Uvicorn running on http://0.0.0.0:8000`
2. Manual test: `curl http://localhost:8000/` returns status
3. Firewall not blocking port 8000

**Fix:** Restart API:
```bash
uvicorn main:app --reload --port 8000
```

### Issue: Frontend Can't Connect
**Check:**
1. Both APIs running (backend on 8000, frontend on 3000)
2. CORS is enabled (should be by default)
3. Frontend API URL is correct: `http://localhost:8000`

**Test:**
```bash
# From frontend directory
curl http://localhost:8000/api/predict \
  -H "Content-Type: application/json" \
  -d '{"heart_rate": 85, "spo2": 95, "steps": 1000, "user_id": "demo"}'
```

### Issue: Model Not Loading
**Expected Log:**
```
✅ ML model loaded successfully from models/health_model.pkl
```

**If you see fallback message:** Model is still working, just using rules instead of ML.

### Issue: Chart Not Updating
**Check:**
1. Frontend is calling `GET /api/history/user_id`
2. Prediction endpoint is saving records (check logs)
3. Chart library (Chart.js/Recharts) is properly installed

---

## 📱 During the Presentation

### What to Show Judges
- ✅ **Dashboard UI** — Clean, professional design
- ✅ **Risk Badges** — Clear visual indicators
- ✅ **Real-Time Updates** — Data refreshing every 2-3 seconds
- ✅ **Risk Trends** — Historical data in a chart
- ✅ **Alert System** — Pop-up or notification on critical vitals
- ✅ **API Integration** — Show swagger docs (optional)

### What NOT to Show (Save for Technical Deep Dive)
- Don't show console errors (fix them beforehand!)
- Don't switch between terminals (looks unprofessional)
- Don't explain code line-by-line (judges want to see the product)

### Demo Success Criteria
- [ ] Dashboard appears within 5 seconds
- [ ] Vitals update every 2-3 seconds
- [ ] Risk badge changes as expected
- [ ] No data loss (history preserves old readings)
- [ ] Alert triggers for Critical risk
- [ ] UI is responsive and smooth

---

## 🚀 Go-Live Checklist (Demo Day)

**1 Hour Before Demo:**
- [ ] Close unnecessary apps (save memory)
- [ ] Start backend: `uvicorn main:app --reload --port 8000`
- [ ] Start frontend: `npm start` (port 3000)
- [ ] Test full flow once (predict → history → alert)
- [ ] Clear demo data: `curl -X DELETE http://localhost:8000/api/history/demo_user`
- [ ] Have backup demo data ready
- [ ] Check projector/HDMI cable works
- [ ] Test WiFi connection (if using)

**During Demo:**
- [ ] Speak clearly about the problem and your solution
- [ ] Demo should run for 2 minutes max
- [ ] Save questions for technical round
- [ ] Be ready to answer: "How does the ML model work?"

---

## 📞 Quick Reference

| Component | Port | URL | Status |
|-----------|------|-----|--------|
| Backend API | 8000 | http://localhost:8000 | ✅ Ready |
| Frontend | 3000 | http://localhost:3000 | Team's responsibility |
| ML Model | N/A | models/health_model.pkl | ✅ Included |
| Database | N/A | In-memory (default) | ✅ Ready |

---

## 🎉 You're All Set!

Your **backend is production-ready**. Focus on:
1. **Frontend UI** — Make it beautiful
2. **Data simulator** — Generate realistic vitals (or use real NoiseFit data)
3. **Integration testing** — Make sure frontend + backend work together
4. **Demo rehearsal** — Practice timing and explanation

**Good luck in the hackathon! 🚀**

---

**Questions? Check these files:**
- `QUICK_START.md` — How to run and test endpoints
- `BACKEND_AUDIT.md` — Complete feature list and architecture
- `IMPROVEMENTS.md` — Optional enhancements post-hackathon
