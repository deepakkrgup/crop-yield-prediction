import os
import json
import pandas as pd
from fastapi import APIRouter
from backend.app.config import settings

router = APIRouter()

# In-memory cache for analytics
_cached_analytics = None

def load_or_compute_analytics():
    global _cached_analytics
    if _cached_analytics is not None:
        return _cached_analytics

    if not os.path.exists(settings.DATASET_CSV_PATH):
        return {}

    df = pd.read_csv(settings.DATASET_CSV_PATH)

    # 1. KPI Stats
    total_records = len(df)
    total_cultivated_area = round(float(df["Area_Hectares"].sum()), 2)
    avg_predicted_yield = round(float(df["Yield_tonnes_per_hectare"].mean()), 2)
    
    # Most productive crop by average yield
    crop_means = df.groupby("Crop")["Yield_tonnes_per_hectare"].mean()
    most_productive_crop = crop_means.idxmax()
    most_productive_yield = round(float(crop_means.max()), 2)

    # 2. Crop-wise yield comparison
    crop_stats = df.groupby("Crop").agg(
        avg_yield=("Yield_tonnes_per_hectare", "mean"),
        min_yield=("Yield_tonnes_per_hectare", "min"),
        max_yield=("Yield_tonnes_per_hectare", "max"),
        total_production=("Production_tonnes", "sum"),
        records_count=("Record_ID", "count")
    ).reset_index()

    crop_yield_chart = [
        {
            "crop": row["Crop"],
            "avg_yield": round(float(row["avg_yield"]), 2),
            "min_yield": round(float(row["min_yield"]), 2),
            "max_yield": round(float(row["max_yield"]), 2),
            "total_production": round(float(row["total_production"]), 2),
            "count": int(row["records_count"])
        }
        for _, row in crop_stats.sort_values(by="avg_yield", ascending=False).iterrows()
    ]

    # 3. State-wise crop production chart
    state_stats = df.groupby("State").agg(
        total_production=("Production_tonnes", "sum"),
        avg_yield=("Yield_tonnes_per_hectare", "mean"),
        total_area=("Area_Hectares", "sum")
    ).reset_index()

    state_production_chart = [
        {
            "state": row["State"],
            "total_production": round(float(row["total_production"]), 2),
            "avg_yield": round(float(row["avg_yield"]), 2),
            "total_area": round(float(row["total_area"]), 2)
        }
        for _, row in state_stats.sort_values(by="total_production", ascending=False).iterrows()
    ]

    # 4. Seasonal crop performance chart
    season_stats = df.groupby("Season").agg(
        avg_yield=("Yield_tonnes_per_hectare", "mean"),
        total_production=("Production_tonnes", "sum"),
        count=("Record_ID", "count")
    ).reset_index()

    seasonal_performance_chart = [
        {
            "season": row["Season"],
            "avg_yield": round(float(row["avg_yield"]), 2),
            "total_production": round(float(row["total_production"]), 2),
            "count": int(row["count"])
        }
        for _, row in season_stats.iterrows()
    ]

    # 5. Soil type productivity
    soil_stats = df.groupby("Soil_Type").agg(
        avg_yield=("Yield_tonnes_per_hectare", "mean"),
        count=("Record_ID", "count")
    ).reset_index()

    soil_productivity_chart = [
        {
            "soil_type": row["Soil_Type"],
            "avg_yield": round(float(row["avg_yield"]), 2),
            "count": int(row["count"])
        }
        for _, row in soil_stats.sort_values(by="avg_yield", ascending=False).iterrows()
    ]

    # 6. Sample points for Rainfall vs Yield and Temperature vs Yield (downsampled 150 points for snappy chart rendering)
    sample_df = df.sample(n=min(200, len(df)), random_state=42)
    rainfall_vs_yield = [
        {
            "rainfall": round(float(row["Rainfall_mm"]), 1),
            "yield": round(float(row["Yield_tonnes_per_hectare"]), 2),
            "crop": row["Crop"]
        }
        for _, row in sample_df.iterrows()
    ]

    temperature_vs_yield = [
        {
            "temperature": round(float(row["Temperature_C"]), 1),
            "yield": round(float(row["Yield_tonnes_per_hectare"]), 2),
            "crop": row["Crop"]
        }
        for _, row in sample_df.iterrows()
    ]

    # 7. Year-wise simulated trend (based on 5-year agricultural cycle)
    year_trends = [
        {"year": 2020, "production_index": 92.4, "avg_yield": round(avg_predicted_yield * 0.94, 2)},
        {"year": 2021, "production_index": 95.8, "avg_yield": round(avg_predicted_yield * 0.96, 2)},
        {"year": 2022, "production_index": 98.1, "avg_yield": round(avg_predicted_yield * 0.98, 2)},
        {"year": 2023, "production_index": 101.5, "avg_yield": round(avg_predicted_yield * 1.01, 2)},
        {"year": 2024, "production_index": 104.2, "avg_yield": round(avg_predicted_yield * 1.04, 2)},
        {"year": 2025, "production_index": 108.7, "avg_yield": round(avg_predicted_yield * 1.07, 2)},
        {"year": 2026, "production_index": 112.3, "avg_yield": round(avg_predicted_yield * 1.10, 2)}
    ]

    _cached_analytics = {
        "kpis": {
            "total_records_analyzed": total_records,
            "total_cultivated_area_ha": total_cultivated_area,
            "avg_predicted_yield_t_ha": avg_predicted_yield,
            "most_productive_crop": most_productive_crop,
            "most_productive_yield_t_ha": most_productive_yield
        },
        "crop_yield_chart": crop_yield_chart,
        "state_production_chart": state_production_chart,
        "seasonal_performance_chart": seasonal_performance_chart,
        "soil_productivity_chart": soil_productivity_chart,
        "rainfall_vs_yield": rainfall_vs_yield,
        "temperature_vs_yield": temperature_vs_yield,
        "year_trends": year_trends
    }

    return _cached_analytics

@router.get("/analytics")
def get_analytics():
    return load_or_compute_analytics()
