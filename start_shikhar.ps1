# PROJECT SHIKHAR - Launch Sequence (PowerShell)
Write-Host "=====================================================================" -ForegroundColor Green
Write-Host " PROJECT SHIKHAR - Unified Predictive Logistics Platform" -ForegroundColor Yellow
Write-Host " Northern Command Logistics and Supply Chain Operational Engine" -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Green

Write-Host "`n[1/2] Initializing Backend Service (Port 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

Start-Sleep -Seconds 3

Write-Host "[2/2] Initializing Frontend Dashboard (Port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"

Write-Host "`n=====================================================================" -ForegroundColor Green
Write-Host " Systems Launched Successfully!" -ForegroundColor Green
Write-Host " Frontend Console: http://localhost:5173" -ForegroundColor White
Write-Host " Backend Swagger: http://localhost:8000/docs" -ForegroundColor White
Write-Host " Default Access:   commander.shikhar / Shikhar2026!" -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Green
