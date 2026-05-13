#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo ""
echo " ========================================="
echo "  Perceval Composer — Unix Launcher"
echo " ========================================="
echo ""

# ── Check Python ───────────────────────────────────────────────────────────────
if ! command -v python3 &>/dev/null; then
    echo "[ERROR] python3 not found. Install Python 3.10+"
    exit 1
fi

PYVER=$(python3 --version 2>&1 | awk '{print $2}')
echo "[INFO]  Python $PYVER detected"

# ── Create venv ───────────────────────────────────────────────────────────────
if [ ! -d "$ROOT/.venv" ]; then
    echo "[INFO]  Creating virtual environment..."
    python3 -m venv "$ROOT/.venv"
fi

source "$ROOT/.venv/bin/activate"

# ── Install backend dependencies ───────────────────────────────────────────────
echo "[INFO]  Installing backend dependencies..."
pip install -q -r "$ROOT/backend/requirements.txt"

# ── Check npm ─────────────────────────────────────────────────────────────────
if ! command -v npm &>/dev/null; then
    echo "[ERROR] npm not found. Install Node.js from https://nodejs.org"
    exit 1
fi

# ── Install frontend dependencies ──────────────────────────────────────────────
echo "[INFO]  Installing frontend dependencies..."
cd "$ROOT/frontend" && npm install --silent
cd "$ROOT"

# ── Start backend ─────────────────────────────────────────────────────────────
echo "[INFO]  Starting FastAPI backend on http://localhost:8000 ..."
(source "$ROOT/.venv/bin/activate" && uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000) &
BACKEND_PID=$!

sleep 2

# ── Start frontend ────────────────────────────────────────────────────────────
echo "[INFO]  Starting frontend on http://localhost:5173 ..."
(cd "$ROOT/frontend" && npm run dev) &
FRONTEND_PID=$!

echo ""
echo "  ✓ Both services launched!"
echo "    Backend:  http://localhost:8000"
echo "    Frontend: http://localhost:5173"
echo ""
echo "  Press Ctrl+C to stop both services."
echo ""

# Wait and cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'" INT TERM
wait
