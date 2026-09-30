import os
import glob
import json
import time
import joblib
import numpy as np
from datetime import datetime
from sklearn.ensemble import IsolationForest

from data_pipeline import load_machine_raw_data, build_and_fit_scaler, MODELS_DIR, TRAIN_DIR

def train_isolation_forest_models():
    print("=" * 70)
    print("STARTING ISOLATION FOREST MODEL TRAINING FOR SMD MACHINES")
    print("=" * 70)

    train_files = sorted(glob.glob(os.path.join(TRAIN_DIR, "*.txt")))
    trained_count = 0
    start_time = time.time()

    for train_path in train_files:
        machine_name = os.path.basename(train_path).replace(".txt", "")
        print(f"Training machine model: {machine_name}...", end="", flush=True)

        # 1. Load train data
        train_data, _, _ = load_machine_raw_data(machine_name)
        num_samples, num_features = train_data.shape

        # 2. Fit Scaler on TRAIN data only
        scaler = build_and_fit_scaler(train_data, machine_name)
        train_scaled = scaler.transform(train_data)

        # 3. Instantiate & Train Isolation Forest on TRAIN data only
        model_params = {
          "n_estimators": 100,
          "contamination": 0.05,
          "random_state": 42,
          "n_jobs": -1
        }
        
        model = IsolationForest(**model_params)
        model.fit(train_scaled)

        # 4. Calculate score_samples and decision_function on TRAIN data
        train_raw_scores = model.score_samples(train_scaled)
        train_decision_scores = model.decision_function(train_scaled)

        # Store 101 percentile checkpoints (0th to 100th percentile) for distribution lookup
        percentiles_grid = np.linspace(0, 100, 101)
        score_percentiles = np.percentile(train_raw_scores, percentiles_grid).tolist()

        # 5. Save model to disk
        machine_dir = os.path.join(MODELS_DIR, machine_name)
        model_path = os.path.join(machine_dir, "model.joblib")
        joblib.dump(model, model_path)

        # 6. Save model metadata including training score distribution stats
        metadata = {
          "machine_name": machine_name,
          "num_features": num_features,
          "training_samples": num_samples,
          "model_params": model_params,
          "model_type": "IsolationForest",
          "scaler_type": "StandardScaler",
          "training_timestamp": datetime.utcnow().isoformat() + "Z",
          "dataset_path": train_path,
          "train_score_stats": {
            "min_score": round(float(np.min(train_raw_scores)), 6),
            "max_score": round(float(np.max(train_raw_scores)), 6),
            "mean_score": round(float(np.mean(train_raw_scores)), 6),
            "std_score": round(float(np.std(train_raw_scores)), 6),
            "min_decision": round(float(np.min(train_decision_scores)), 6),
            "max_decision": round(float(np.max(train_decision_scores)), 6),
          },
          "train_score_percentiles": [round(float(p), 6) for p in score_percentiles]
        }
        
        metadata_path = os.path.join(machine_dir, "metadata.json")
        with open(metadata_path, "w") as f:
            json.dump(metadata, f, indent=2)

        trained_count += 1
        print(" DONE!")

    total_time = time.time() - start_time
    print("=" * 70)
    print(f"TRAINING COMPLETE!")
    print(f"Successfully trained and saved {trained_count} machine models in {total_time:.2f} seconds.")
    print(f"Models directory: {MODELS_DIR}")
    print("=" * 70)

if __name__ == "__main__":
    train_isolation_forest_models()
