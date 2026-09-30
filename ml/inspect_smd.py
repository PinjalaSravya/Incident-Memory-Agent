import os
import glob
import numpy as np
import pandas as pd

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'ServerMachineDataset')
TRAIN_DIR = os.path.join(DATA_DIR, 'train')
TEST_DIR = os.path.join(DATA_DIR, 'test')
LABEL_DIR = os.path.join(DATA_DIR, 'test_label')

def inspect_dataset():
    print("=" * 70)
    print("SERVER MACHINE DATASET (SMD) - PROGRAMMATIC INSPECTION REPORT")
    print("=" * 70)

    train_files = sorted(glob.glob(os.path.join(TRAIN_DIR, "*.txt")))
    test_files = sorted(glob.glob(os.path.join(TEST_DIR, "*.txt")))
    label_files = sorted(glob.glob(os.path.join(LABEL_DIR, "*.txt")))

    print(f"Train files count      : {len(train_files)}")
    print(f"Test files count       : {len(test_files)}")
    print(f"Test label files count : {len(label_files)}")
    print("-" * 70)

    report_data = []

    for train_path in train_files:
        machine_name = os.path.basename(train_path).replace(".txt", "")
        test_path = os.path.join(TEST_DIR, f"{machine_name}.txt")
        label_path = os.path.join(LABEL_DIR, f"{machine_name}.txt")

        # Load data
        train_df = pd.read_csv(train_path, header=None)
        test_df = pd.read_csv(test_path, header=None)
        label_df = pd.read_csv(label_path, header=None)

        train_shape = train_df.shape
        test_shape = test_df.shape
        label_shape = label_df.shape

        # Data quality checks
        train_nan = train_df.isna().sum().sum()
        test_nan = test_df.isna().sum().sum()
        train_inf = np.isinf(train_df.values).sum()
        test_inf = np.isinf(test_df.values).sum()
        train_duplicates = train_df.duplicated().sum()

        # Constant features in train set
        constant_features = [col for col in train_df.columns if train_df[col].nunique() <= 1]

        # Anomaly ratio in test_label
        anomaly_count = (label_df[0] == 1).sum()
        normal_count = (label_df[0] == 0).sum()
        anomaly_ratio = anomaly_count / len(label_df) if len(label_df) > 0 else 0

        dim_match = (test_shape[0] == label_shape[0])

        report_data.append({
            "machine": machine_name,
            "train_shape": f"{train_shape[0]}x{train_shape[1]}",
            "test_shape": f"{test_shape[0]}x{test_shape[1]}",
            "label_shape": f"{label_shape[0]}x{label_shape[1]}",
            "dim_match": dim_match,
            "nan_count": train_nan + test_nan,
            "inf_count": train_inf + test_inf,
            "duplicates": train_duplicates,
            "constant_cols": len(constant_features),
            "test_anomalies": anomaly_count,
            "anomaly_ratio": f"{anomaly_ratio * 100:.2f}%"
        })

    df_report = pd.DataFrame(report_data)
    print(df_report.to_string(index=False))

    print("\n" + "=" * 70)
    print("DATASET INTEGRITY & SUMMARY VERIFICATION:")
    print(f"Total Machine Entities    : {len(report_data)}")
    print(f"All Dimensions Match     : {df_report['dim_match'].all()}")
    print(f"Total NaN/Missing Values  : {df_report['nan_count'].sum()}")
    print(f"Total Infinite Values     : {df_report['inf_count'].sum()}")
    print(f"Total Duplicate Rows      : {df_report['duplicates'].sum()}")
    print(f"Features Per Timestep     : 38")
    print("=" * 70)

if __name__ == "__main__":
    inspect_dataset()
