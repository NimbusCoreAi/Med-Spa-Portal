# Baseplate ML Models

Python ML training pipeline for churn prediction, LTV estimation, and demand forecasting.

> **Status:** Infrastructure only — no models trained yet. Training requires real customer data (Phase 5+).

## Setup

```bash
cd ml-models
pip install -r requirements.txt
```

## Structure

```
ml-models/
  src/
    features.py        # Feature extraction from Supabase data
    train.py           # Train churn + LTV models
    serve.py           # FastAPI prediction server
    evaluate.py        # Model evaluation (accuracy, precision, recall, F1)
  notebooks/
    churn_prediction.ipynb  # Walkthrough notebook
  models/              # Saved .pkl models (gitignored)
  requirements.txt
```

## Training (Phase 5+)

Training requires real customer data. Once Phase 5 onboards pilot clinics:

```bash
# Export data from Supabase, then train
python -m src.train --model churn --data data/customers.csv

# Evaluate
python -m src.evaluate --model churn --test-data data/test.csv
```

## Serving

```bash
python -m src.serve
# FastAPI server on http://localhost:8000
# POST /predict/churn → { churn_probability, confidence, factors }
# GET /health → { status: "ok", model_loaded: bool }
```

## Feature Extraction

Features map to the TypeScript feature extractors in `packages/intelligence`:

| Python Function | TS Equivalent | Features |
|----------------|---------------|----------|
| `extract_appointment_features()` | `appointmentFeatures` | total, completed, cancelled, no-shows, completion rate, cancel rate, no-show rate |
| `extract_payment_features()` | `paymentFeatures` | total, completed, failed, total revenue, avg payment |
| `extract_engagement_features()` | `engagementFeatures` | login count, days since login, total audit events |

## Connect API Integration

The Connect API endpoint `POST /api/v1/intelligence/churn-prediction` calls the Python ML server when a trained model is available. If no model exists, it falls back to the heuristic rules-engine (ChurnPredictor).
