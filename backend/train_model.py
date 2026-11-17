import json
import os
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, accuracy_score, precision_score, recall_score
import lightgbm as lgb

def generate_synthetic_sepsis_dataset(n_samples=2500, random_seed=42):
    np.random.seed(random_seed)
    
    # Generate realistic clinical vitals
    hr = np.random.normal(85, 18, n_samples)
    o2sat = np.random.normal(96, 4, n_samples)
    temp = np.random.normal(37.0, 0.8, n_samples)
    sbp = np.random.normal(122, 18, n_samples)
    dbp = np.random.normal(78, 12, n_samples)
    resp = np.random.normal(18, 5, n_samples)
    wbc = np.random.normal(11.0, 4.5, n_samples)
    lactate = np.random.exponential(1.5, n_samples)
    
    # Calculate physiological ratios
    shock_index = hr / (sbp + 1e-5)
    pulse_pressure = sbp - dbp
    
    # Underlying true sepsis risk rule (for ground truth labeling)
    sepsis_logits = (
        0.04 * (hr - 90) +
        -0.25 * (o2sat - 94) +
        0.8 * (temp - 38.0) +
        0.05 * (resp - 20) +
        2.5 * (shock_index - 0.7) +
        0.3 * (wbc - 12.0) +
        0.8 * (lactate - 2.0) +
        np.random.normal(0, 0.5, n_samples)
    )
    
    probs = 1 / (1 + np.exp(-sepsis_logits))
    labels = (probs > 0.45).astype(int)
    
    feature_dict = {
        'HR_mean': hr,
        'HR_std': np.random.uniform(0.5, 5.0, n_samples),
        'HR_min': hr - np.random.uniform(1, 8, n_samples),
        'HR_max': hr + np.random.uniform(1, 8, n_samples),
        'HR_first': hr - np.random.uniform(-3, 3, n_samples),
        'HR_last': hr,
        'HR_delta': np.random.uniform(-4, 4, n_samples),
        'O2Sat_mean': o2sat,
        'O2Sat_std': np.random.uniform(0.1, 2.0, n_samples),
        'O2Sat_min': np.clip(o2sat - np.random.uniform(0, 4, n_samples), 70, 100),
        'O2Sat_max': np.clip(o2sat + np.random.uniform(0, 2, n_samples), 70, 100),
        'O2Sat_first': o2sat + np.random.uniform(-1, 1, n_samples),
        'O2Sat_last': o2sat,
        'O2Sat_delta': np.random.uniform(-2, 2, n_samples),
        'Temp_mean': temp,
        'Temp_std': np.random.uniform(0.05, 0.4, n_samples),
        'Temp_min': temp - 0.2,
        'Temp_max': temp + 0.2,
        'Temp_first': temp,
        'Temp_last': temp,
        'Temp_delta': np.random.uniform(-0.3, 0.3, n_samples),
        'SBP_mean': sbp,
        'SBP_std': np.random.uniform(1, 8, n_samples),
        'SBP_min': sbp - 5,
        'SBP_max': sbp + 5,
        'SBP_first': sbp,
        'SBP_last': sbp,
        'SBP_delta': np.random.uniform(-6, 6, n_samples),
        'Resp_mean': resp,
        'Resp_std': np.random.uniform(0.5, 3.0, n_samples),
        'Resp_min': resp - 2,
        'Resp_max': resp + 2,
        'Resp_first': resp,
        'Resp_last': resp,
        'Resp_delta': np.random.uniform(-2, 2, n_samples),
        'Shock_Index_last': shock_index,
        'Pulse_Pressure_last': pulse_pressure,
        'total_observations_count': np.random.randint(4, 12, n_samples).astype(float)
    }
    
    df = pd.DataFrame(feature_dict)
    return df, labels

def train_regularized_model():
    print("==================================================")
    print("CAREX Clinical AI — Regularized Sepsis Model Training")
    print("==================================================")
    
    X, y = generate_synthetic_sepsis_dataset(n_samples=3000, random_seed=42)
    feature_columns = list(X.columns)
    
    # 70% Train, 15% Validation, 15% Test split
    X_train, X_temp, y_train, y_temp = train_test_split(X, y, test_size=0.30, random_state=42, stratify=y)
    X_val, X_test, y_val, y_test = train_test_split(X_temp, y_temp, test_size=0.50, random_state=42, stratify=y_temp)
    
    print(f"Dataset split: Train={len(X_train)}, Val={len(X_val)}, Test={len(X_test)}")
    
    # Conservative hyperparameters tuned to prevent overfitting & ensure generalization
    model = lgb.LGBMClassifier(
        objective='binary',
        boosting_type='gbdt',
        n_estimators=80,
        learning_rate=0.03,
        num_leaves=7,
        max_depth=3,
        min_child_samples=40,
        subsample=0.7,
        colsample_bytree=0.6,
        reg_alpha=1.0,
        reg_lambda=2.0,
        random_state=42,
        verbosity=-1
    )
    
    # Fit model with early stopping on held-out validation set
    model.fit(
        X_train, y_train,
        eval_set=[(X_train, y_train), (X_val, y_val)],
        eval_names=['train', 'val'],
        eval_metric='auc',
        callbacks=[lgb.early_stopping(stopping_rounds=10, verbose=False)]
    )
    
    # Evaluate performance
    train_preds = model.predict_proba(X_train)[:, 1]
    val_preds = model.predict_proba(X_val)[:, 1]
    test_preds = model.predict_proba(X_test)[:, 1]
    
    val_class = (val_preds > 0.5).astype(int)
    
    train_auc = roc_auc_score(y_train, train_preds)
    val_auc = roc_auc_score(y_val, val_preds)
    test_auc = roc_auc_score(y_test, test_preds)
    
    val_acc = accuracy_score(y_val, val_class)
    val_prec = precision_score(y_val, val_class)
    val_rec = recall_score(y_val, val_class)
    
    print("\n--- Model Performance Metrics ---")
    print(f"Train ROC-AUC:      {train_auc:.4f}")
    print(f"Validation ROC-AUC: {val_auc:.4f}")
    print(f"Test ROC-AUC:       {test_auc:.4f}")
    print(f"Validation Accuracy:  {val_acc:.4f}")
    print(f"Validation Precision: {val_prec:.4f}")
    print(f"Validation Recall:    {val_rec:.4f}")
    
    # Check AUC gap to confirm no overfitting
    auc_gap = train_auc - val_auc
    print(f"Train vs Validation AUC Gap: {auc_gap:.4f} ({'Pass: Well Generalized' if auc_gap < 0.05 else 'Warning: Potential Overfitting'})")
    
    # Save trained model and metadata
    base_dir = os.path.dirname(os.path.abspath(__file__))
    models_dir = os.path.join(base_dir, "models")
    os.makedirs(models_dir, exist_ok=True)
    
    model_path = os.path.join(models_dir, "sepsis_lgbm.joblib")
    meta_path = os.path.join(models_dir, "model_metadata.json")
    
    joblib.dump(model, model_path)
    
    metadata = {
        "model_type": "LightGBM Classifier",
        "n_estimators": model.n_estimators,
        "best_iteration": model.best_iteration_,
        "feature_columns": feature_columns,
        "metrics": {
            "train_auc": round(train_auc, 4),
            "val_auc": round(val_auc, 4),
            "test_auc": round(test_auc, 4),
            "val_accuracy": round(val_acc, 4),
            "val_precision": round(val_prec, 4),
            "val_recall": round(val_rec, 4)
        }
    }
    
    with open(meta_path, 'w') as f:
        json.dump(metadata, f, indent=2)
        
    print(f"\nModel successfully saved to {model_path}")
    print(f"Metadata saved to {meta_path}")
    print("==================================================")

if __name__ == "__main__":
    train_regularized_model()
