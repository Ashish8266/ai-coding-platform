from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import engine, Base, SessionLocal
import requests

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

@app.post("/run")
def run_code(req: RunRequest):
    response = requests.post("http://localhost:2000/api/v2/execute", json={
        "language": req.language,
        "version": "3.12.0",
        "files": [{"content": req.code}]
    })
    result = response.json()
    return {
        "output": result.get("run", {}).get("output", ""),
        "stderr": result.get("run", {}).get("stderr", "")
    }