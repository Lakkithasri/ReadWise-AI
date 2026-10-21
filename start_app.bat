@echo off
title ReadWise AI - Launcher
echo ===================================================
echo            Starting ReadWise AI System
echo ===================================================
echo.

cd /d "%~dp0"

:: 1. Start Backend in separate window
echo [1/3] Starting Backend Server (FastAPI on Port 8000)...
start "ReadWise Backend (FastAPI)" cmd /k "backend\venv\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000"

:: 2. Start Frontend in separate window
echo [2/3] Starting Frontend Dev Server (Vite on Port 5173)...
start "ReadWise Frontend (Vite)" cmd /k "cd frontend && npm run dev"

:: 3. Wait for startup and launch browser
echo [3/3] Waiting for servers to initialize...
timeout /t 3 /nobreak > nul

echo.
echo Launching your browser at http://localhost:5173 ...
start http://localhost:5173

echo.
echo ===================================================
echo ReadWise AI is running!
echo - Frontend: http://localhost:5173
echo - Backend:  http://127.0.0.1:8000
echo.
echo Tip: Double-click stop_app.bat when you want to stop.
echo ===================================================
