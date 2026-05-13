@echo off
setlocal enabledelayedexpansion

echo.
echo  =========================================
echo   Perceval Composer — Windows Launcher
echo  =========================================
echo.

:: ── Resolve project root (one level up from launcher/) ───────────────────────
set ROOT=%~dp0..
cd /d "%ROOT%"

:: ── Check Python ─────────────────────────────────────────────────────────────
where python >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Install Python 3.10+ from https://python.org
    pause
    exit /b 1
)

for /f "tokens=2 delims= " %%v in ('python --version 2^>^&1') do set PYVER=%%v
echo [INFO]  Python %PYVER% detected

:: ── Create venv if not present ────────────────────────────────────────────────
if not exist "%ROOT%\.venv" (
    echo [INFO]  Creating virtual environment...
    python -m venv "%ROOT%\.venv"
)

:: ── Activate venv ─────────────────────────────────────────────────────────────
call "%ROOT%\.venv\Scripts\activate.bat"

:: ── Install backend dependencies ──────────────────────────────────────────────
echo [INFO]  Installing backend dependencies...
pip install -q -r "%ROOT%\backend\requirements.txt"
if errorlevel 1 (
    echo [ERROR] Failed to install backend dependencies.
    pause
    exit /b 1
)

:: ── Check Node.js ─────────────────────────────────────────────────────────────
where npm >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js / npm not found. Install from https://nodejs.org
    pause
    exit /b 1
)

:: ── Install frontend dependencies ─────────────────────────────────────────────
echo [INFO]  Installing frontend dependencies...
cd "%ROOT%\frontend"
npm install --silent
cd "%ROOT%"

:: ── Start FastAPI backend in a new window ─────────────────────────────────────
echo [INFO]  Starting FastAPI backend on http://localhost:8000 ...
start "Perceval Composer — Backend" cmd /k "call "%ROOT%\.venv\Scripts\activate.bat" && uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000"

:: ── Wait a moment for backend to boot ────────────────────────────────────────
timeout /t 2 /nobreak >nul

:: ── Start Vite frontend ───────────────────────────────────────────────────────
echo [INFO]  Starting frontend on http://localhost:5173 ...
start "Perceval Composer — Frontend" cmd /k "cd /d "%ROOT%\frontend" && npm run dev"

echo.
echo  ✓ Both services launching...
echo    Backend:  http://localhost:8000
echo    Frontend: http://localhost:5173
echo.
echo  Close the two terminal windows to stop the app.
echo.
pause
