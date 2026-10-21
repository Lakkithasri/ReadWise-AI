@echo off
title Stop ReadWise AI
echo ===================================================
echo            Stopping ReadWise AI System
echo ===================================================
echo.

echo Stopping services on Port 8000 and 5173...

:: Terminate process listening on port 8000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    echo Terminating backend process (PID %%a)...
    taskkill /F /PID %%a >nul 2>&1
)

:: Terminate process listening on port 5173
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do (
    echo Terminating frontend process (PID %%a)...
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo ReadWise AI servers have been stopped.
timeout /t 3 > nul
