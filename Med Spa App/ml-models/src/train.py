"""Train ML models for churn and LTV prediction.

Usage:
    python -m src.train --model churn --data data/customers.csv

Note: No real customer data exists during build phases (Phase 1-4).
Training deferred to Phase 5+ when pilot clinics generate real data.
"""

import argparse
import pickle
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score

from src.features import build_feature_matrix

MODELS_DIR = Path(__file__).parent.parent / "models"


def train_churn_model(data_path: str) -> dict:
    """Train a RandomForest churn classifier.

    Expected CSV columns: appointment history, payment history, engagement, and 'churned' label.
    """
    data = pd.read_csv(data_path)

    # Prepare features and labels
    feature_cols = [c for c in data.columns if c != "churned"]
    X = data[feature_cols].values
    y = data["churned"].values

    model = RandomForestClassifier(n_estimators=100, random_state=42)

    # Cross-validate
    scores = cross_val_score(model, X, y, cv=5, scoring="f1")

    # Train on full data
    model.fit(X, y)

    # Save
    MODELS_DIR.mkdir(exist_ok=True)
    model_path = MODELS_DIR / "churn_model.pkl"
    with open(model_path, "wb") as f:
        pickle.dump(model, f)

    return {
        "model_type": "churn",
        "cv_f1_mean": float(scores.mean()),
        "cv_f1_std": float(scores.std()),
        "sample_size": len(data),
        "saved_to": str(model_path),
    }


def train_ltv_model(data_path: str) -> dict:
    """Train an LTV regression model.

    Expected CSV columns: features and 'ltv' label.
    """
    from sklearn.ensemble import RandomForestRegressor

    data = pd.read_csv(data_path)
    feature_cols = [c for c in data.columns if c != "ltv"]
    X = data[feature_cols].values
    y = data["ltv"].values

    model = RandomForestRegressor(n_estimators=100, random_state=42)
    scores = cross_val_score(model, X, y, cv=5, scoring="r2")
    model.fit(X, y)

    model_path = MODELS_DIR / "ltv_model.pkl"
    with open(model_path, "wb") as f:
        pickle.dump(model, f)

    return {
        "model_type": "ltv",
        "cv_r2_mean": float(scores.mean()),
        "cv_r2_std": float(scores.std()),
        "sample_size": len(data),
        "saved_to": str(model_path),
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train Baseplate ML models")
    parser.add_argument("--model", choices=["churn", "ltv"], required=True)
    parser.add_argument("--data", required=True, help="Path to training data CSV")
    args = parser.parse_args()

    if args.model == "churn":
        result = train_churn_model(args.data)
    else:
        result = train_ltv_model(args.data)

    print(f"Training complete: {result}")
