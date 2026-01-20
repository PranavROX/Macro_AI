import os
import json
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai

# 1. Load Keys
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

genai.configure(api_key=api_key)

# 2. AUTO-DETECT WORKING MODEL (Based on your logs)
print("🔍 Searching for available models...")
chosen_model_name = "models/gemini-flash-latest" # Safe fallback
try:
    available = []
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            available.append(m.name)
   
    # PRIORITY LIST (Based on your specific account access)
    priorities = [
        "models/gemini-flash-latest",                 # 1. The generic "Stable" alias
        "models/gemini-2.0-flash-lite-preview-02-05", # 2. The "Lite" model (Usually has free quota)
        "models/gemini-2.0-flash-exp",                # 3. Experimental Flash
        "models/gemini-pro-latest"                    # 4. Stable Pro alias
    ]
   
    for p in priorities:
        if p in available:
            chosen_model_name = p
            break
           
    print(f"🚀 SELECTED MODEL: {chosen_model_name}")

except Exception as e:
    print(f"⚠️ Error listing models: {e}")

# 3. Setup Model
generation_config = {"temperature": 0.7}
# Force JSON for all these models
generation_config["response_mime_type"] = "application/json"

model = genai.GenerativeModel(
  model_name=chosen_model_name,
  generation_config=generation_config,
  system_instruction="""
  You are an expert nutritionist. Analyze the food provided.
  Output JSON with exactly these fields:
  - item_name (string)
  - calories (integer)
  - protein (float)
  - carbs (float)
  - fat (float)
  - health_tip (string)
  """
)

# 4. FastAPI Setup
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserRequest(BaseModel):
    query: str

@app.post("/analyze")
async def analyze_food(request: UserRequest):
    try:
        response = model.generate_content(request.query)
       
        # Clean up response
        text = response.text.replace("```json", "").replace("```", "").strip()
        return json.loads(text)

    except Exception as e:
        print(f"❌ Error during generation: {e}")
        if "429" in str(e):
             raise HTTPException(status_code=429, detail="Traffic is high. Please wait 10s and try again.")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def home():
    return {"status": "MacroAI is running", "model": chosen_model_name}
