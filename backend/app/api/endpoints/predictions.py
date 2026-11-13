from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.db.session import get_db
from backend.app.models.prediction import PredictionRecord

router = APIRouter()

@router.get("/predictions")
def get_predictions(
    crop: Optional[str] = None,
    state: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(PredictionRecord)

    if crop and crop.lower() != "all":
        query = query.filter(PredictionRecord.crop.ilike(f"%{crop}%"))
    if state and state.lower() != "all":
        query = query.filter(PredictionRecord.state.ilike(f"%{state}%"))
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            (PredictionRecord.crop.ilike(search_fmt)) |
            (PredictionRecord.district.ilike(search_fmt)) |
            (PredictionRecord.state.ilike(search_fmt)) |
            (PredictionRecord.soil_type.ilike(search_fmt))
        )

    total = query.count()
    records = query.order_by(PredictionRecord.created_at.desc()).offset(offset).limit(limit).all()

    items = []
    for r in records:
        items.append({
            "id": r.id,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "state": r.state,
            "district": r.district,
            "crop": r.crop,
            "season": r.season,
            "soil_type": r.soil_type,
            "soil_ph": r.soil_ph,
            "temperature": r.temperature,
            "rainfall": r.rainfall,
            "humidity": r.humidity,
            "area": r.area,
            "fertilizer": r.fertilizer,
            "nitrogen": r.nitrogen,
            "phosphorus": r.phosphorus,
            "potassium": r.potassium,
            "predicted_yield": r.predicted_yield,
            "predicted_production": r.predicted_production,
            "confidence_score": r.confidence_score,
            "uncertainty_range": r.uncertainty_range,
            "model_used": r.model_used,
            "recommendations": r.recommendations
        })

    return {
        "total": total,
        "offset": offset,
        "limit": limit,
        "records": items
    }

@router.delete("/predictions/{record_id}")
def delete_prediction(record_id: int, db: Session = Depends(get_db)):
    record = db.query(PredictionRecord).filter(PredictionRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail=f"Prediction record #{record_id} not found")
    
    db.delete(record)
    db.commit()
    return {"status": "success", "message": f"Prediction record #{record_id} deleted successfully"}

@router.get("/predictions/stats")
def get_prediction_history_stats(db: Session = Depends(get_db)):
    total_count = db.query(func.count(PredictionRecord.id)).scalar() or 0
    if total_count == 0:
        return {
            "total_predictions": 0,
            "avg_yield": 0.0,
            "total_area": 0.0,
            "top_crop": "None"
        }
    
    avg_yield = db.query(func.avg(PredictionRecord.predicted_yield)).scalar() or 0.0
    total_area = db.query(func.sum(PredictionRecord.area)).scalar() or 0.0
    
    # Most predicted crop
    top_crop_row = db.query(
        PredictionRecord.crop, func.count(PredictionRecord.id).label("cnt")
    ).group_by(PredictionRecord.crop).order_by(func.count(PredictionRecord.id).desc()).first()

    return {
        "total_predictions": total_count,
        "avg_yield": round(float(avg_yield), 2),
        "total_area": round(float(total_area), 2),
        "top_crop": top_crop_row[0] if top_crop_row else "None"
    }
