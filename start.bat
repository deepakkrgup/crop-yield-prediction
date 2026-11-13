@echo off
TITLE CropYield AI - Intelligent Crop Yield Prediction Platform
echo =====================================================================
echo       Starting CropYield AI (Cluster Computing & ML Platform)
echo =====================================================================
echo.

cd /d "%~dp0"

echo [1/2] Starting FastAPI Backend on http://localhost:8000 ...
start "CropYield AI Backend" cmd /k "python run_backend.py"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Vite React Frontend on http://localhost:5173 ...
cd frontend
start "CropYield AI Frontend" cmd /k "npm run dev"

echo.
echo =====================================================================
echo   CropYield AI is running!
echo   Frontend: http://localhost:5173
echo   Backend API & Docs: http://localhost:8000/docs
echo =====================================================================
pause
