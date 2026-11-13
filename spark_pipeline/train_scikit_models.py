"""
Train Machine Learning Models on Crop Yield Dataset.
Compares Linear Regression, Decision Tree Regression, and Random Forest Regression.
Evaluates on R², MAE, RMSE.
Saves model artifacts, scaler, encoders, and evaluation report.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score, mean_absolute_error, root_mean_squared_error

def train_and_evaluate():
    data_path = r"C:\Users\dipak\.gemini\antigravity\scratch\cropyield-ai\data\crop_yield_dataset.csv"
    models_dir = r"C:\Users\dipak\.gemini\antigravity\scratch\cropyield-ai\data\models"
    metrics_dir = r"C:\Users\dipak\.gemini\antigravity\scratch\cropyield-ai\data\metrics"
    os.makedirs(models_dir, exist_ok=True)
    os.makedirs(metrics_dir, exist_ok=True)

    print(f"Loading agricultural dataset from {data_path}...")
    df = pd.read_csv(data_path)
    print(f"Dataset loaded: {df.shape[0]} records, {df.shape[1]} columns.")

    # Features and Target
    categorical_features = ["State", "District", "Crop", "Season", "Soil_Type"]
    numerical_features = [
        "Soil_pH", "Temperature_C", "Rainfall_mm", "Humidity_pct",
        "Area_Hectares", "Fertilizer_kg_ha", "Nitrogen_N", "Phosphorus_P", "Potassium_K"
    ]
    target = "Yield_tonnes_per_hectare"

    X = df[categorical_features + numerical_features]
    y = df[target]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    print(f"Train set: {X_train.shape[0]} rows, Test set: {X_test.shape[0]} rows.")

    # Preprocessing pipeline
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), numerical_features),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_features)
        ]
    )

    models = {
        "Linear Regression": LinearRegression(),
        "Decision Tree Regression": DecisionTreeRegressor(max_depth=16, min_samples_leaf=4, random_state=42),
        "Random Forest Regression": RandomForestRegressor(n_estimators=100, max_depth=18, min_samples_leaf=2, random_state=42, n_jobs=-1)
    }

    results = {}
    fitted_pipelines = {}

    print("\n--- Training & Evaluating Regression Models ---")
    for name, regressor in models.items():
        print(f"\nTraining {name}...")
        pipe = Pipeline(steps=[
            ("preprocessor", preprocessor),
            ("regressor", regressor)
        ])
        pipe.fit(X_train, y_train)
        fitted_pipelines[name] = pipe

        y_pred = pipe.predict(X_test)
        r2 = float(r2_score(y_test, y_pred))
        mae = float(mean_absolute_error(y_test, y_pred))
        rmse = float(root_mean_squared_error(y_test, y_pred))

        results[name] = {
            "name": name,
            "r2_score": round(r2, 4),
            "mae": round(mae, 4),
            "rmse": round(rmse, 4),
            "is_best": False
        }
        print(f"Results for {name}: R²={r2:.4f}, MAE={mae:.4f}, RMSE={rmse:.4f}")

    # Identify best model based on R² Score
    best_model_name = max(results, key=lambda k: results[k]["r2_score"])
    results[best_model_name]["is_best"] = True
    print(f"\n>>> Best Performing Model: {best_model_name} (R²: {results[best_model_name]['r2_score']})")

    # Feature Importance analysis from Random Forest
    rf_pipeline = fitted_pipelines["Random Forest Regression"]
    rf_regressor = rf_pipeline.named_steps["regressor"]
    onehot_encoder = rf_pipeline.named_steps["preprocessor"].named_transformers_["cat"]
    cat_feature_names = list(onehot_encoder.get_feature_names_out(categorical_features))
    all_feature_names = numerical_features + cat_feature_names
    importances = rf_regressor.feature_importances_

    # Aggregate importance by category/feature group
    feature_group_importance = {feat: 0.0 for feat in numerical_features}
    for cat in categorical_features:
        feature_group_importance[cat] = 0.0

    for name, imp in zip(all_feature_names, importances):
        matched = False
        for cat in categorical_features:
            if name.startswith(cat + "_"):
                feature_group_importance[cat] += float(imp)
                matched = True
                break
        if not matched and name in feature_group_importance:
            feature_group_importance[name] += float(imp)

    # Sort feature importances
    sorted_importances = sorted(
        [{"feature": k, "importance": round(v * 100, 2)} for k, v in feature_group_importance.items()],
        key=lambda x: x["importance"],
        reverse=True
    )

    # Save best model pipeline
    best_pipe_path = os.path.join(models_dir, "best_crop_yield_model.joblib")
    joblib.dump(fitted_pipelines[best_model_name], best_pipe_path)
    print(f"Saved best model to: {best_pipe_path}")

    # Save summary evaluation metrics
    metrics_payload = {
        "dataset_size": len(df),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "best_model": best_model_name,
        "models_comparison": list(results.values()),
        "feature_importances": sorted_importances,
        "evaluation_timestamp": pd.Timestamp.now().isoformat()
    }

    metrics_path = os.path.join(metrics_dir, "model_evaluation_metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(metrics_payload, f, indent=2)
    print(f"Saved evaluation metrics to: {metrics_path}")

    return metrics_payload

if __name__ == "__main__":
    train_and_evaluate()
