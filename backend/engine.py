import json
import joblib
import numpy as np
import pandas as pd
import shap

class ClinicalInferenceEngine:
    def __init__(self, model_path: str = "models/sepsis_lgbm.joblib", meta_path: str = "models/model_metadata.json"):
        # Load the trained model and feature metadata exported from Colab
        self.model = joblib.load(model_path)
        with open(meta_path, 'r') as f:
            self.metadata = json.load(f)
        
        self.feature_columns = self.metadata['feature_columns']
        self.explainer = shap.TreeExplainer(self.model)
        
        # Store rolling observation history per patient: {patient_id: [records]}
        self.patient_buffers = {}

    def push_measurement(self, patient_id: str, row_dict: dict) -> dict:
        if patient_id not in self.patient_buffers:
            self.patient_buffers[patient_id] = []
        
        self.patient_buffers[patient_id].append(row_dict)
        
        # Maintain a sliding window of recent observations
        if len(self.patient_buffers[patient_id]) > 8:
            self.patient_buffers[patient_id].pop(0)
            
        return self._evaluate(patient_id)

    def _evaluate(self, patient_id: str) -> dict:
        window_df = pd.DataFrame(self.patient_buffers[patient_id])
        latest = window_df.iloc[-1]
        
        # Build aggregation dictionary matching the training feature engineering pipeline
        agg_features = {}
        exclude_cols = {'patient_id', 'hour', 'Hour', 'time', 'ICULOS', 'label', 'SepsisLabel'}
        dynamic_cols = [c for c in window_df.columns if c not in exclude_cols]
        
        for col in dynamic_cols:
            vals = pd.to_numeric(window_df[col], errors='coerce').dropna()
            if len(vals) > 0:
                agg_features[f"{col}_mean"] = float(vals.mean())
                agg_features[f"{col}_std"] = float(vals.std(ddof=0)) if len(vals) > 1 else 0.0
                agg_features[f"{col}_min"] = float(vals.min())
                agg_features[f"{col}_max"] = float(vals.max())
                agg_features[f"{col}_first"] = float(vals.iloc[0])
                agg_features[f"{col}_last"] = float(vals.iloc[-1])
                agg_features[f"{col}_delta"] = float(vals.iloc[-1] - vals.iloc[0])
            else:
                for stat in ['mean', 'std', 'min', 'max', 'first', 'last', 'delta']:
                    agg_features[f"{col}_{stat}"] = -999.0

        # Engineering clinical ratios safely handling null/NaN measurements
        def safe_float(val, default):
            if val is None or pd.isna(val):
                return float(default)
            try:
                return float(val)
            except (ValueError, TypeError):
                return float(default)

        hr_val = latest.get('HR') if latest.get('HR') is not None else latest.get('HeartRate')
        sbp_val = latest.get('SBP') if latest.get('SBP') is not None else latest.get('SysBP')
        dbp_val = latest.get('DBP') if latest.get('DBP') is not None else latest.get('DiasBP')

        hr_last = safe_float(hr_val, 80.0)
        sbp_last = safe_float(sbp_val, 120.0)
        dbp_last = safe_float(dbp_val, 80.0)
        
        agg_features['Shock_Index_last'] = hr_last / (sbp_last + 1e-5)
        agg_features['Pulse_Pressure_last'] = sbp_last - dbp_last
        agg_features['total_observations_count'] = float(window_df[dynamic_cols].count().sum())

        # Align columns with exact training feature order
        X_df = pd.DataFrame([agg_features]).reindex(columns=self.feature_columns, fill_value=-999.0)

        # 1. Predict risk probability (0.0 to 1.0) and scale to integer 1-99
        prob = float(self.model.predict_proba(X_df)[0, 1])
        overall_risk = int(np.clip(prob * 100, 1, 99))

        # 2. Compute exact TreeSHAP values for local explainability
        shap_vals = self.explainer.shap_values(X_df)
        if isinstance(shap_vals, list):
            patient_shap = shap_vals[1][0]
        else:
            patient_shap = shap_vals[0]

        top_indices = np.argsort(patient_shap)[::-1][:4]
        contributing_factors = []

        feature_labels = {
            'HR': 'Heart Rate Trend',
            'O2Sat': 'Oxygen Saturation (SpO2)',
            'Temp': 'Body Temperature',
            'SBP': 'Systolic Blood Pressure',
            'Resp': 'Respiratory Rate',
            'Shock_Index': 'Shock Index (HR/SBP)',
            'WBC': 'White Blood Cell Count',
            'Lactate': 'Serum Lactate'
        }

        for idx in top_indices:
            val = patient_shap[idx]
            if val > 0:  # Only include features actively driving risk upward
                feat_name = self.feature_columns[idx]
                root_var = feat_name.split('_')[0]
                label = feature_labels.get(root_var, feat_name)
                contributing_factors.append({
                    "label": label,
                    "contribution": round(float(val * 10), 1),
                    "detail": f"Feature signal {feat_name} elevated deterioration risk"
                })

        # Calculate sub-risk components for the dashboard drawer
        sepsis_risk = overall_risk
        cardiac_risk = int(np.clip(overall_risk * 0.7 + (agg_features['Shock_Index_last'] * 10), 1, 99))
        o2_val = latest.get('O2Sat')
        o2_num = safe_float(o2_val, 96.0)
        resp_risk = int(np.clip(overall_risk * 0.85 + (30 - o2_num), 1, 99))
        mortality_risk = int(np.clip(overall_risk * 0.65, 1, 99))

        hr_delta = agg_features.get('HR_delta', 0.0)
        trend = "up" if hr_delta > 2 else ("down" if hr_delta < -2 else "stable")

        return {
            "risk": {
                "overall": overall_risk,
                "sepsis": sepsis_risk,
                "cardiacArrest": cardiac_risk,
                "respiratoryFailure": resp_risk,
                "mortality": mortality_risk,
                "trend": trend
            },
            "factors": contributing_factors
        }