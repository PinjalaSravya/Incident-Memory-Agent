import os
import joblib
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'ServerMachineDataset')
TRAIN_DIR = os.path.join(DATA_DIR, 'train')
TEST_DIR = os.path.join(DATA_DIR, 'test')
LABEL_DIR = os.path.join(DATA_DIR, 'test_label')
MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'ml', 'models')

os.makedirs(MODELS_DIR, exist_ok=True)

def load_machine_raw_data(machine_name: str):
    """
    Load raw train, test, and test_label data for a specific machine entity.
    """
    train_path = os.path.join(TRAIN_DIR, f"{machine_name}.txt")
    test_path = os.path.join(TEST_DIR, f"{machine_name}.txt")
    label_path = os.path.join(LABEL_DIR, f"{machine_name}.txt")

    if not os.path.exists(train_path):
        raise FileNotFoundError(f"Train data file not found: {train_path}")

    train_data = np.loadtxt(train_path, delimiter=',', dtype=np.float32)
    test_data = np.loadtxt(test_path, delimiter=',', dtype=np.float32)
    test_labels = np.loadtxt(label_path, delimiter=',', dtype=np.int32)

    return train_data, test_data, test_labels

def build_and_fit_scaler(train_data: np.ndarray, machine_name: str):
    """
    Fits a StandardScaler using TRAIN data ONLY and saves it to disk.
    Does NOT use test data or test labels.
    """
    machine_dir = os.path.join(MODELS_DIR, machine_name)
    os.makedirs(machine_dir, exist_ok=True)

    scaler = StandardScaler()
    scaler.fit(train_data)

    scaler_path = os.path.join(machine_dir, 'scaler.joblib')
    joblib.dump(scaler, scaler_path)

    return scaler

def load_scaler(machine_name: str):
    """
    Loads fitted scaler for a machine entity.
    """
    scaler_path = os.path.join(MODELS_DIR, machine_name, 'scaler.joblib')
    if not os.path.exists(scaler_path):
        raise FileNotFoundError(f"Scaler not found for machine {machine_name} at {scaler_path}")
    return joblib.load(scaler_path)

def preprocess_machine_data(machine_name: str):
    """
    Full pipeline to load raw data, fit scaler on TRAIN only, and return scaled datasets.
    """
    train_data, test_data, test_labels = load_machine_raw_data(machine_name)
    scaler = build_and_fit_scaler(train_data, machine_name)

    train_scaled = scaler.transform(train_data)
    test_scaled = scaler.transform(test_data)

    return train_scaled, test_scaled, test_labels, scaler
