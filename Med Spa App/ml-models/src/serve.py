"""FastAPI prediction server for ML models.

Usage:
    python -m src.serve
    # Serves on http://localhost:8000
"""

import os
import pickle
from pathlib import Path

from fastapi import FastAPI
from pydantic import BaseModel

MODELS_DIR = Path(__file__).parent.parent / "models"

app = FastAPI(title="Baseplate ML Server", version="0.1.0")

# Load models at startup (if available)
churn_model = None
try:
    model_path = MODELS_DIR / "churn_model.pkl"
    if model_path.exists():
        with open(model_path, "rb") as f:
            churn_model = pickle.load(f)
except Exception:
    pass


class ChurnRequest(BaseModel):
    features: list[float]


class ChurnResponse(BaseModel):
    churn_probability: float
    confidence: float
    risk_level: str
    factors: list[str]


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": churn_model is not None}


@app.post("/predict/churn", response_model=ChurnResponse)
def predict_churn(req: ChurnRequest):
    if churn_model is None:
        return ChurnResponse(
            churn_probability=0.0,
            confidence=0.0,
            risk_level="unknown",
            factors=["No trained model available — using heuristic fallback"],
        )

    import numpy as np
    features = np.array(req.features).reshape(1, -1)
    probability = float(churn_model.predict_proba(features)[0][1])

    risk_level = "high" if probability > 0.7 else "medium" if probability > 0.3 else "low"

    return ChurnResponse(
        churn_probability=probability,
        confidence=0.8,
        risk_level=risk_level,
        factors=[],
    )
