import os
import httpx
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

# The new standalone AI Engine endpoint running on port 8001
AI_ENGINE_URL = os.getenv("AI_ENGINE_URL", "http://127.0.0.1:8001/predict")

async def load_model():
    """Check AI engine availability."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(AI_ENGINE_URL.replace("/predict", "/"), timeout=2.0)
            if response.status_code == 200:
                logger.info(f"✅ Connected to AI Engine at {AI_ENGINE_URL}")
                return "ONLINE"
    except httpx.RequestError as e:
        logger.warning(f"⚠️ AI Engine not reachable at {AI_ENGINE_URL}: {e}")
    return "OFFLINE"

def rule_based_predict(heart_rate: float, spo2: float, steps: int) -> dict:
    """
    Simple rule-based fallback when no trained model is available.
    """
    score = 0.0

    # Heart rate rules
    if heart_rate > 130 or heart_rate < 45:
        score += 0.5
    elif heart_rate > 100 or heart_rate < 55:
        score += 0.25

    # SpO2 rules
    if spo2 < 90:
        score += 0.5
    elif spo2 < 94:
        score += 0.25

    # Steps (inactivity as minor signal)
    if steps < 100:
        score += 0.05

    score = min(score, 1.0)

    if score >= 0.6:
        risk = "Critical"
    elif score >= 0.3:
        risk = "Warning"
    else:
        risk = "Normal"

    return {"risk_level": risk, "risk_score": round(score, 3), "confidence": 0.82}

async def run_prediction(heart_rate: float, spo2: float, steps: int) -> dict:
    """Run prediction by calling the standalone Python AI Engine asynchronously."""
    logger.debug(f"Running prediction: HR={heart_rate}, SpO2={spo2}, Steps={steps}")

    payload = {
        "heart_rate": heart_rate,
        "spo2": spo2,
        "steps": steps,
        "stress_level": 2, # Default as backend doesn't take stress level natively yet
        "source": "backend_api"
    }

    try:
        # Call the standalone AI server asynchronously to prevent blocking the FastAPI event loop
        async with httpx.AsyncClient() as client:
            response = await client.post(AI_ENGINE_URL, json=payload, timeout=5.0)
            response.raise_for_status()
            
            result = response.json()
            
            # Extract the prediction part from the API
            prediction = result.get("prediction", {})
            
            risk_level = prediction.get("risk_level", "Normal")
            confidence = prediction.get("confidence", 0.5)
            
            # Compute a 0-1 danger score for the backend DB based on risk string
            danger_scores = {"Normal": 0.1, "Warning": 0.6, "Critical": 0.9}
            danger_score = danger_scores.get(risk_level, 0.5)

            logger.info(f"✅ AI Engine Prediction: {risk_level} (confidence: {confidence}) - Reason: {prediction.get('reasoning', '')}")
            
            return {
                "risk_level": risk_level,
                "risk_score": danger_score,
                "confidence": confidence
            }
            
    except httpx.RequestError as e:
        logger.error(f"❌ AI Engine prediction error: {e} — falling back to rules")
        return rule_based_predict(heart_rate, spo2, steps)
    except httpx.HTTPStatusError as e:
        logger.error(f"❌ AI Engine returned error status {e.response.status_code} — falling back to rules")
        return rule_based_predict(heart_rate, spo2, steps)
