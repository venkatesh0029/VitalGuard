from fastapi import APIRouter, Depends
import os
from utils.alerts import send_email_alert, send_sms_alert
from utils.security import verify_access_token

router = APIRouter()

@router.post("/test/email")
def test_email(auth_user_id: str = Depends(verify_access_token)):
    """
    Send a test email using configured SMTP settings.
    Uses ALERT_TEST_EMAIL or SMTP_USER as destination.
    """
    to_email = os.getenv("ALERT_TEST_EMAIL") or os.getenv("SMTP_USER", "")
    if not to_email:
        return {"ok": False, "detail": "Set ALERT_TEST_EMAIL or SMTP_USER in .env"}
    ok = send_email_alert(
        to_email=to_email,
        user_id=auth_user_id,
        risk_level="Critical",
        heart_rate=145,
        spo2=88
    )
    return {"ok": ok, "to": to_email}


@router.post("/test/sms")
def test_sms(auth_user_id: str = Depends(verify_access_token)):
    """
    Send a test SMS using configured Twilio settings.
    Uses ALERT_PHONE_NUMBER from .env.
    """
    to_phone = os.getenv("ALERT_PHONE_NUMBER", "")
    if not to_phone:
        return {"ok": False, "detail": "Set ALERT_PHONE_NUMBER in .env"}
    ok = send_sms_alert(
        to_phone=to_phone,
        user_id=auth_user_id,
        risk_level="Critical",
        heart_rate=145,
        spo2=88
    )
    return {"ok": ok, "to": to_phone}
