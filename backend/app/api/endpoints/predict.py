import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.schemas.prediction_schema import PredictRequest, PredictResponse
from backend.app.models.prediction import PredictionRecord
from backend.app.services.ml_service import ml_service

router = APIRouter()

@router.post("/predict", response_model=PredictResponse)
def predict_crop_yield(request: PredictRequest, db: Session = Depends(get_db)):
    try:
        # Run ML inference
        result = ml_service.predict(request.model_dump())
        
        # Save prediction record to database history
        record = PredictionRecord(
            state=request.state,
            district=request.district,
            crop=request.crop,
            season=request.season,
            soil_type=request.soil_type,
            soil_ph=request.soil_ph,
            temperature=request.temperature,
            rainfall=request.rainfall,
            humidity=request.humidity,
            area=request.area,
            fertilizer=request.fertilizer,
            nitrogen=request.nitrogen,
            phosphorus=request.phosphorus,
            potassium=request.potassium,
            predicted_yield=result["predicted_yield"],
            predicted_production=result["predicted_production"],
            confidence_score=result["confidence_score"],
            uncertainty_range=result["uncertainty_range"],
            model_used=result["model_used"],
            recommendations=json.dumps(result["recommendations"])
        )
        db.add(record)
        db.commit()
        db.refresh(record)

        result["id"] = record.id
        return result
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")
