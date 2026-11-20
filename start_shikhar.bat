@echo off
title PROJECT SHIKHAR - Unified Platform Launcher
echo =====================================================================
echo  PROJECT SHIKHAR - Unified Defense Logistics Platform
echo  Running on Single Unified Host: http://localhost:8000
echo =====================================================================
echo.
echo Starting Unified Server (Frontend UI + Backend API)...
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
pause
