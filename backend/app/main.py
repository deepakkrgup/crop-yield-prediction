from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.db.session import init_db
from backend.app.services.ml_service import ml_service
from backend.app.api.endpoints import predict, predictions, crops, analytics, models, graph

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Intelligent Crop Yield Prediction & Big Data Agricultural Analytics Platform"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    print(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}...")
    init_db()
    ml_service.load_model()
    print("Database and ML models initialized successfully.")

# Mount API Routers under /api
app.include_router(predict.router, prefix="/api", tags=["Prediction"])
app.include_router(predictions.router, prefix="/api", tags=["History"])
app.include_router(crops.router, prefix="/api", tags=["Metadata & Presets"])
app.include_router(analytics.router, prefix="/api", tags=["Crop Analytics"])
app.include_router(models.router, prefix="/api", tags=["Machine Learning"])
app.include_router(graph.router, prefix="/api", tags=["GraphX Agricultural Analysis"])

@app.get("/")
def root():
    return {
        "status": "online",
        "system": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "documentation": "/docs"
    }

@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "model_loaded": ml_service.model is not None,
        "database": "connected"
    }
