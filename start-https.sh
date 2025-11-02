#!/bin/bash

# Script to run Faydo project with HTTPS
# راه‌اندازی پروژه Faydo با HTTPS

echo "🚀 Starting Faydo project with HTTPS..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Project directory
PROJECT_DIR="/home/mohammad/project/test/django/Faydo/faydo"

# Check if Nginx is running
if ! systemctl is-active --quiet nginx; then
    echo -e "${YELLOW}⚠️  Nginx is not running. Starting Nginx...${NC}"
    sudo systemctl start nginx
fi

# Check Nginx status
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx is running${NC}"
else
    echo -e "${YELLOW}❌ Failed to start Nginx${NC}"
    exit 1
fi

# Start Backend (Django)
echo -e "${BLUE}🔧 Starting Django backend on port 8000...${NC}"
cd "$PROJECT_DIR/backend"

# Activate virtual environment if exists
if [ -d "venv" ]; then
    source venv/bin/activate
elif [ -d "../venv" ]; then
    source ../venv/bin/activate
fi

# Run Django in background
python3 manage.py runserver 8001 > /tmp/django.log 2>&1 &
DJANGO_PID=$!
echo -e "${GREEN}✅ Django started (PID: $DJANGO_PID)${NC}"

# Start Frontend (Vite)
echo -e "${BLUE}🎨 Starting Vite frontend on port 5173...${NC}"
cd "$PROJECT_DIR/frontend"
npm run dev > /tmp/vite.log 2>&1 &
VITE_PID=$!
echo -e "${GREEN}✅ Vite started (PID: $VITE_PID)${NC}"

# Wait a moment for servers to start
sleep 3

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Faydo is running with HTTPS!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📱 Frontend:${NC} https://localhost"
echo -e "${BLUE}🔧 Backend API:${NC} https://localhost/api"
echo -e "${BLUE}👨‍💼 Django Admin:${NC} https://localhost/admin"
echo ""
echo -e "${YELLOW}⚠️  Note: You'll see a security warning in browser${NC}"
echo -e "${YELLOW}   Click 'Advanced' and 'Proceed to localhost'${NC}"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Process IDs:"
echo "  Django PID: $DJANGO_PID"
echo "  Vite PID: $VITE_PID"
echo ""
echo "To stop servers:"
echo "  kill $DJANGO_PID $VITE_PID"
echo ""
echo "To view logs:"
echo "  Django: tail -f /tmp/django.log"
echo "  Vite: tail -f /tmp/vite.log"
echo "  Nginx: sudo tail -f /var/log/nginx/faydo-error.log"
echo ""

# Save PIDs to file for easy cleanup
echo "$DJANGO_PID" > /tmp/faydo_django.pid
echo "$VITE_PID" > /tmp/faydo_vite.pid

# Keep script running
echo "Press Ctrl+C to stop all servers"
trap "kill $DJANGO_PID $VITE_PID 2>/dev/null; echo 'Servers stopped'; exit 0" INT TERM

# Wait for processes
wait
