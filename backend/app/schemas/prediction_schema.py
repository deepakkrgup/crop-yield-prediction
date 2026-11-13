from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, Field

class PredictRequest(BaseModel):
    state: str = Field(..., example="Punjab")
    district: str = Field(..., example="Ludhiana")
    crop: str = Field(..., example="Wheat")
    season: str = Field(..., example="Rabi")
    soil_type: str = Field(..., example="Alluvial")
    soil_ph: float = Field(..., ge=3.5, le=10.5, example=6.8)
    temperature: float = Field(..., ge=-5.0, le=55.0, example=18.5)
    rainfall: float = Field(..., ge=10.0, le=5000.0, example=480.0)
    humidity: float = Field(..., ge=10.0, le=100.0, example=62.0)
    area: float = Field(..., ge=0.01, le=50000.0, example=5.0)
    fertilizer: float = Field(..., ge=0.0, le=1000.0, example=185.0)
    nitrogen: float = Field(..., ge=0.0, le=400.0, example=110.0)
    phosphorus: float = Field(..., ge=0.0, le=300.0, example=50.0)
    potassium: float = Field(..., ge=0.0, le=300.0, example=40.0)

class AgronomicAdvice(BaseModel):
    category: str
    status: str  # "optimal", "warning", "critical"
    message: str

class PredictResponse(BaseModel):
    id: Optional[int] = None
    predicted_yield: float  # tonnes / hectare
    predicted_production: float  # tonnes
    confidence_score: float  # e.g. 94.2%
    uncertainty_range: str  # "±0.16 t/ha"
    model_used: str
    national_benchmark_yield: float
    yield_comparison_pct: float  # e.g. +14.5% vs benchmark
    recommendations: List[AgronomicAdvice]
    input_summary: dict

class PredictionRecordResponse(BaseModel):
    id: int
    created_at: datetime
    state: str
    district: str
    crop: str
    season: str
    soil_type: str
    soil_ph: float
    temperature: float
    rainfall: float
    humidity: float
    area: float
    fertilizer: float
    nitrogen: float
    phosphorus: float
    potassium: float
    predicted_yield: float
    predicted_production: float
    confidence_score: float
    uncertainty_range: str
    model_used: str
    recommendations: Optional[str] = None

    class Config:
        from_attributes = True

class ModelComparisonItem(BaseModel):
    name: str
    r2_score: float
    mae: float
    rmse: float
    is_best: bool
    engine: Optional[str] = "Spark / Scikit Bridge"

class ModelPerformanceResponse(BaseModel):
    best_model: str
    dataset_size: int
    train_samples: int
    test_samples: int
    models_comparison: List[ModelComparisonItem]
    feature_importances: List[dict]
    evaluation_timestamp: str
