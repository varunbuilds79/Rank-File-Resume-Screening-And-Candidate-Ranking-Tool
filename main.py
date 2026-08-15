import re
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import spacy
from sentence_transformers import SentenceTransformer, util

app = FastAPI(
    title="Rank&File Python AI Engine",
    description="Neural sentence embeddings and spaCy NER microservice for resume screening."
)

# Enable CORS for frontend & Express proxy access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Neural Models into memory at startup
print("Loading Neural SentenceTransformer model ('all-MiniLM-L6-v2')...")
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

print("Loading spaCy NLP model ('en_core_web_sm')...")
try:
    nlp = spacy.load("en_core_web_sm")
except Exception:
    import spacy.cli
    spacy.cli.download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

print("🚀 Python AI Microservice Ready on http://127.0.0.1:8000")

class AnalysisRequest(BaseModel):
    resume_text: str
    job_description: str

@app.get("/health")
async def health_check():
    return {
        "status": "online",
        "engine": "FastAPI + SentenceTransformers (all-MiniLM-L6-v2) + spaCy"
    }

@app.post("/api/py-analyze")
async def analyze_gap(data: AnalysisRequest):
    if not data.resume_text or not data.job_description:
        raise HTTPException(
            status_code=400, 
            detail="Both resume_text and job_description are required."
        )

    try:
        # 1. Calculate Vector Cosine Similarity
        emb_resume = embedding_model.encode(
            data.resume_text, 
            convert_to_tensor=True, 
            show_progress_bar=False
        )
        emb_jd = embedding_model.encode(
            data.job_description, 
            convert_to_tensor=True, 
            show_progress_bar=False
        )
        cosine_sim = util.cos_sim(emb_resume, emb_jd).item()
        
        # Scale score between 0 and 100
        semantic_score = round(max(0, min(100, cosine_sim * 100)))

        # 2. Extract Named Entities using spaCy
        doc = nlp(data.resume_text)
        organizations = list(set([ent.text for ent in doc.ents if ent.label_ == "ORG"]))
        dates_and_exp = list(set([ent.text for ent in doc.ents if ent.label_ in ["DATE", "TIME"]]))

        # 3. Regex Pattern Matching for Contact & Impact Metrics
        emails = re.findall(
            r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', 
            data.resume_text
        )
        metrics = re.findall(
            r'\b\d+%\b|\$\d+|\b\d+\+\s*users\b|\b\d{2,}\b', 
            data.resume_text, 
            re.IGNORECASE
        )
        impact_score = min(100, len(metrics) * 20)

        return {
            "semanticScore": semantic_score,
            "impactScore": impact_score,
            "extractedEntities": {
                "organizations": organizations[:5],
                "dates": dates_and_exp[:4],
                "emails": emails[:1]
            },
            "pythonPowered": True
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Python NLP execution error: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)