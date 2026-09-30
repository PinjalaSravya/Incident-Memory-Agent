import os
import json
from typing import List, Optional
import numpy as np
import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="IncidentIQ ML Anomaly Detection Service",
    description="IsolationForest anomaly detection API trained on Server Machine Dataset (SMD)",
    version="1.1.0"
)

# Enable CORS for Next.js app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
EVALUATION_FILE = os.path.join(os.path.dirname(__file__), "evaluation_results.json")

# In-memory cache for loaded models, scalers, & metadata
loaded_models = {}
loaded_scalers = {}
loaded_metadata = {}

def get_model_scaler_and_meta(machine_id: str):
    # Normalize machine_id
    if not machine_id.startswith("machine-"):
        machine_id = "machine-1-1"
    
    if machine_id not in loaded_models:
        model_path = os.path.join(MODELS_DIR, machine_id, "model.joblib")
        scaler_path = os.path.join(MODELS_DIR, machine_id, "scaler.joblib")
        metadata_path = os.path.join(MODELS_DIR, machine_id, "metadata.json")

        if not os.path.exists(model_path) or not os.path.exists(scaler_path):
            # Fallback to machine-1-1 if target machine model doesn't exist
            machine_id = "machine-1-1"
            model_path = os.path.join(MODELS_DIR, machine_id, "model.joblib")
            scaler_path = os.path.join(MODELS_DIR, machine_id, "scaler.joblib")
            metadata_path = os.path.join(MODELS_DIR, machine_id, "metadata.json")

        if not os.path.exists(model_path):
            raise HTTPException(status_code=404, detail=f"Model for machine '{machine_id}' not found.")

        loaded_models[machine_id] = joblib.load(model_path)
        loaded_scalers[machine_id] = joblib.load(scaler_path)
        
        meta = {}
        if os.path.exists(metadata_path):
            with open(metadata_path, "r") as f:
                meta = json.load(f)
        loaded_metadata[machine_id] = meta

    return machine_id, loaded_models[machine_id], loaded_scalers[machine_id], loaded_metadata[machine_id]

class PredictRequest(BaseModel):
    machine_id: Optional[str] = "machine-1-1"
    metrics: List[float] = Field(..., description="Array of 38 numeric metric values from SMD dataset")

class PredictResponse(BaseModel):
    machine_id: str
    is_anomaly: bool
    prediction: str
    raw_score: float
    decision_score: float
    anomaly_score: float
    model: str
    feature_count: int

@app.get("/health")
def health_check():
    available_machines = []
    if os.path.exists(MODELS_DIR):
        available_machines = [d for d in os.listdir(MODELS_DIR) if os.path.isdir(os.path.join(MODELS_DIR, d))]
    
    return {
        "status": "online",
        "service": "IncidentIQ-ML-Inference",
        "algorithm": "IsolationForest",
        "trained_machines_count": len(available_machines),
        "available_machines": available_machines
    }

@app.get("/evaluation")
def get_evaluation():
    if not os.path.exists(EVALUATION_FILE):
        raise HTTPException(status_code=404, detail="Evaluation results not found. Run evaluate.py first.")
    with open(EVALUATION_FILE, "r") as f:
        return json.load(f)

@app.post("/predict", response_model=PredictResponse)
def predict_anomaly(req: PredictRequest):
    if len(req.metrics) != 38:
        if len(req.metrics) < 38:
            metrics = req.metrics + [0.0] * (38 - len(req.metrics))
        else:
            metrics = req.metrics[:38]
    else:
        metrics = req.metrics

    machine_id, model, scaler, metadata = get_model_scaler_and_meta(req.machine_id or "machine-1-1")
    
    X = np.array(metrics).reshape(1, -1)
    X_scaled = scaler.transform(X)

    # 1. Prediction: -1 for anomaly, 1 for normal
    raw_pred = model.predict(X_scaled)[0]
    is_anomaly = bool(raw_pred == -1)

    # 2. Raw score from score_samples() (opposite of anomaly score in scikit-learn)
    raw_score = float(model.score_samples(X_scaled)[0])

    # 3. Decision score from decision_function() (< 0 is anomaly, >= 0 is normal)
    decision_score = float(model.decision_function(X_scaled)[0])

    # 4. Compute Anomaly Score relative to TRAINING score distribution
    # anomaly_score = 1 - training_percentile (clamped to [0.0, 1.0])
    train_percentiles = metadata.get("train_score_percentiles", [])
    if train_percentiles and len(train_percentiles) > 1:
        # Interpolate percentile rank (0 to 100) of raw_score within train score distribution
        percentile_rank = float(np.interp(raw_score, train_percentiles, np.linspace(0, 100, len(train_percentiles))))
        training_percentile = percentile_rank / 100.0
    else:
        # Fallback if percentiles unavailable
        training_percentile = 0.5 if is_anomaly else 0.8

    anomaly_score = float(np.clip(1.0 - training_percentile, 0.0, 1.0))

    return PredictResponse(
        machine_id=machine_id,
        is_anomaly=is_anomaly,
        prediction="ANOMALY" if is_anomaly else "NORMAL",
        raw_score=round(raw_score, 4),
        decision_score=round(decision_score, 4),
        anomaly_score=round(anomaly_score, 4),
        model="IsolationForest (SMD)",
        feature_count=38
    )

@app.post("/predict/{machine_id}", response_model=PredictResponse)
def predict_anomaly_by_path(machine_id: str, req: PredictRequest):
    req.machine_id = machine_id
    return predict_anomaly(req)
