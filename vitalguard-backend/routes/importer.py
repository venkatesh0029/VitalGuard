from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from datetime import datetime
import csv
import io
import logging

from utils.database import save_record
from utils.security import verify_access_token

logger = logging.getLogger(__name__)

router = APIRouter()

# Expected CSV columns (case-insensitive)
REQUIRED_COLUMNS = {"heart_rate", "spo2"}
OPTIONAL_COLUMNS = {"steps", "user_id", "timestamp"}


def _parse_float(value: str, field: str) -> float:
    try:
        return float(value)
    except Exception:
        raise ValueError(f"Invalid {field}: {value}")


def _parse_int(value: str, field: str) -> int:
    try:
        return int(float(value))
    except Exception:
        raise ValueError(f"Invalid {field}: {value}")


@router.post("/import/csv")
async def import_csv(
    file: UploadFile = File(...),
    auth_user_id: str = Depends(verify_access_token)
):
    """
    Import patient vitals from CSV.
    Required columns: heart_rate, spo2
    Optional: steps, user_id, timestamp (ISO format)
    """
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a .csv file")

    try:
        content = await file.read()
        text = content.decode("utf-8", errors="ignore")
        reader = csv.DictReader(io.StringIO(text))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read CSV: {e}")

    if not reader.fieldnames:
        raise HTTPException(status_code=400, detail="CSV file is empty or has no headers")

    columns = {c.strip().lower() for c in reader.fieldnames}
    if not REQUIRED_COLUMNS.issubset(columns):
        raise HTTPException(
            status_code=400,
            detail=f"Missing required columns: {', '.join(sorted(REQUIRED_COLUMNS - columns))}"
        )

    inserted = 0
    errors = []

    for idx, row in enumerate(reader, start=2):  # start=2 to account for header row
        try:
            # Normalize keys
            normalized = {k.strip().lower(): (v.strip() if isinstance(v, str) else v) for k, v in row.items()}

            heart_rate = _parse_float(normalized.get("heart_rate", ""), "heart_rate")
            spo2 = _parse_float(normalized.get("spo2", ""), "spo2")
            steps = _parse_int(normalized.get("steps", "0"), "steps") if normalized.get("steps") else 0
            user_id = normalized.get("user_id") or auth_user_id or "default_user"

            ts_raw = normalized.get("timestamp")
            if ts_raw:
                try:
                    timestamp = datetime.fromisoformat(ts_raw)
                except Exception:
                    raise ValueError(f"Invalid timestamp: {ts_raw}")
            else:
                timestamp = datetime.utcnow()

            record = {
                "user_id": user_id,
                "heart_rate": heart_rate,
                "spo2": spo2,
                "steps": steps,
                "risk_level": "Normal",
                "risk_score": 0.0,
                "timestamp": timestamp,
            }
            save_record(record)
            inserted += 1
        except Exception as e:
            errors.append({"row": idx, "error": str(e)})

    logger.info(f"📥 CSV import by {auth_user_id}: {inserted} rows inserted, {len(errors)} errors")
    return {"inserted": inserted, "errors": errors}
