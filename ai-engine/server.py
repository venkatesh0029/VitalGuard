import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware
from predictor import GroqHealthPredictor

app = FastAPI(title="VitalGuard AI Engine", version="1.0.0")

# Allow requests from frontend/backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Predictor
try:
    ai_predictor = GroqHealthPredictor()
except Exception as e:
    print(f"Warning: Failed to initialize AI Predictor: {e}")
    ai_predictor = None

class VitalsInput(BaseModel):
    heart_rate: float = Field(..., description="Heart rate in BPM")
    spo2: float = Field(..., description="Blood Oxygen percentage")
    steps: int = Field(default=0, description="Steps taken")
    stress_level: int = Field(default=0, description="Stress level out of 10")
    source: str = Field(default="api", description="Source of the data")

@app.get("/")
def health_check():
    return {"status": "online", "model": "Groq LLaMA 3.1 8B"}

@app.post("/predict")
def predict_vitals(vitals: VitalsInput):
    if not ai_predictor:
        raise HTTPException(status_code=500, detail="AI engine not initialized correctly.")
    
    # Convert Pydantic model to dict for the predictor
    vitals_dict = vitals.model_dump()
    
    try:
        result = ai_predictor.predict(vitals_dict)
        # Ensure we always return the same schema structure the frontend expects
        return {
            "vitals": vitals_dict,
            "prediction": result,
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    print("🚀 Starting VitalGuard AI Server on http://0.0.0.0:8000")
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
