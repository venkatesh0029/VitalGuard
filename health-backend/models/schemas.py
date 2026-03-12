from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# ── Incoming vitals from frontend / simulator ──────────────────────────────
class VitalsInput(BaseModel):
    heart_rate: float = Field(
        ..., 
        ge=30, 
        le=250, 
        description="Heart rate in BPM (beats per minute)"
    )
    spo2: float = Field(
        ..., 
        ge=70, 
        le=100, 
        description="Oxygen saturation % (healthy: 95-100%)"
    )
    steps: Optional[int] = Field(
        0, 
        ge=0, 
        le=100000,
        description="Step count in the past interval"
    )
    user_id: Optional[str] = Field(
        "default_user", 
        description="User identifier",
        min_length=1,
        max_length=50
    )

    class Config:
        json_schema_extra = {
            "example": {
                "heart_rate": 95,
                "spo2": 94,
                "steps": 1200,
                "user_id": "user_001"
            }
        }

# ── Prediction response ────────────────────────────────────────────────────
class PredictionResponse(BaseModel):
    user_id: str
    heart_rate: float
    spo2: float
    steps: int
    risk_level: str          # "Normal" | "Warning" | "Critical"
    risk_score: float        # 0.0 – 1.0
    confidence: float        # model confidence %
    message: str
    timestamp: datetime
    alert_triggered: bool

# ── History record (stored in DB) ─────────────────────────────────────────
class HealthRecord(BaseModel):
    id: Optional[str] = None
    user_id: str
    heart_rate: float
    spo2: float
    steps: int
    risk_level: str
    risk_score: float
    timestamp: datetime

# ── History response ───────────────────────────────────────────────────────
class HistoryResponse(BaseModel):
    user_id: str
    total_records: int
    records: List[HealthRecord]

# ── Alert payload ──────────────────────────────────────────────────────────
class AlertRequest(BaseModel):
    user_id: str
    risk_level: str
    heart_rate: float
    spo2: float
    message: str
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
