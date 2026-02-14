#!/bin/bash
# ============================================
# ComfyUI Wrapper - RESTART & RUN SCRIPT
# ============================================

BACKEND_PORT=8000
FRONTEND_PORT=3300
PROJECT_ROOT="/root/APLIKACJE/COMFY-UI-WRAPER"

echo "🔄 Initiating System Restart..."

kill_port() {
    local port=$1
    echo "Checking port $port..."
    local pid=$(lsof -t -i:$port)
    if [ -z "$pid" ]; then
        pid=$(ss -tlpn "sport = :$port" | grep -oP 'pid=\K\d+')
    fi

    if [ -n "$pid" ]; then
        echo "🛑 Closing process (PID: $pid) on port $port..."
        kill -9 $pid 2>/dev/null
        sleep 2
    fi
}

# Kill anything that might be running
kill_port $BACKEND_PORT
kill_port $FRONTEND_PORT
pkill -f "uvicorn main:app"
pkill -f "next dev"

# Ensure log files exist and are truncated
> $PROJECT_ROOT/backend_dev.log
> $PROJECT_ROOT/frontend_dev.log

# 1. Start Backend
echo "🚀 [1/2] Starting Backend (FastAPI) at port $BACKEND_PORT..."
cd $PROJECT_ROOT/backend
export LOGURU_LEVEL=DEBUG
nohup ./venv/bin/python3 -m uvicorn main:app --host 0.0.0.0 --port $BACKEND_PORT --log-level debug >> $PROJECT_ROOT/backend_dev.log 2>&1 &
BACKEND_PID=$!

# 2. Start Frontend
echo "🚀 [2/2] Starting Frontend (Next.js) at port $FRONTEND_PORT..."
cd $PROJECT_ROOT/webapp
nohup npm run dev -- -p $FRONTEND_PORT >> $PROJECT_ROOT/frontend_dev.log 2>&1 &
FRONTEND_PID=$!

echo ""
echo "✨ SYSTEM RESTARTED SUCCESSFULLY"
echo "────────────────────────────────────"
echo "🖥️  Frontend: http://localhost:$FRONTEND_PORT"
echo "⚙️  Backend:  http://localhost:$BACKEND_PORT"
echo "────────────────────────────────────"
