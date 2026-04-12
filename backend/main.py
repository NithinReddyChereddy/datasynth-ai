from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import numpy as np
from analyzer import load_data, DataAnalyzer
from ai_service import AIService
from pydantic import BaseModel
from typing import List, Optional

import json
import os

load_dotenv()

app = FastAPI(title="AI-Powered Data Analytics API")
ai_service = AIService()

# Persistent storage for current dataset context
CONTEXT_FILE = "current_context.json"

def save_context(data: str):
    with open(CONTEXT_FILE, "w") as f:
        json.dump({"data": data}, f)

def load_context():
    if os.path.exists(CONTEXT_FILE):
        try:
            with open(CONTEXT_FILE, "r") as f:
                return json.load(f)
        except:
            return {"data": ""}
    return {"data": ""}

current_context = load_context()

# Configure CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

@app.get("/")
async def root():
    return {"message": "Welcome to the AI-Powered Data Analytics API"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    # 1. Basic File Validation
    if not file.filename.lower().endswith(('.csv', '.xls', '.xlsx')):
        raise HTTPException(
            status_code=400, 
            detail="Unsupported file format. Please upload CSV or Excel file."
        )
    
    try:
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Dataset is empty. Please upload a valid file.")

        df = load_data(content, file.filename)
        
        # 2. Empty Dataset Check
        if df.empty or len(df.columns) == 0:
            raise HTTPException(status_code=400, detail="Dataset is empty. Please upload a valid file.")
            
        # 3. Missing Required Structure Check
        # Check if there are usable columns (numeric, text, or dates)
        usable_cols = df.select_dtypes(include=[np.number, 'object', 'category', 'datetime64']).columns
        if len(usable_cols) == 0:
            raise HTTPException(status_code=400, detail="Dataset structure not supported. No usable data columns found.")
            
        analyzer = DataAnalyzer(df)
        summary = analyzer.get_summary()
        stats = analyzer.get_statistics()
        visuals = analyzer.get_visualizations()
        insights_non_ai = analyzer.get_statistical_insights()
        
        # 4. Generate AI context
        context_str = analyzer.get_ai_context()
        current_context["data"] = context_str
        save_context(context_str)
        
        # Merge insights: prioritize statistical for immediate feedback
        # AI insights will be fetched asynchronously by the frontend
        
        return {
            "filename": file.filename,
            "summary": summary,
            "statistics": stats,
            "visualizations": visuals,
            "preview": analyzer.get_preview(),
            "statistical_insights": insights_non_ai,
            "ai_insights_ready": ai_service.enabled
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error processing file: {str(e)}\n{error_trace}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.get("/analyze/ai-insights")
async def get_ai_insights():
    if not current_context["data"]:
        raise HTTPException(status_code=400, detail="No data context found. Please upload a file first.")
    
    if not ai_service.enabled:
        return {"insights": []}
        
    try:
        raw_ai_insights = await ai_service.get_initial_insights(current_context["data"])
        if raw_ai_insights:
            points = [p.strip('- ').strip() for p in raw_ai_insights.split('\n') if p.strip()]
            return {"insights": points[:4]}
        return {"insights": []}
    except Exception as e:
        print(f"AI Insights error: {str(e)}")
        return {"insights": ["AI engine is currently processing a high volume of requests. Using statistical fallbacks."]}

@app.post("/clear-context")
async def clear_context():
    current_context["data"] = ""
    if os.path.exists(CONTEXT_FILE):
        os.remove(CONTEXT_FILE)
    return {"message": "Context cleared"}

@app.post("/chat")
async def chat(request: ChatRequest):
    if not current_context["data"]:
        return {"response": "Please upload a data file first before asking questions."}
    
    response = await ai_service.chat_with_data(current_context["data"], request.message)
    return {"response": response}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
