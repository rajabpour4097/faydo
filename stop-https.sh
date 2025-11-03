#!/bin/bash

# Script to stop Faydo servers
# توقف سرورهای Faydo

echo "🛑 Stopping Faydo servers..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Kill Django
if [ -f /tmp/faydo_django.pid ]; then
    DJANGO_PID=$(cat /tmp/faydo_django.pid)
    if ps -p $DJANGO_PID > /dev/null; then
        kill $DJANGO_PID
        echo -e "${GREEN}✅ Django stopped (PID: $DJANGO_PID)${NC}"
    fi
    rm /tmp/faydo_django.pid
fi

# Kill Vite
if [ -f /tmp/faydo_vite.pid ]; then
    VITE_PID=$(cat /tmp/faydo_vite.pid)
    if ps -p $VITE_PID > /dev/null; then
        kill $VITE_PID
        echo -e "${GREEN}✅ Vite stopped (PID: $VITE_PID)${NC}"
    fi
    rm /tmp/faydo_vite.pid
fi

# Also kill any remaining processes on these ports
pkill -f "manage.py runserver 8001" 2>/dev/null
pkill -f "vite.*5173" 2>/dev/null

echo -e "${GREEN}✅ All servers stopped${NC}"
