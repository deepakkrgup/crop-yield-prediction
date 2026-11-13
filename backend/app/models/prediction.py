from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from backend.app.db.session import Base

class PredictionRecord(Base):
    __tablename__ = "prediction_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Input parameters
    state = Column(String(100), nullable=False)
    district = Column(String(100), nullable=False)
    crop = Column(String(100), nullable=False)
    season = Column(String(50), nullable=False)
    soil_type = Column(String(50), nullable=False)
    soil_ph = Column(Float, nullable=False)
    temperature = Column(Float, nullable=False)
    rainfall = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    area = Column(Float, nullable=False)
    fertilizer = Column(Float, nullable=False)
    nitrogen = Column(Float, nullable=False)
    phosphorus = Column(Float, nullable=False)
    potassium = Column(Float, nullable=False)

    # ML Output
    predicted_yield = Column(Float, nullable=False)  # Tonnes per hectare
    predicted_production = Column(Float, nullable=False)  # Total tonnes
    confidence_score = Column(Float, nullable=False)  # e.g., 94.5%
    uncertainty_range = Column(String(50), nullable=False)  # e.g., "±0.18 t/ha"
    model_used = Column(String(100), default="Random Forest Regressor")
    recommendations = Column(Text, nullable=True)  # JSON-serialized list of advice
