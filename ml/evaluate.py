import os
import json
import numpy as np
import pandas as pd
import joblib

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "ServerMachineDataset")
TEST_DIR = os.path.join(DATA_DIR, "test")
LABEL_DIR = os.path.join(DATA_DIR, "test_label")
MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
OUTPUT_PATH_ML = os.path.join(os.path.dirname(__file__), "evaluation_results.json")
OUTPUT_PATH_PUBLIC = os.path.join(os.path.dirname(__file__), "..", "public", "evaluation_results.json")

def load_data(filepath):
    """Load comma-delimited numeric CSV/TXT without headers."""
    return pd.read_csv(filepath, header=None).values

def evaluate_all_machines():
    if not os.path.exists(MODELS_DIR):
        raise RuntimeError("Models directory not found. Please run train.py first.")

    machine_dirs = [d for d in os.listdir(MODELS_DIR) if os.path.isdir(os.path.join(MODELS_DIR, d))]
    machine_dirs.sort()

    total_tp = 0
    total_fp = 0
    total_tn = 0
    total_fn = 0
    machine_results = {}

    print(f"Evaluating models across {len(machine_dirs)} machine entities...")

    for machine in machine_dirs:
        model_path = os.path.join(MODELS_DIR, machine, "model.joblib")
        scaler_path = os.path.join(MODELS_DIR, machine, "scaler.joblib")
        test_file = os.path.join(TEST_DIR, f"{machine}.txt")
        label_file = os.path.join(LABEL_DIR, f"{machine}.txt")

        if not (os.path.exists(model_path) and os.path.exists(scaler_path)):
            print(f"Skipping {machine}: model or scaler missing")
            continue

        if not (os.path.exists(test_file) and os.path.exists(label_file)):
            print(f"Skipping {machine}: test data or labels missing")
            continue

        model = joblib.load(model_path)
        scaler = joblib.load(scaler_path)

        X_test = load_data(test_file)
        y_test = load_data(label_file).ravel().astype(int)

        X_scaled = scaler.transform(X_test)

        # IsolationForest predict: -1 for anomaly, 1 for normal
        preds_raw = model.predict(X_scaled)
        y_pred = np.where(preds_raw == -1, 1, 0)

        # Scores: lower score_samples means more anomalous
        scores_raw = model.score_samples(X_scaled)
        # Convert to anomaly score between 0 and 1
        anomaly_scores = -scores_raw

        tp = int(np.sum((y_pred == 1) & (y_test == 1)))
        fp = int(np.sum((y_pred == 1) & (y_test == 0)))
        tn = int(np.sum((y_pred == 0) & (y_test == 0)))
        fn = int(np.sum((y_pred == 0) & (y_test == 1)))

        total_tp += tp
        total_fp += fp
        total_tn += tn
        total_fn += fn

        precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0.0
        accuracy = (tp + tn) / (tp + tn + fp + fn) if len(y_test) > 0 else 0.0

        machine_results[machine] = {
            "num_test_samples": int(len(y_test)),
            "actual_anomalies": int(np.sum(y_test == 1)),
            "predicted_anomalies": int(np.sum(y_pred == 1)),
            "tp": tp,
            "fp": fp,
            "tn": tn,
            "fn": fn,
            "precision": round(float(precision), 4),
            "recall": round(float(recall), 4),
            "f1_score": round(float(f1), 4),
            "accuracy": round(float(accuracy), 4),
            "mean_anomaly_score": round(float(np.mean(anomaly_scores)), 4)
        }

    # Aggregate metrics
    overall_accuracy = (total_tp + total_tn) / (total_tp + total_tn + total_fp + total_fn) if (total_tp + total_tn + total_fp + total_fn) > 0 else 0.0
    overall_precision = total_tp / (total_tp + total_fp) if (total_tp + total_fp) > 0 else 0.0
    overall_recall = total_tp / (total_tp + total_fn) if (total_tp + total_fn) > 0 else 0.0
    overall_f1 = 2 * overall_precision * overall_recall / (overall_precision + overall_recall) if (overall_precision + overall_recall) > 0 else 0.0

    avg_f1 = np.mean([res["f1_score"] for res in machine_results.values()]) if machine_results else 0.0
    avg_precision = np.mean([res["precision"] for res in machine_results.values()]) if machine_results else 0.0
    avg_recall = np.mean([res["recall"] for res in machine_results.values()]) if machine_results else 0.0

    summary = {
        "model_type": "IsolationForest",
        "dataset": "Server Machine Dataset (SMD)",
        "num_machines": len(machine_results),
        "total_test_timesteps": total_tp + total_tn + total_fp + total_fn,
        "overall_tp": total_tp,
        "overall_fp": total_fp,
        "overall_tn": total_tn,
        "overall_fn": total_fn,
        "micro_precision": round(float(overall_precision), 4),
        "micro_recall": round(float(overall_recall), 4),
        "micro_f1": round(float(overall_f1), 4),
        "macro_precision": round(float(avg_precision), 4),
        "macro_recall": round(float(avg_recall), 4),
        "macro_f1": round(float(avg_f1), 4),
        "accuracy": round(float(overall_accuracy), 4),
        "machine_details": machine_results
    }

    os.makedirs(os.path.dirname(OUTPUT_PATH_PUBLIC), exist_ok=True)

    with open(OUTPUT_PATH_ML, "w") as f:
        json.dump(summary, f, indent=2)

    with open(OUTPUT_PATH_PUBLIC, "w") as f:
        json.dump(summary, f, indent=2)

    print(f"Evaluation complete across {len(machine_results)} machines!")
    print(f"Micro F1: {overall_f1:.4f} | Macro F1: {avg_f1:.4f} | Overall Accuracy: {overall_accuracy:.4f}")
    print(f"Saved results to {OUTPUT_PATH_ML} and {OUTPUT_PATH_PUBLIC}")

if __name__ == "__main__":
    evaluate_all_machines()
