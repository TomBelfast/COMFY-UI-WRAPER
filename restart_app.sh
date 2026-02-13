#!/bin/bash

# ============================================
# ComfyUI Wrapper - RESTART & RUN SCRIPT
# Ten skrypt zapewnia czysty restart zgodnie z zasadami
# ============================================

BACKEND_PORT=8000
FRONTEND_PORT=3300
PROJECT_ROOT="/root/APLIKACJE/COMFY-UI-WRAPER"

echo "🔄 Initiating Cinematic Matrix System Restart..."

kill_port() {
    local port=$1
    local name=$2
    local pid=$(lsof -t -i:$port)
    if [ -n "$pid" ]; then
        echo "🛑 Closing previous $name process (PID: $pid) on port $port..."
        kill -9 $pid
        sleep 1
        echo "✅ Port $port is now clear."
    else
        echo "ℹ️ Port $port was already clear."
    fi
}

# 1. Kill everything
kill_port $BACKEND_PORT "Backend"
kill_port $FRONTEND_PORT "Frontend"

# 2. Start Backend
echo "🚀 [1/2] Starting Backend (FastAPI) at port $BACKEND_PORT..."
cd $PROJECT_ROOT/backend
# Ensure loguru level is set for the process
export LOGURU_LEVEL=DEBUG
./venv/bin/python3 -m uvicorn main:app --reload --host 0.0.0.0 --port $BACKEND_PORT --log-level debug > $PROJECT_ROOT/backend_dev.log 2>&1 &
BACKEND_PID=$!

# 3. Start Frontend
echo "🚀 [2/2] Starting Frontend (Next.js) at port $FRONTEND_PORT..."
cd $PROJECT_ROOT/webapp
PORT=$FRONTEND_PORT npm run dev > $PROJECT_ROOT/frontend_dev.log 2>&1 &
FRONTEND_PID=$!

echo ""
echo "✨ SYSTEM RESTARTED SUCCESSFULLY"
echo "────────────────────────────────────"
echo "🖥️  Frontend: http://localhost:$FRONTEND_PORT"
echo "⚙️  Backend:  http://localhost:$BACKEND_PORT"
echo "📑 Logs: streaming to dashboard..."
echo "────────────────────────────────────"

# Keep script alive to monitor or just exit if backgrounded
echo "Use 'tail -f backend_dev.log' or check the UI for real-time logs."
