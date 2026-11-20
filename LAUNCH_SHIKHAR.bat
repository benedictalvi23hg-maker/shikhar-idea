@echo off
title PROJECT SHIKHAR - Unified Platform Launcher
color 0A
cls
echo ===============================================================================
echo        PROJECT SHIKHAR - UNIFIED PREDICTIVE LOGISTICS MANAGEMENT SYSTEM
echo             Northern Command Logistics Intelligence Operational Engine
echo ===============================================================================
echo.
echo [1/2] Initializing Unified Tactical Platform (Port 8000)...

cd /d "%~dp0backend"

:: Start Uvicorn backend in a background window
start /min "SHIKHAR_BACKEND" python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

echo [2/2] Connecting to Tactical Command Console...
timeout /t 3 /nobreak > nul

:: Open user default web browser to localhost:8000
start http://localhost:8000

echo.
echo ===============================================================================
echo  SUCCESS: Project SHIKHAR is actively running on http://localhost:8000
echo.
echo  Default Command Credentials:
echo    Username: commander.shikhar
echo    Password: Shikhar2026!
echo.
echo  To shut down the platform, close the background 'SHIKHAR_BACKEND' terminal.
echo ===============================================================================
echo.
pause
