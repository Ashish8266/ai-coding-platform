from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import engine, Base, SessionLocal
import requests
from ai_service import get_hint, get_review, get_explanation

import models

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Backend is alive"}

@app.get("/questions")
def get_questions(db: Session = Depends(get_db)):
    return db.query(models.Question).all()

class RunRequest(BaseModel):
    code: str
    language: str
    version: str

@app.post("/run")
def run_code(req: RunRequest):
    response = requests.post("http://localhost:2000/api/v2/execute", json={
        "language": req.language,
        "version": req.version,
        "files": [{"content": req.code}]
    })
    result = response.json()
    return {
        "output": result.get("run", {}).get("output", ""),
        "stderr": result.get("run", {}).get("stderr", "")
    }
class HintRequest(BaseModel):
    question_title: str
    question_description: str
    code: str

@app.post("/hint")
def hint(req: HintRequest):
    result = get_hint(req.question_title, req.question_description, req.code)
    return {"hint": result}

class ReviewRequest(BaseModel):
    question_title: str
    code: str

@app.post("/review")
def review(req: ReviewRequest):
    result = get_review(req.question_title, req.code)
    return {"review": result}

class ExplainRequest(BaseModel):
    question_title: str
    code: str
    user_question: str

@app.post("/explain")
def explain(req: ExplainRequest):
    result = get_explanation(req.question_title, req.code, req.user_question)
    return {"explanation": result}