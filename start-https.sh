#!/bin/bash

# Script to run Faydo project with HTTPS
# راه‌اندازی پروژه Faydo با HTTPS

echo "🚀 Starting Faydo project with HTTPS..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ─── Project directory ────────────────────────────────────────────────────────
PROJECT_DIR="/home/mohammad/projects/faydo"
echo "Project Directory: $PROJECT_DIR"

if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}❌ Project directory not found: $PROJECT_DIR${NC}"
    exit 1
fi

# ─── Backend ──────────────────────────────────────────────────────────────────
echo -e "${BLUE}🔧 Preparing Django Backend...${NC}"
cd "$PROJECT_DIR/backend"

# Activate virtual environment
if [ -d "$PROJECT_DIR/venv" ]; then
    source "$PROJECT_DIR/venv/bin/activate"
elif [ -d "venv" ]; then
    source venv/bin/activate
fi

# Install requirements
echo "Installing Python requirements..."
pip install --upgrade pip -r "$PROJECT_DIR/requirements.txt" -q

# Run migrations
echo "Running Django migrations..."
python manage.py migrate --no-input

echo -e "${GREEN}✅ Django backend ready${NC}"

# ─── Frontend ─────────────────────────────────────────────────────────────────
echo -e "${BLUE}🎨 Preparing Frontend...${NC}"
cd "$PROJECT_DIR/frontend"

if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install --silent
fi

# Build frontend if dist doesn't exist or is outdated
if [ ! -d "dist" ]; then
    echo "Building frontend..."
    npm run build
fi

echo -e "${GREEN}✅ Frontend ready${NC}"

# ─── Nginx ────────────────────────────────────────────────────────────────────
if ! systemctl is-active --quiet nginx 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Nginx is not running. Starting Nginx...${NC}"
    sudo systemctl start nginx 2>/dev/null
fi

if systemctl is-active --quiet nginx 2>/dev/null; then
    echo -e "${GREEN}✅ Nginx running${NC}"
else
    echo -e "${YELLOW}⚠️  Nginx status unknown (may not be installed or not using systemd)${NC}"
fi

# ─── Kill any previous Django process on port 8001 ───────────────────────────
OLD_PID=$(lsof -ti:8001 2>/dev/null)
if [ -n "$OLD_PID" ]; then
    echo -e "${YELLOW}⚠️  Port 8001 is in use by PID $OLD_PID. Stopping old process...${NC}"
    kill "$OLD_PID" 2>/dev/null
    sleep 2
fi

# ─── Start Django ─────────────────────────────────────────────────────────────
echo -e "${BLUE}🚀 Starting Django...${NC}"
cd "$PROJECT_DIR/backend"

python manage.py runserver 0.0.0.0:8001 > /tmp/django.log 2>&1 &
DJANGO_PID=$!

# Wait for Django to be ready (retry up to 30 seconds)
MAX_WAIT=30
WAITED=0
READY=false

while [ $WAITED -lt $MAX_WAIT ]; do
    sleep 1
    WAITED=$((WAITED + 1))
    
    # Check if process is still alive
    if ! kill -0 "$DJANGO_PID" 2>/dev/null; then
        echo -e "${RED}❌ Django process died unexpectedly${NC}"
        echo "--- Django log ---"
        tail -20 /tmp/django.log
        exit 1
    fi
    
    # Check if Django is responding
    if curl -sf http://localhost:8001/api/ -o /dev/null 2>/dev/null || \
       curl -sf http://localhost:8001/admin/ -o /dev/null 2>/dev/null; then
        READY=true
        break
    fi
    
    # Also accept "started" log line as signal
    if grep -q "Starting development server" /tmp/django.log 2>/dev/null; then
        sleep 1  # one more second for full init
        READY=true
        break
    fi
done

if [ "$READY" = true ]; then
    echo -e "${GREEN}✅ Django started successfully on 0.0.0.0:8001 (PID: $DJANGO_PID)${NC}"
else
    echo -e "${YELLOW}⚠️  Django health check timed out after ${MAX_WAIT}s — process is still running (PID: $DJANGO_PID)${NC}"
    echo "    Check logs: tail -f /tmp/django.log"
fi

# ─── Summary ─────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Faydo is running!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📱 Frontend:${NC}       https://localhost"
echo -e "${BLUE}🔧 Backend API:${NC}    https://localhost/api"
echo -e "${BLUE}👨‍💼 Django Admin:${NC}   https://localhost/admin"
echo ""
echo -e "${YELLOW}⚠️  Note: You may see a browser security warning for self-signed SSL${NC}"
echo -e "${YELLOW}   Click 'Advanced' → 'Proceed to localhost'${NC}"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Process IDs:"
echo "  Django PID: $DJANGO_PID"
echo ""
echo "To stop:"
echo "  kill $DJANGO_PID"
echo ""
echo "To view logs:"
echo "  Django:  tail -f /tmp/django.log"
echo "  Nginx:   sudo tail -f /var/log/nginx/error.log"
echo ""

# Save PID for cleanup
echo "$DJANGO_PID" > /tmp/faydo_django.pid

# Keep script alive; Ctrl+C stops Django
echo "Press Ctrl+C to stop Django..."
trap "kill $DJANGO_PID 2>/dev/null; echo ''; echo 'Django stopped'; exit 0" INT TERM

wait "$DJANGO_PID"
