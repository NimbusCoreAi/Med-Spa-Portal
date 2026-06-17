"""Model evaluation script.

Usage:
    python -m src.evaluate --model churn --test-data data/test.csv
"""

import argparse
import pickle
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.metrics import accuracy_score, confusion_matrix, f1_score, precision_score, recall_score

MODELS_DIR = Path(__file__).parent.parent / "models"


def evaluate_model(model_path: str, test_data_path: str) -> dict:
    """Evaluate a trained model on test data."""
    with open(model_path, "rb") as f:
        model = pickle.load(f)

    data = pd.read_csv(test_data_path)
    label_col = "churned" if "churned" in data.columns else "ltv"
    feature_cols = [c for c in data.columns if c != label_col]

    X = data[feature_cols].values
    y_true = data[label_col].values
    y_pred = model.predict(X)

    if label_col == "churned":
        metrics = {
            "accuracy": float(accuracy_score(y_true, y_pred)),
            "precision": float(precision_score(y_true, y_pred, average="binary")),
            "recall": float(recall_score(y_true, y_pred, average="binary")),
            "f1": float(f1_score(y_true, y_pred, average="binary")),
            "confusion_matrix": confusion_matrix(y_true, y_pred).tolist(),
        }
    else:
        from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
        metrics = {
            "r2": float(r2_score(y_true, y_pred)),
            "mae": float(mean_absolute_error(y_true, y_pred)),
            "rmse": float(np.sqrt(mean_squared_error(y_true, y_pred))),
        }

    metrics["sample_size"] = len(data)
    return metrics


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Evaluate Baseplate ML models")
    parser.add_argument("--model", choices=["churn", "ltv"], required=True)
    parser.add_argument("--test-data", required=True, help="Path to test data CSV")
    args = parser.parse_args()

    model_path = str(MODELS_DIR / f"{args.model}_model.pkl")
    metrics = evaluate_model(model_path, args.test_data)
    print(f"Evaluation results ({args.model}):")
    for k, v in metrics.items():
        print(f"  {k}: {v}")
