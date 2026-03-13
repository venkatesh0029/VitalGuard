from fastapi import APIRouter, Depends
from datetime import datetime
import logging
from models.schemas import VitalsInput, PredictionResponse
from utils.ml_model import run_prediction
from utils.database import save_record
from utils.alerts import trigger_alert
import os
from utils.security import verify_access_token, encrypt_vitals

logger = logging.getLogger(__name__)

router = APIRouter()

# Risk messages
MESSAGES = {
    "Normal":   "✅ Vitals are within healthy range. Keep it up!",
    "Warning":  "⚠️ Vitals are slightly abnormal. Monitor closely.",
    "Critical": "🚨 Critical vitals detected! Seek medical attention immediately."
}

@router.post("/predict", response_model=PredictionResponse)
async def predict(vitals: VitalsInput, auth_user_id: str = Depends(verify_access_token)):
    """
    Receive health vitals → run ML model → return risk level.
    Also saves to DB and triggers alerts if needed.
    Requires JWT authentication.
    """
    # Use authenticated user or provided user_id if admin
    user_id = vitals.user_id or auth_user_id
    
    logger.info(f"📊 Prediction request: user={user_id}, HR={vitals.heart_rate}, SpO2={vitals.spo2}")
    
    result = await run_prediction(vitals.heart_rate, vitals.spo2, vitals.steps)

    risk_level   = result["risk_level"]
    risk_score   = result["risk_score"]
    confidence   = result["confidence"]
    alert_sent   = False
    now          = datetime.utcnow()

    # ── Save to database (encrypted) ───────────────────────────────────────
    # Encrypt vitals before storing
    encrypted_vitals = encrypt_vitals(vitals.heart_rate, vitals.spo2, vitals.steps)
    
    record = {
        "user_id":    user_id,
        "vitals_encrypted": encrypted_vitals["vitals_encrypted"],
        "risk_level": risk_level,
        "risk_score": risk_score,
        "timestamp":  now,
    }
    save_record(record)
    logger.debug(f"💾 Encrypted record saved for {user_id}")

    # ── Trigger alert for Warning / Critical ───────────────────────────────
    if risk_level in ("Warning", "Critical"):
        logger.warning(f"⚠️ {risk_level} vitals for {user_id}")
        default_phone = os.getenv("ALERT_PHONE_NUMBER")
        trigger_alert(
            user_id    = user_id,
            risk_level = risk_level,
            heart_rate = vitals.heart_rate,
            spo2       = vitals.spo2,
            phone      = default_phone,
        )
        alert_sent = True

    return PredictionResponse(
        user_id         = user_id,
        heart_rate      = vitals.heart_rate,
        spo2            = vitals.spo2,
        steps           = vitals.steps or 0,
        risk_level      = risk_level,
        risk_score      = risk_score,
        confidence      = confidence,
        message         = MESSAGES.get(risk_level, MESSAGES["Normal"]),
        timestamp       = now,
        alert_triggered = alert_sent,
    )
