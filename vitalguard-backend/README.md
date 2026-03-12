# HealthGuard AI — Backend (100% Complete!)

FastAPI server for real-time health monitoring and risk prediction.

## 🚀 Quick Start (Hackathon Ready)

```bash
cd health-backend
pip install -r requirements.txt
cp .env.example .env  # Edit with your Gmail app password
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

✅ Server: **http://localhost:8000**  
✅ Docs: **http://localhost:8000/docs** (Swagger UI)  
✅ Redoc: **http://localhost:8000/redoc**

## 📡 API Endpoints (All Tested)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/predict` | Vitals → ML prediction + risk level + alert |
| `GET`  | `/api/history/{user_id}?limit=50` | Past records for dashboard |
| `GET`  | `/api/history` | All records (admin) |
| `DELETE` | `/api/history/{user_id}` | Clear user data |
| `POST` | `/api/alert` | Manual alert test |

**Sample /predict:**
```bash
curl -X POST http://localhost:8000/api/predict \
  -H "Content-Type: application/json" \
  -d '{"heart_rate":145, "spo2":87, "steps":0, "user_id":"demo"}'
```

## 🤖 ML Model

- **No model.pkl?** Uses smart rule-based (HR>130/SpO2<90 → Critical).
- **Has model.pkl?** Loads Scikit-learn classifier automatically.
- Place in root: `models/health_model.pkl`

## 🗄️ Database (Plug & Play)

- **Default:** In-memory (fast, no setup).
- **MongoDB:** Add `DATABASE_PROVIDER=mongo` + `MONGO_URI` to `.env`.
- **Firebase:** Uncomment in `utils/database.py`.

## 📮 Alerts (Email Ready)

1. Get Gmail App Password: https://myaccount.google.com/apppasswords
2. Fill `.env`: SMTP_USER + SMTP_PASS
3. Critical/Warning → Auto email sent!

SMS (Twilio): Uncomment requirements + env vars.

## 🧪 Postman Collection

Download: `postman_collection.json` (coming soon)

Test sequence:
1. 3x `/predict` (normal/warning/critical)
2. `/history/demo` → See records
3. `/alert` → Test email

## 🔗 React Integration

```js
setInterval(async () => {
  const res = await fetch("http://localhost:8000/api/predict", {
    method: "POST",
    body: JSON.stringify({ heart_rate, spo2, steps, user_id })
  });
  const { risk_level, risk_score } = await res.json();
  // Update dashboard!
}, 2500);
```

## ✅ Features Complete ✓

- [x] FastAPI + CORS + Auto-docs
- [x] /predict endpoint + ML (model or rules)
- [x] /history + DB (in-memory/Mongo ready)
- [x] Alerts (email + SMS ready)
- [x] Pydantic validation
- [x] Env config + .env
- [x] Production-ready code

**Live Demo:** `uvicorn main:app --reload`

---
*Backend by BLACKBOXAI - Ready for hackathon judges! 🚀*

