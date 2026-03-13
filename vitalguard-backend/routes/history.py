from fastapi import APIRouter, Query, Depends, HTTPException
from models.schemas import HistoryResponse, HealthRecord
from utils.database import get_records, get_all_records, clear_records
from utils.security import verify_access_token, decrypt_vitals
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/history/{user_id}", response_model=HistoryResponse)
def get_history(
    user_id: str,
    limit: int = Query(default=50, ge=1, le=200, description="Max records to return"),
    auth_user_id: str = Depends(verify_access_token)
):
    """Fetch health history for a specific user (requires JWT auth)."""
    # Verify user can only access their own data unless admin
    if auth_user_id != user_id:
        logger.warning(f"⚠️ Unauthorized access attempt by {auth_user_id} to {user_id}")
        raise HTTPException(status_code=403, detail="Forbidden")
    
    raw = get_records(user_id, limit=limit)

    records = []
    for r in raw:
        ts = r.get("timestamp")
        if isinstance(ts, str):
            ts = datetime.fromisoformat(ts)
        
        # Decrypt vitals if encrypted
        if "vitals_encrypted" in r:
            decrypted = decrypt_vitals(r["vitals_encrypted"])
            hr, spo2, steps = decrypted.get("hr", 0), decrypted.get("spo2", 0), decrypted.get("st", 0)
        else:
            hr = r.get("heart_rate", 0)
            spo2 = r.get("spo2", 0)
            steps = r.get("steps", 0)
        
        records.append(HealthRecord(
            id         = r.get("id") or r.get("_id"),
            user_id    = r.get("user_id", user_id),
            heart_rate = hr,
            spo2       = spo2,
            steps      = steps,
            risk_level = r.get("risk_level", "Normal"),
            risk_score = r.get("risk_score", 0.0),
            timestamp  = ts or datetime.utcnow(),
        ))

    logger.info(f"📊 History fetched: {len(records)} records for {user_id}")
    
    return HistoryResponse(
        user_id       = user_id,
        total_records = len(records),
        records       = records,
    )


@router.get("/history")
def get_all_history(limit: int = Query(default=100, ge=1, le=500)):
    """Fetch all records (admin/debug view)."""
    raw = get_all_records(limit=limit)
    records = []
    for r in raw:
        ts = r.get("timestamp")
        if isinstance(ts, str):
            ts = datetime.fromisoformat(ts)

        if "vitals_encrypted" in r:
            decrypted = decrypt_vitals(r["vitals_encrypted"])
            hr, spo2, steps = decrypted.get("hr", 0), decrypted.get("spo2", 0), decrypted.get("st", 0)
        else:
            hr = r.get("heart_rate", 0)
            spo2 = r.get("spo2", 0)
            steps = r.get("steps", 0)

        records.append(HealthRecord(
            id         = r.get("id") or r.get("_id"),
            user_id    = r.get("user_id", "unknown"),
            heart_rate = hr,
            spo2       = spo2,
            steps      = steps,
            risk_level = r.get("risk_level", "Normal"),
            risk_score = r.get("risk_score", 0.0),
            timestamp  = ts or datetime.utcnow(),
        ))

    return {"records": records}


@router.delete("/history/{user_id}")
def delete_history(user_id: str):
    """Clear records for a user (useful during demo resets)."""
    clear_records(user_id=user_id)
    return {"message": f"Records cleared for {user_id}"}
