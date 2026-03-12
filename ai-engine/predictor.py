import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

class GroqHealthPredictor:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self.api_key:
            raise Exception("❌ GROQ_API_KEY not found in .env!")
        
        self.client = Groq(api_key=self.api_key)
        self.model = "llama-3.1-8b-instant"
    
    def predict(self, vitals):
        prompt = self._create_prompt(vitals)
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": self._get_system_prompt()},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=200
            )
            
            result_text = response.choices[0].message.content.strip()
            return self._parse_response(result_text)
            
        except Exception as e:
            print(f"⚠️ Groq API Error: {e}")
            return self._fallback_prediction(vitals)
    
    def _get_system_prompt(self):
        return """You are a medical health assessment AI. Analyze vital signs and assess health risk.

RULES:
1. Return ONLY valid JSON with these exact fields:
   - risk_level: "Normal" OR "Warning" OR "Critical"
   - risk_code: 0 for Normal, 1 for Warning, 2 for Critical  
   - confidence: number between 0.0 to 1.0
   - reasoning: brief explanation (max 20 words)

2. Assessment Criteria:
   - Normal: HR 60-100, SpO2 95-100, Stress 1-4
   - Warning: HR 100-130 OR SpO2 90-94 OR Stress 5-7
   - Critical: HR >130 OR SpO2 <90 OR Stress 8-10

3. Be conservative - if in doubt, warn the user.

Example output:
{"risk_level": "Normal", "risk_code": 0, "confidence": 0.95, "reasoning": "All vitals within healthy range"}"""
    
    def _create_prompt(self, vitals):
        return f"""Analyze these vital signs from a smartwatch:

Heart Rate: {vitals.get('heart_rate', 'N/A')} BPM
SpO2 (Blood Oxygen): {vitals.get('spo2', 'N/A')}%
Steps (last minute): {vitals.get('steps', 'N/A')}
Stress Level: {vitals.get('stress_level', 'N/A')}/10

Source: {"Real watch data" if vitals.get('source') == 'watch' else "Simulated"}

Provide health risk assessment in JSON format only."""
    
    def _parse_response(self, response_text):
        try:
            start = response_text.find('{')
            end = response_text.rfind('}') + 1
            json_str = response_text[start:end]
            data = json.loads(json_str)
            
            return {
                'risk_level': data.get('risk_level', 'Normal'),
                'risk_code': data.get('risk_code', 0),
                'confidence': data.get('confidence', 0.8),
                'reasoning': data.get('reasoning', 'Analysis complete')
            }
        except:
            return self._fallback_prediction({})
    
    def _fallback_prediction(self, vitals):
        hr = vitals.get('heart_rate', 75)
        spo2 = vitals.get('spo2', 98)
        stress = vitals.get('stress_level', 0)
        
        if isinstance(hr, str) or isinstance(spo2, str):
            return {'risk_level': 'Normal', 'risk_code': 0, 'confidence': 0.5, 'reasoning': 'Waiting for real data...'}
        
        if hr > 130 or spo2 < 90 or stress >= 8:
            return {'risk_level': 'Critical', 'risk_code': 2, 'confidence': 0.9, 'reasoning': 'Critical vitals detected'}
        elif hr > 100 or spo2 < 95 or stress >= 5:
            return {'risk_level': 'Warning', 'risk_code': 1, 'confidence': 0.85, 'reasoning': 'Elevated vitals detected'}
        else:
            return {'risk_level': 'Normal', 'risk_code': 0, 'confidence': 0.95, 'reasoning': 'All vitals normal'}