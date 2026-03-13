from fastapi import FastAPI, Request, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from routes import predict, history, alerts, importer, test_alerts
from utils.ml_model import load_model
from utils.security import verify_access_token, create_access_token, get_security_headers, Token
from models.schemas import VitalsInput
import uvicorn
import logging
import os
from dotenv import load_dotenv

# Force UTF-8 loading of .env before slowapi tries to read it
load_dotenv(encoding="utf-8")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ── Rate Limiting ──────────────────────────────────────────────────────────
# Pass os.environ to avoid SlowAPI triggering Starlette's buggy .env reader
limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Check AI engine availability
    logger.info("="*60)
    logger.info("🚀 HealthGuard API Starting...")
    logger.info("🔒 Security: Enabled (JWT, Rate Limiting, CORS, Encryption)")
    logger.info("="*60)
    ai_status = await load_model()
    logger.info(f"🤖 AI Engine status: {ai_status}")
    logger.info("✅ API is ready! Running at http://localhost:8000")
    logger.info("📖 Swagger Docs: http://localhost:8000/docs")
    logger.info("="*60)
    yield
    # Shutdown
    logger.info("🛑 HealthGuard API Shutdown")

app = FastAPI(
    title="HealthGuard AI API",
    description="Real-time health monitoring with JWT auth and encryption",
    version="1.0.0",
    lifespan=lifespan
)

# ── CORS Configuration (Restricted) ────────────────────────────────────────
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    max_age=3600,
)

# ── Trusted Host Middleware (Security) ─────────────────────────────────────
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]
)

# ── Rate Limiter Exception Handler ─────────────────────────────────────────
@app.exception_handler(RateLimitExceeded)
async def rate_limit_exception_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": "Rate limit exceeded. Maximum 100 requests per minute."},
    )

# ── Request Size Limit Middleware ──────────────────────────────────────────
MAX_REQUEST_SIZE = 1024 * 100  # 100 KB

@app.middleware("http")
async def limit_request_size(request: Request, call_next):
    if request.method in ["POST", "PUT", "PATCH"]:
        if "content-length" in request.headers:
            content_length = int(request.headers["content-length"])
            if content_length > MAX_REQUEST_SIZE:
                return JSONResponse(
                    status_code=413,
                    content={"detail": "Request body too large (max 100KB)"}
                )
    response = await call_next(request)
    
    # Add security headers to all responses
    security_headers = get_security_headers()
    for header, value in security_headers.items():
        response.headers[header] = value
    
    return response

# ── Public Endpoints (No Auth Required) ────────────────────────────────────
@app.get("/")
def root():
    return {"status": "HealthGuard API is running 🚀"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/health/ai")
async def ai_health_check():
    """Check AI engine status."""
    status = await load_model()
    return {"ai_engine": status}

@app.post("/auth/token", response_model=Token)
def login_for_access_token(user_id: str = "default_user"):
    """
    Get JWT access token. Required for all protected endpoints.
    Use in header: Authorization: Bearer <token>
    """
    access_token = create_access_token(data={"sub": user_id})
    logger.info(f"🔐 Token issued for {user_id}")
    return {"access_token": access_token, "token_type": "bearer"}

# ── Protected Routes (Require JWT Authentication) ───────────────────────────
app.include_router(predict.router, prefix="/api", tags=["Prediction"], dependencies=[Depends(verify_access_token)])
app.include_router(history.router, prefix="/api", tags=["History"], dependencies=[Depends(verify_access_token)])
app.include_router(alerts.router, prefix="/api", tags=["Alerts"], dependencies=[Depends(verify_access_token)])
app.include_router(importer.router, prefix="/api", tags=["Import"], dependencies=[Depends(verify_access_token)])
app.include_router(test_alerts.router, prefix="/api", tags=["Tests"], dependencies=[Depends(verify_access_token)])

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
