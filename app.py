import os
import json
import io
from typing import List, Dict, Any, Optional
import httpx
import pypdf
from pydantic import BaseModel
from fastapi import FastAPI, Request, Form, UploadFile, File, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

# Initialize FastAPI app
app = FastAPI(title="Rank&File Python Application Controller")

# Mount static files and templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

DB_FILE = "app_data.json"

def load_data():
    if os.path.exists(DB_FILE):
        try:
            with open(DB_FILE, "r") as f:
                return json.load(f)
        except Exception:
            pass
    # Fallback default initial data
    return {
        "jobs": [
            {
                "id": "job_01",
                "title": "AI & Data Scientist",
                "department": "Data Science",
                "experienceRequired": "4+ Years",
                "requiredSkills": ["Python", "Pandas", "NumPy", "Scikit-Learn", "PyTorch", "NLP", "SQL"],
                "description": "We are looking for an AI & Data Scientist to design, train, and deploy predictive ML models."
            }
        ],
        "candidates": []
    }

def save_data(data):
    with open(DB_FILE, "w") as f:
        json.dump(data, f, indent=2)

# --- 1. RENDER MAIN PAGE ---
@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    data = load_data()
    return templates.TemplateResponse(
        request=request, 
        name="index.html", 
        context={"jobs": data["jobs"], "candidates": data["candidates"]}
    )

# --- 2. PARSE PDF FILE ---
@app.post("/parse-pdf")
async def parse_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files supported.")
    
    contents = await file.read()
    reader = pypdf.PdfReader(io.BytesIO(contents))
    extracted_text = ""
    for page in reader.pages:
        extracted_text += page.extract_text() or ""
    
    return {"text": extracted_text}

# --- 3. ADD NEW JOB ---
@app.post("/add-job")
async def add_job(
    title: str = Form(...),
    department: str = Form("Engineering"),
    experience: str = Form("3+ Years"),
    skills: str = Form(""),
    description: str = Form(...)
):
    data = load_data()
    skill_list = [s.strip() for s in skills.split(",") if s.strip()]
    
    new_job = {
        "id": f"job_{len(data['jobs']) + 1}",
        "title": title,
        "department": department,
        "experienceRequired": experience,
        "requiredSkills": skill_list,
        "description": description
    }
    
    data["jobs"].insert(0, new_job)
    save_data(data)
    return RedirectResponse(url="/", status_code=303)

# --- 4. ADD NEW APPLICANT ---
@app.post("/add-applicant")
async def add_applicant(
    name: str = Form(...),
    email: str = Form(""),
    resume_text: str = Form(...)
):
    data = load_data()
    new_candidate = {
        "id": f"cand_{len(data['candidates']) + 1}",
        "name": name,
        "email": email,
        "resumeText": resume_text
    }
    
    data["candidates"].insert(0, new_candidate)
    save_data(data)
    return RedirectResponse(url="/", status_code=303)

# --- 5. GROQ AI CHATBOT ROUTE (JSON PAYLOAD SUPPORT) ---
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatPayload(BaseModel):
    message: str
    history: Optional[List[Dict[str, Any]]] = []

@app.post("/api/chat")
async def chat_with_groq(payload: ChatPayload):
    groq_api_key = "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"

    if not groq_api_key:
        return {
            "reply": "⚠️ Groq API key is missing. Set your GROQ_API_KEY environment variable or paste it in app.py to enable live responses."
        }

    # Construct system prompt and conversational memory
    messages = [
        {
            "role": "system",
            "content": (
                "You are Rank&File AI Assistant, an expert technical recruitment and ATS optimization consultant. "
                "Provide direct, concise, and helpful answers about skill gaps, resume formatting, ATS scores, and candidate screening."
            )
        }
    ]

    # Append previous chat turns
    if payload.history:
        for item in payload.history[-6:]:
            if "role" in item and "content" in item:
                messages.append({"role": item["role"], "content": item["content"]})

    # Append current user prompt
    messages.append({"role": "user", "content": payload.message})

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            res = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {groq_api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": messages,
                    "temperature": 0.7,
                    "max_tokens": 512
                }
            )

            if res.status_code == 200:
                data = res.json()
                reply_text = data["choices"][0]["message"]["content"]
                return {"reply": reply_text}
            else:
                return {"reply": f"Groq API Error ({res.status_code}): {res.text}"}

    except Exception as e:
        return {"reply": f"Service connection error: {str(e)}"}