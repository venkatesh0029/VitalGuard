from fastapi import APIRouter, Depends, HTTPException
from models.schemas import AlertRequest
from utils.alerts import trigger_alert
from utils.security import verify_access_token
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/alert")
def send_alert(payload: AlertRequest, auth_user_id: str = Depends(verify_access_token)):
    """
    Manually trigger an alert (requires JWT auth).
    Only users can trigger alerts for their own data.
    """
    # Verify user can only alert for themselves unless admin
    if auth_user_id != payload.user_id:
        logger.warning(f"⚠️ Unauthorized alert by {auth_user_id} for {payload.user_id}")
        raise HTTPException(status_code=403, detail="Forbidden")
    
    results = trigger_alert(
        user_id    = payload.user_id,
        risk_level = payload.risk_level,
        heart_rate = payload.heart_rate,
        spo2       = payload.spo2,
        email      = payload.contact_email,
        phone      = payload.contact_phone,
    )
    
    logger.info(f"🔔 Alert triggered for {payload.user_id} - {payload.risk_level}")
    
    return {
        "message": f"Alert processed for {payload.user_id}",
        "risk_level": payload.risk_level,
        "channels": results
    }
