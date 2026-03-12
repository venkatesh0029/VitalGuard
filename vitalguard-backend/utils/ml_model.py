import pickle
import os
import numpy as np
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

MODEL_PATH = os.getenv("MODEL_PATH", "models/health_model.pkl")

_model = None  # cached model instance

def load_model():
    """Load the .pkl model once and cache it."""
    global _model
    if _model is None:
        if os.path.exists(MODEL_PATH):
            try:
                with open(MODEL_PATH, "rb") as f:
                    _model = pickle.load(f)
                logger.info(f"✅ ML model loaded successfully from {MODEL_PATH}")
            except Exception as e:
                logger.error(f"❌ Failed to load model: {e}")
                _model = "FALLBACK"
        else:
            logger.warning(f"⚠️  Model file not found at {MODEL_PATH} — using rule-based fallback")
            _model = "FALLBACK"
    return _model

def rule_based_predict(heart_rate: float, spo2: float, steps: int) -> dict:
    """
    Simple rule-based fallback when no trained model is available.
    Replace this with your trained model logic.
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

def run_prediction(heart_rate: float, spo2: float, steps: int) -> dict:
    """Run prediction using ML model or fallback."""
    model = load_model()
    logger.debug(f"Running prediction: HR={heart_rate}, SpO2={spo2}, Steps={steps}")

    if model == "FALLBACK":
        logger.info("Using rule-based prediction (ML model not available)")
        return rule_based_predict(heart_rate, spo2, steps)

    try:
        features = np.array([[heart_rate, spo2, steps]])
        prediction = model.predict(features)[0]
        proba = model.predict_proba(features)[0]

        # Map numeric label to string (adjust based on how your model was trained)
        label_map = {0: "Normal", 1: "Warning", 2: "Critical"}
        risk_level = label_map.get(int(prediction), str(prediction))

        risk_score = float(max(proba))
        confidence = round(risk_score, 3)

        # Compute a 0-1 danger score (probability of Warning + Critical)
        danger_score = round(1 - proba[0], 3) if len(proba) > 1 else risk_score

        logger.info(f"✅ Prediction: {risk_level} (confidence: {confidence})")
        
        return {
            "risk_level": risk_level,
            "risk_score": danger_score,
            "confidence": confidence
        }
    except Exception as e:
        logger.error(f"❌ Model prediction error: {e} — falling back to rules", exc_info=True)
        return rule_based_predict(heart_rate, spo2, steps)
