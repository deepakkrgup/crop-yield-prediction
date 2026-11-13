import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "CropYield AI – Intelligent Crop Yield Prediction System"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api"
    
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    DATA_DIR: str = os.path.join(BASE_DIR, "data")
    MODELS_DIR: str = os.path.join(DATA_DIR, "models")
    METRICS_DIR: str = os.path.join(DATA_DIR, "metrics")
    
    MODEL_PATH: str = os.path.join(MODELS_DIR, "best_crop_yield_model.joblib")
    METRICS_PATH: str = os.path.join(METRICS_DIR, "model_evaluation_metrics.json")
    GRAPH_DATA_PATH: str = os.path.join(METRICS_DIR, "agricultural_graph_data.json")
    DATASET_CSV_PATH: str = os.path.join(DATA_DIR, "crop_yield_dataset.csv")
    
    DATABASE_URL: str = f"sqlite:///{os.path.join(DATA_DIR, 'cropyield_history.db')}"

settings = Settings()
