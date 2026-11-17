import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
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

@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "model_loaded": ml_service.model is not None,
        "database": "connected"
    }

# Production Static Files (React build bundle)
frontend_dist = os.path.join(settings.BASE_DIR, "frontend", "dist")
if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Don't intercept API or docs
        if full_path.startswith("api") or full_path in ["docs", "redoc", "openapi.json"]:
            return None
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "status": "online",
            "system": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "documentation": "/docs",
            "note": "Frontend dist folder not detected. Run 'npm run build' inside frontend/ to serve UI."
        }
