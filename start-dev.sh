#!/bin/bash

# ============================================
# ComfyUI Wrapper - Linux Dev Launcher
# ============================================

BACKEND_PORT=8000
FRONTEND_PORT=3300

echo "🚀 Starting ComfyUI Wrapper Development Environment..."

# Function to kill process on port
kill_port() {
    local port=$1
    local pid=$(lsof -t -i:$port)
    if [ -n "$pid" ]; then
        echo "⚠️  Port $port is busy (PID: $pid). Killing..."
        kill -9 $pid
        sleep 1
        echo "✅ Process killed on port $port."
    fi
}

# Kill existing processes
kill_port $BACKEND_PORT
kill_port $FRONTEND_PORT

# Start Backend
echo "[1/2] Starting Backend (FastAPI) on port $BACKEND_PORT..."
cd backend
source venv/bin/activate 2>/dev/null || echo "No venv found, using system python"
# Run with loguru and debug
export LOGURU_LEVEL=DEBUG
python3 -m uvicorn main:app --reload --host 0.0.0.0 --port $BACKEND_PORT --log-level debug &
BACKEND_PID=$!

# Start Frontend
echo "[2/2] Starting Frontend (Next.js) on port $FRONTEND_PORT..."
cd ../webapp
PORT=$FRONTEND_PORT npm run dev &
FRONTEND_PID=$!

echo ""
echo "✨ Servery wystartowały!"
echo "Frontend: http://localhost:$FRONTEND_PORT"
echo "Backend:  http://localhost:$BACKEND_PORT"
echo ""

# Handle cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID; echo 'Stopping servers...'; exit" INT TERM

wait
