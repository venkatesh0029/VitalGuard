"""
Alert system — sends email or SMS when risk is Warning/Critical.
Email uses smtplib (free). SMS uses Twilio (needs account).
"""

import smtplib
import os
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

logger = logging.getLogger(__name__)

# ── Config from environment variables ─────────────────────────────────────
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")          # your Gmail
SMTP_PASS = os.getenv("SMTP_PASS", "")          # app password
ALERT_FROM = os.getenv("ALERT_FROM", SMTP_USER)

def send_email_alert(to_email: str, user_id: str, risk_level: str,
                     heart_rate: float, spo2: float) -> bool:
    """Send an email alert. Returns True on success."""
    if not SMTP_USER or not SMTP_PASS:
        logger.warning("Email not configured (set SMTP_USER and SMTP_PASS env vars)")
        return False

    subject = f"🚨 HealthGuard Alert — {risk_level} Risk Detected"
    color = "#FF4444" if risk_level == "Critical" else "#FF9900"

    html_body = f"""
    <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;
                border:2px solid {color};border-radius:8px;padding:24px;">
        <h2 style="color:{color}">⚠️ {risk_level} Health Alert</h2>
        <p><strong>User:</strong> {user_id}</p>
        <p><strong>Time:</strong> {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC</p>
        <hr/>
        <table>
            <tr><td>❤️ Heart Rate</td><td><strong>{heart_rate} BPM</strong></td></tr>
            <tr><td>🫁 SpO₂</td><td><strong>{spo2}%</strong></td></tr>
        </table>
        <hr/>
        <p style="color:#666;font-size:12px;">
            This is an automated alert from HealthGuard AI.
            Please seek medical attention if symptoms persist.
        </p>
    </div>
    """

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = ALERT_FROM
        msg["To"] = to_email
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(ALERT_FROM, to_email, msg.as_string())

        logger.info(f"✅ Email alert sent to {to_email} for {risk_level}")
        return True
    except Exception as e:
        logger.error(f"❌ Email alert failed to {to_email}: {e}", exc_info=True)
        return False


def send_sms_alert(to_phone: str, user_id: str, risk_level: str,
                   heart_rate: float, spo2: float) -> bool:
    """
    Send SMS via Twilio. Requires Twilio account and env vars configured.
    """
    from twilio.rest import Client
    
    TWILIO_SID  = os.getenv("TWILIO_SID", "") or os.getenv("TWILIO_ACCOUNT_SID", "")
    TWILIO_AUTH = os.getenv("TWILIO_AUTH", "") or os.getenv("TWILIO_AUTH_TOKEN", "")
    # Allow Messaging Service SID or direct phone number
    TWILIO_FROM = os.getenv("TWILIO_FROM", "") or os.getenv("TWILIO_MESSAGING_SERVICE_SID", "")

    if not TWILIO_SID or not TWILIO_AUTH or not TWILIO_FROM:
        logger.warning("SMS not configured (set TWILIO_* env vars)")
        return False

    body = (f"🚨 HealthGuard {risk_level} Alert!\n"
            f"User: {user_id} | HR: {heart_rate} BPM | SpO2: {spo2}%\n"
            f"Please seek medical attention.")
    try:
        client = Client(TWILIO_SID, TWILIO_AUTH)
        if TWILIO_FROM.startswith("MG"):
            client.messages.create(body=body, messaging_service_sid=TWILIO_FROM, to=to_phone)
        else:
            client.messages.create(body=body, from_=TWILIO_FROM, to=to_phone)
        logger.info(f"✅ SMS sent to {to_phone}")
        return True
    except Exception as e:
        logger.error(f"❌ SMS failed: {e}", exc_info=True)
        return False


def trigger_alert(user_id: str, risk_level: str, heart_rate: float,
                  spo2: float, email: str = None, phone: str = None) -> dict:
    """Main entry point — triggers all configured alerts."""
    results = {"email": False, "sms": False}

    if risk_level in ("Warning", "Critical"):
        logger.info(f"🔔 Triggering alerts for {user_id} - {risk_level}")
        if email:
            results["email"] = send_email_alert(email, user_id, risk_level, heart_rate, spo2)
        if phone:
            results["sms"] = send_sms_alert(phone, user_id, risk_level, heart_rate, spo2)

    return results
