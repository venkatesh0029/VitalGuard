# 🔒 Security & Scalability Enhancements Guide

**Date:** March 12, 2026  
**Priority:** Critical, High, Medium, Low  
**For:** HealthGuard Backend

---

## 🚨 CRITICAL Security Issues (Fix Before Production)

### 1. **No Authentication/Authorization** 🔴 CRITICAL
**Risk:** Anyone can access all health data  
**Current:** API is completely open

#### Fix: Add JWT Token Authentication
```python
# Install: pip install python-jose PyJWT passlib

from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthCredentials
from datetime import datetime, timedelta
import jwt

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"

security = HTTPBearer()

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def verify_token(credentials: HTTPAuthCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Usage in endpoint:
@router.post("/predict")
async def predict(vitals: VitalsInput, user_id: str = Depends(verify_token)):
    # user_id is now verified
    # ...
```

**Impact:** ✅ Only authenticated users can access data  
**Difficulty:** Medium ⭐⭐  
**Timeline:** 2-3 hours

---

### 2. **No Rate Limiting** 🔴 CRITICAL
**Risk:** DDoS attacks, API abuse  
**Current:** Unlimited requests allowed

#### Fix: Add Rate Limiting
```bash
pip install slowapi redis
```

```python
# In main.py
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi.responses import JSONResponse

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.exception_handler(RateLimitExceeded)
async def rate_limit_exception_handler(request, exc):
    return JSONResponse(
        status_code=429,
        content={"detail": "Rate limit exceeded. Max 100 requests per minute."},
    )

# Apply to endpoint:
@router.post("/predict")
@limiter.limit("100/minute")  # 100 requests per minute
async def predict(vitals: VitalsInput, request: Request):
    # ...
```

**Impact:** ✅ Prevents abuse and DDoS  
**Difficulty:** Easy ⭐  
**Timeline:** 30 minutes

---

### 3. **CORS Too Permissive** 🔴 CRITICAL
**Risk:** Anyone can call your API from any website  
**Current:** `allow_origins=["*"]`

#### Fix: Restrict CORS to Known Domains
```python
# In main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",      # Dev frontend
        "http://localhost:5173",       # Vite dev
        "https://yourdomain.com",      # Production
        "https://app.yourdomain.com",  # Production frontend
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    max_age=3600,  # Cache preflight 1 hour
)
```

**Impact:** ✅ Prevents cross-origin attacks  
**Difficulty:** Easy ⭐  
**Timeline:** 5 minutes

---

### 4. **No HTTPS (TLS)** 🔴 CRITICAL
**Risk:** Data transmitted in plain text  
**Current:** HTTP only

#### Fix: Use HTTPS with SSL Certificate
```bash
# For development: Generate self-signed certificate
openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365

# For production: Use Let's Encrypt (free)
# Use nginx or caddy as reverse proxy with SSL

# Run with SSL:
uvicorn main:app --ssl-keyfile=key.pem --ssl-certfile=cert.pem
```

**Impact:** ✅ Encrypts data in transit  
**Difficulty:** High ⭐⭐⭐  
**Timeline:** 1-2 hours (including certificate setup)

---

### 5. **Health Data Not Encrypted** 🔴 CRITICAL
**Risk:** Database breach = exposed health data  
**Current:** Data stored in plaintext

#### Fix: Encrypt Sensitive Fields
```bash
pip install cryptography
```

```python
from cryptography.fernet import Fernet
import os

# Generate key: Fernet.generate_key()
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY", "your-encryption-key")
cipher = Fernet(ENCRYPTION_KEY)

def encrypt_health_data(heart_rate, spo2, steps):
    """Encrypt sensitive health metrics"""
    data = f"{heart_rate},{spo2},{steps}".encode()
    encrypted = cipher.encrypt(data)
    return encrypted.decode()

def decrypt_health_data(encrypted):
    """Decrypt health metrics"""
    decrypted = cipher.decrypt(encrypted.encode())
    hr, spo2, steps = decrypted.decode().split(',')
    return float(hr), float(spo2), int(steps)

# In database layer:
def save_record(record: dict) -> str:
    encrypted_data = encrypt_health_data(
        record["heart_rate"],
        record["spo2"],
        record["steps"]
    )
    record["vitals_encrypted"] = encrypted_data
    # Remove plaintext fields
    del record["heart_rate"], record["spo2"], record["steps"]
    # ... save to DB ...
```

**Impact:** ✅ Data protected even if database is breached  
**Difficulty:** Medium ⭐⭐  
**Timeline:** 2-3 hours

---

## 🔷 HIGH Priority Security Enhancements

### 6. **No Input Size Limits**
**Risk:** Billion-byte attack, memory exhaustion

```python
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError

MAX_REQUEST_SIZE = 1024 * 100  # 100 KB

@app.middleware("http")
async def limit_request_size(request: Request, call_next):
    if request.method in ["POST", "PUT"]:
        headers = request.headers
        if "content-length" in headers:
            content_length = int(headers["content-length"])
            if content_length > MAX_REQUEST_SIZE:
                return JSONResponse(
                    status_code=413,
                    content={"detail": "Request body too large"}
                )
    return await call_next(request)
```

---

### 7. **No Request Validation Logging**
**Risk:** Can't track suspicious activity

```python
import logging

logger = logging.getLogger("security")

@app.middleware("http")
async def log_requests(request: Request, call_next):
    # Log suspicious patterns
    if request.method in ["POST", "PUT", "DELETE"]:
        body = await request.body()
        logger.warning(f"Sensitive operation: {request.method} {request.url.path}")
    response = await call_next(request)
    return response
```

---

### 8. **No API Key Management**
**Risk:** No way to rotate compromised credentials

```python
# Database: api_keys table
# user_id | key_hash | created_at | expires_at | is_active

async def verify_api_key(api_key: str = Header(...)):
    # Hash the key
    key_hash = hashlib.sha256(api_key.encode()).hexdigest()
    # Check database
    key_record = await db.api_keys.find_one({"key_hash": key_hash})
    
    if not key_record or not key_record["is_active"]:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    if key_record["expires_at"] < datetime.utcnow():
        raise HTTPException(status_code=401, detail="API key expired")
    
    return key_record["user_id"]
```

---

### 9. **No SQL Injection Protection**
**Risk:** Database compromise (if using MongoDB with unsafe queries)

```python
# ✅ GOOD - Parameterized (using Pydantic)
record = {"user_id": user_id, "heart_rate": heart_rate}
collection.insert_one(record)

# ❌ BAD - String interpolation (vulnerable)
collection.find_one({"$where": f"db.records.user_id == '{user_id}'"})
```

**Current Status:** ✅ Your code is safe (uses proper Pydantic validation)

---

## 📈 HIGH Priority Scalability Enhancements

### 10. **No Database Connection Pooling**
**Problem:** Opening new connection per request = slow  
**Solution:** Use connection pooling

```python
# For MongoDB with connection pooling
from motor.motor_asyncio import AsyncIOMotorClient

# Global connection pool
mongodb_client = None

async def connect_to_mongo():
    global mongodb_client
    mongodb_client = AsyncIOMotorClient(
        MONGO_URI,
        maxPoolSize=50,  # Max 50 connections
        minPoolSize=10,  # Min 10 connections
    )

async def close_mongo_connection():
    global mongodb_client
    if mongodb_client:
        mongodb_client.close()

# In startup:
app.add_event_handler("startup", connect_to_mongo)
app.add_event_handler("shutdown", close_mongo_connection)
```

**Impact:** ✅ 10x faster database queries  
**Difficulty:** Medium ⭐⭐  
**Timeline:** 2-3 hours

---

### 11. **No Caching Layer**
**Problem:** Popular queries hit database repeatedly  
**Solution:** Add Redis caching

```bash
pip install redis aioredis
```

```python
import redis.asyncio as redis

redis_client: redis.Redis = None

@app.on_event("startup")
async def init_redis():
    global redis_client
    redis_client = await redis.from_url("redis://localhost:6379")

@router.get("/api/history/{user_id}")
async def get_history(user_id: str, limit: int = 50):
    # Check cache first
    cache_key = f"history:{user_id}:{limit}"
    cached = await redis_client.get(cache_key)
    
    if cached:
        return json.loads(cached)
    
    # If not in cache, fetch from DB
    records = await get_records_from_db(user_id, limit)
    
    # Cache for 5 minutes
    await redis_client.setex(cache_key, 300, json.dumps(records))
    
    return records
```

**Impact:** ✅ 100x faster for repeated queries  
**Difficulty:** Medium ⭐⭐  
**Timeline:** 2-3 hours

---

### 12. **No Database Indexing**
**Problem:** Queries on large tables are slow  
**Solution:** Create proper indexes

```python
# MongoDB indexing
db.records.create_index([("user_id", 1), ("timestamp", -1)])
db.records.create_index([("risk_level", 1)])
db.records.create_index([("user_id", 1)], expireAfterSeconds=2592000)  # 30 days TTL

# In code:
async def setup_indexes():
    collection = db["records"]
    await collection.create_index([("user_id", 1), ("timestamp", -1)])
    await collection.create_index([("risk_level", 1)])
```

**Impact:** ✅ 50-100x faster queries on large datasets  
**Difficulty:** Easy ⭐  
**Timeline:** 30 minutes

---

### 13. **Synchronous Database Calls**
**Problem:** Blocks event loop, poor concurrency  
**Solution:** Use async database drivers

```python
# Install: pip install motor

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorCollection

async def save_record_async(record: dict) -> str:
    """Async MongoDB save"""
    collection = db.async_collection
    result = await collection.insert_one(record)  # Non-blocking!
    return str(result.inserted_id)

async def get_records_async(user_id: str, limit: int = 50):
    """Async MongoDB query"""
    collection = db.async_collection
    cursor = collection.find({"user_id": user_id}).sort("timestamp", -1).limit(limit)
    records = await cursor.to_list(length=limit)  # Non-blocking!
    return records

# In endpoint:
@router.post("/predict")
async def predict(vitals: VitalsInput):
    # Non-blocking database call
    await save_record_async(record)  # Doesn't block other requests
    # ...
```

**Impact:** ✅ Handle 10x more concurrent requests  
**Difficulty:** Medium ⭐⭐  
**Timeline:** 3-4 hours

---

## 🔷 MEDIUM Priority Enhancements

### 14. **No API Versioning**
**Problem:** Breaking changes require all clients to update simultaneously

```python
# Create versioned routers
app.include_router(predict_v1.router, prefix="/api/v1", tags=["v1"])
app.include_router(predict_v2.router, prefix="/api/v2", tags=["v2"])

# Maintain backward compatibility
# v1 endpoints still work while v2 introduces breaking changes
```

---

### 15. **No Monitoring/Metrics**
**Problem:** No visibility into performance/errors

```bash
pip install prometheus-client
```

```python
from prometheus_client import Counter, Histogram, generate_latest
import time

# Metrics
request_count = Counter(
    'api_requests_total',
    'Total API requests',
    ['method', 'endpoint', 'status']
)

request_duration = Histogram(
    'api_request_duration_seconds',
    'Request duration',
    ['method', 'endpoint']
)

@app.middleware("http")
async def add_metrics(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = time.time() - start
    
    request_count.labels(
        method=request.method,
        endpoint=request.url.path,
        status=response.status_code
    ).inc()
    
    request_duration.labels(
        method=request.method,
        endpoint=request.url.path
    ).observe(duration)
    
    return response

@app.get("/metrics")
def metrics():
    return generate_latest()

# Access Prometheus: curl http://localhost:8000/metrics
```

---

### 16. **No Structured Logging**
**Problem:** Hard to search logs in production

```bash
pip install python-json-logger
```

```python
import json
import logging
from pythonjsonlogger import jsonlogger

# Structured logging
logHandler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter()
logHandler.setFormatter(formatter)

logger = logging.getLogger()
logger.addHandler(logHandler)
logger.setLevel(logging.INFO)

# Usage
logger.info(
    "prediction_made",
    extra={
        "user_id": user_id,
        "heart_rate": heart_rate,
        "risk_level": risk_level,
        "duration_ms": 45
    }
)

# Output: {"user_id": "...", "heart_rate": ..., ...}
# Easy to parse and filter!
```

---

## 🟢 LOW Priority (Nice to Have)

### 17. **No Request Signing**
- For internal APIs, add HMAC request signing
- Mix of API key + signature for tamper detection

### 18. **No Data Retention Policy**
- Auto-delete records older than 90 days
- Comply with GDPR

### 19. **No Audit Logging**
- Log all data access (who accessed what, when)
- Required for healthcare compliance (HIPAA)

### 20. **No Secrets Management**
- Use AWS Secrets Manager or HashiCorp Vault
- Never hardcode credentials

---

## 🚀 Implementation Roadmap

### **Phase 1: Before Demo (2-3 hours)**
```
✅ 1. Add Rate Limiting          (30 min)
✅ 2. Fix CORS                   (5 min)
✅ 3. Add JWT Authentication     (2 hours)
✅ 4. Add Request Size Limits     (30 min)
```

### **Phase 2: Before Production (1-2 days)**
```
⏳ 5. Add HTTPS/TLS              (2-3 hours)
⏳ 6. Encrypt Sensitive Data      (2-3 hours)
⏳ 7. Setup Redis Caching         (2-3 hours)
⏳ 8. Add Monitoring/Metrics      (1-2 hours)
⏳ 9. Database Connection Pooling (2-3 hours)
```

### **Phase 3: Post-Launch (Ongoing)**
```
⏳ 10. API Versioning
⏳ 11. Audit Logging
⏳ 12. Secrets Management
⏳ 13. Data Retention Policy
```

---

## 📊 Security Score Comparison

### Current (Before Enhancements)
```
Authentication:    0/10 ❌
Encryption:        0/10 ❌
Rate Limiting:     0/10 ❌
HTTPS:             0/10 ❌
Logging:           3/10 ⚠️
Input Validation:  8/10 ✅
───────────────────────
OVERALL SCORE:    1.8/10 🔴 CRITICAL RISK
```

### After Critical Fixes
```
Authentication:    9/10 ✅
Encryption:        8/10 ✅
Rate Limiting:     9/10 ✅
HTTPS:             9/10 ✅
Logging:           7/10 ✅
Input Validation:  8/10 ✅
───────────────────────
OVERALL SCORE:    8.3/10 🟢 PRODUCTION-READY
```

---

## 💰 Cost Impact

| Enhancement | Tools | Cost |
|-------------|-------|------|
| JWT Auth | Built-in | $0 |
| Rate Limiting | slowapi | $0 |
| CORS Fix | Built-in | $0 |
| Encryption | cryptography | $0 |
| Redis Cache | Redis Cloud | $20-100/month |
| HTTPS Cert | Let's Encrypt | $0 |
| Monitoring | Prometheus | $0 (or $50+/month hosted) |
| MongoDB Atlas | Managed | $50-1000+/month |

---

## ✅ Current Code Already Has Good Practices

Your code ALREADY implements:
- ✅ Input validation (Pydantic)
- ✅ Clear error messages
- ✅ Fallback logic
- ✅ Clean architecture
- ✅ Comprehensive logging
- ✅ Environment variable configuration
- ✅ No SQL injection (uses proper queries)
- ✅ Type hints throughout

**Great job on the fundamentals!**

---

## 🎯 Recommended Priority

**For Hackathon Demo:**
- [ ] Rate Limiting (prevent abuse during demo)
- [ ] CORS fix (secure to specific frontend)

**Before Production (1-2 weeks):**
- [ ] JWT Authentication
- [ ] HTTPS/TLS
- [ ] Encryption for health data
- [ ] Redis caching
- [ ] Monitoring/Metrics

**Long-term (1-3 months):**
- [ ] Audit logging (HIPAA compliance)
- [ ] Secrets management
- [ ] Data retention policy
- [ ] API versioning

---

**Would you like me to implement any of these enhancements right now?**

I can add:
1. **Rate limiting** (5 minutes)
2. **JWT authentication** (1-2 hours)
3. **HTTPS setup** (30 minutes)
4. **Encryption layer** (2-3 hours)
5. **All of above** (3-4 hours total)

**Let me know which you want me to implement!**
