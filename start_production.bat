@echo off
TITLE CropYield AI - Production Unified Server
echo =====================================================================
echo    Starting CropYield AI (Unified Full-Stack Production Server)
echo =====================================================================
echo.

cd /d "%~dp0"

echo [1/2] Verifying frontend production build...
if not exist "frontend\dist\index.html" (
    echo Building frontend assets...
    cd frontend && npm run build && cd ..
)

echo [2/2] Launching FastAPI Unified Server on http://localhost:8000 ...
python run_backend.py
pause
