# CropYield AI - PowerShell Startup Script
Write-Host "=====================================================================" -ForegroundColor Green
Write-Host "      Starting CropYield AI (Cluster Computing & ML Platform)" -ForegroundColor White
Write-Host "=====================================================================" -ForegroundColor Green

$RootPath = $PSScriptRoot
Set-Location $RootPath

Write-Host "`n[1/2] Starting FastAPI Backend on http://localhost:8000 ..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$RootPath'; python run_backend.py"

Start-Sleep -Seconds 3

Write-Host "[2/2] Starting React Vite Frontend on http://localhost:5173 ..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$RootPath\frontend'; npm run dev"

Write-Host "`n=====================================================================" -ForegroundColor Green
Write-Host "  CropYield AI launched successfully!" -ForegroundColor White
Write-Host "  Frontend:           http://localhost:5173" -ForegroundColor Yellow
Write-Host "  Backend Swagger:    http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host "=====================================================================" -ForegroundColor Green
