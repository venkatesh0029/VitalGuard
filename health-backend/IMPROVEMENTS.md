# Backend Enhancement Guide - Recommended Fixes

## 🎯 Priority Improvements for Hackathon Success

---

## 1. 🚀 Pre-Load Model at Startup (Recommended)

**Current Issue:** Model loads on first `/predict` request (~300ms delay)
**Impact:** First API call feels slow
**Difficulty:** Easy ⭐

### Solution: Implement Startup Event

Edit `main.py` and add model preloading:

```python
from contextlib import asynccontextmanager
from utils.ml_model import load_model

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Pre-load ML model
    print("🤖 Pre-loading ML model on startup...")
    load_model()
    print("✅ Model loaded successfully!")
    yield
    # Shutdown: Optional cleanup

app = FastAPI(
    title="HealthGuard AI API",
    description="Real-time health monitoring and risk prediction API",
    version="1.0.0",
    lifespan=lifespan  # Add this parameter
)
```

**Benefits:**

- No delay on first `/predict` call
- Users see instant responses

---

## 2. 📊 Add Data Validation Ranges (Medium Priority)

**Current Issue:** SpO₂ accepts 50-100% but realistic range is 90-100%
**Difficulty:** Easy ⭐

### Solution: Enhance `VitalsInput` in schemas.py

```python
class VitalsInput(BaseModel):
    heart_rate: float = Field(
        ..., 
        ge=30, 
        le=250, 
        description="BPM (beats per minute)"
    )
    spo2: float = Field(
        ..., 
        ge=70,      # Changed from 50 to more realistic
        le=100, 
        description="Oxygen saturation % (normal: 95-100)"
    )
    steps: Optional[int] = Field(
        0, 
        ge=0, 
        le=100000,  # Add upper limit
        description="Step count in past interval"
    )
    user_id: Optional[str] = Field(
        "default_user", 
        description="User identifier",
        min_length=1,  # Prevent empty strings
        max_length=50
    )
```

---

## 3. ⚠️ Add Error Logging & Monitoring (Medium Priority)

**Current Issue:** Silent failures if ML model crashes
**Difficulty:** Medium ⭐⭐

### Solution: Add logging to `utils/ml_model.py`

```python
import logging

logger = logging.getLogger(__name__)

def run_prediction(heart_rate: float, spo2: float, steps: int) -> dict:
    """Run prediction using ML model or fallback."""
    model = load_model()
    logger.info(f"Running prediction: HR={heart_rate}, SpO2={spo2}, Steps={steps}")

    if model == "FALLBACK":
        logger.warning("Using rule-based prediction (model not loaded)")
        return rule_based_predict(heart_rate, spo2, steps)

    try:
        # ... existing code ...
        logger.info(f"Prediction successful: {risk_level} (confidence: {confidence})")
        return result
    except Exception as e:
        logger.error(f"Model prediction failed: {e}", exc_info=True)
        return rule_based_predict(heart_rate, spo2, steps)
```

And in `main.py`:

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

---

## 4. 🔐 Add Request Rate Limiting (Low Priority - Nice to Have)

**Current Issue:** API has no rate limiting
**Difficulty:** Medium ⭐⭐

### Solution: Use `slowapi`

```bash
pip install slowapi
```

Add to `main.py`:

```python
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/api/predict")
@limiter.limit("100/minute")  # Max 100 predictions per minute
def predict(vitals: VitalsInput, request: Request):
    # ... existing code ...
```

---

## 5. 🎬 Add Startup/Shutdown Logging

**Difficulty:** Easy ⭐

```python
# In main.py

@app.on_event("startup")
async def startup_event():
    print("\n" + "="*60)
    print("🚀 HealthGuard API Starting...")
    print("="*60)
    print(f"📊 Database Provider: {os.getenv('DATABASE_PROVIDER', 'inmemory')}")
    print(f"🤖 ML Model Path: {os.getenv('MODEL_PATH', 'models/health_model.pkl')}")
    print("✅ API Running at http://localhost:8000")
    print("📖 Docs at http://localhost:8000/docs")
    print("="*60 + "\n")

@app.on_event("shutdown")
async def shutdown_event():
    print("\n🛑 HealthGuard API Shutdown\n")
```

---

## 6. ✅ Add Health Metrics Endpoint (Low Priority)

**Difficulty:** Easy ⭐

```python
@app.get("/metrics")
def get_metrics():
    """Return system health metrics for monitoring."""
    from utils.database import get_all_records
    records = get_all_records(limit=10000)
  
    normal_count = sum(1 for r in records if r.get("risk_level") == "Normal")
    warning_count = sum(1 for r in records if r.get("risk_level") == "Warning")
    critical_count = sum(1 for r in records if r.get("risk_level") == "Critical")
  
    return {
        "total_readings": len(records),
        "risk_distribution": {
            "normal": normal_count,
            "warning": warning_count,
            "critical": critical_count
        },
        "timestamp": datetime.utcnow()
    }
```

---

## 7. 🧪 Test Endpoints Posit Card

### Test `/predict` - Normal Case

```bash
curl -X POST http://localhost:8000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "heart_rate": 75,
    "spo2": 97,
    "steps": 5000,
    "user_id": "user_001"
  }'
```

### Test `/predict` - Warning Case

```bash
curl -X POST http://localhost:8000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "heart_rate": 110,
    "spo2": 93,
    "steps": 200,
    "user_id": "user_001"
  }'
```

### Test `/predict` - Critical Case

```bash
curl -X POST http://localhost:8000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "heart_rate": 140,
    "spo2": 88,
    "steps": 100,
    "user_id": "user_001"
  }'
```

### Test `/history` - Retrieve User Data

```bash
curl http://localhost:8000/api/history/user_001?limit=20
```

### Test `/history` - Delete User Records

```bash
curl -X DELETE http://localhost:8000/api/history/user_001
```

---

## 8. 📦 Prepare for Deployment

### Docker Support (Optional)

Create `Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:

```bash
docker build -t healthguard-api .
docker run -it -p 8000:8000 --env-file .env healthguard-api
```

---

## 🎯 Quick Checklist for Hackathon Demo

- [ ] ✅ Create `.env` file (copy from `.env.example`)
- [ ] ✅ Run `pip install -r requirements.txt`
- [ ] ✅ Test `/api/predict` endpoint with cURL
- [ ] ✅ Test `/api/history/{user_id}` endpoint
- [ ] ✅ Verify API docs at `/docs`
- [ ] ✅ Frontend can connect to `http://localhost:8000`
- [ ] ✅ Database is persisting records (test with `/history`)
- [ ] ✅ Model loads without errors (check console logs)

---

## 📈 Next Steps (Post-Hackathon)

1. **Move to MongoDB** for persistent storage
2. **Enable email/SMS alerts** with real credentials
3. **Add authentication** (JWT tokens)
4. **Add user management** (sign up, login)
5. **Add pagination** to `/history` endpoint
6. **Add filtering** (by date range, risk level)
7. **Add data export** (CSV download)

---

**Status:** Backend is production-ready for demo! 🚀
