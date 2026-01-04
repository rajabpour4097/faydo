#!/bin/bash

# ===========================================
# Faydo Docker Control Script
# Start, stop, restart, and manage services
# ===========================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Docker Compose command
if docker compose version >/dev/null 2>&1; then
    DC="docker compose"
else
    DC="docker-compose"
fi

# Help function
show_help() {
    echo -e "${BLUE}Faydo Docker Control Script${NC}"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  start       Start all services"
    echo "  stop        Stop all services"
    echo "  restart     Restart all services"
    echo "  rebuild     Rebuild and restart services"
    echo "  logs        Show live logs"
    echo "  status      Show service status"
    echo "  shell-backend   Open shell in backend container"
    echo "  shell-frontend  Open shell in frontend container"
    echo "  migrate     Run Django migrations"
    echo "  createsuperuser Create Django superuser"
    echo "  backup      Backup database"
    echo "  clean       Remove all containers and images"
    echo "  help        Show this help"
    echo ""
}

# Commands
case "$1" in
    start)
        echo -e "${GREEN}Starting Faydo services...${NC}"
        $DC up -d
        echo -e "${GREEN}Services started!${NC}"
        $DC ps
        ;;
    
    stop)
        echo -e "${YELLOW}Stopping Faydo services...${NC}"
        $DC down
        echo -e "${GREEN}Services stopped!${NC}"
        ;;
    
    restart)
        echo -e "${YELLOW}Restarting Faydo services...${NC}"
        $DC restart
        echo -e "${GREEN}Services restarted!${NC}"
        $DC ps
        ;;
    
    rebuild)
        echo -e "${YELLOW}Rebuilding Faydo services...${NC}"
        $DC down
        $DC build --no-cache
        $DC up -d
        echo -e "${GREEN}Services rebuilt and started!${NC}"
        $DC ps
        ;;
    
    logs)
        echo -e "${BLUE}Showing logs (Ctrl+C to exit)...${NC}"
        $DC logs -f
        ;;
    
    status)
        echo -e "${BLUE}Service Status:${NC}"
        $DC ps
        echo ""
        echo -e "${BLUE}Resource Usage:${NC}"
        docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" \
            $(docker ps --format '{{.Names}}' | grep faydo) 2>/dev/null || echo "No containers running"
        ;;
    
    shell-backend)
        echo -e "${BLUE}Opening shell in backend container...${NC}"
        docker exec -it faydo-backend /bin/bash || docker exec -it faydo-backend /bin/sh
        ;;
    
    shell-frontend)
        echo -e "${BLUE}Opening shell in frontend container...${NC}"
        docker exec -it faydo-frontend /bin/sh
        ;;
    
    migrate)
        echo -e "${BLUE}Running Django migrations...${NC}"
        docker exec -it faydo-backend python manage.py makemigrations
        docker exec -it faydo-backend python manage.py migrate
        echo -e "${GREEN}Migrations completed!${NC}"
        ;;
    
    createsuperuser)
        echo -e "${BLUE}Creating Django superuser...${NC}"
        docker exec -it faydo-backend python manage.py createsuperuser
        ;;
    
    backup)
        BACKUP_DIR="$SCRIPT_DIR/backups"
        mkdir -p "$BACKUP_DIR"
        BACKUP_FILE="$BACKUP_DIR/db_backup_$(date +%Y%m%d_%H%M%S).sqlite3"
        echo -e "${BLUE}Backing up database...${NC}"
        cp "$SCRIPT_DIR/backend/db.sqlite3" "$BACKUP_FILE"
        echo -e "${GREEN}Database backed up to: $BACKUP_FILE${NC}"
        ;;
    
    clean)
        echo -e "${RED}WARNING: This will remove all Faydo containers, images, and volumes!${NC}"
        read -p "Are you sure? (y/N): " confirm
        if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
            $DC down -v --rmi all
            echo -e "${GREEN}Cleanup completed!${NC}"
        else
            echo "Cancelled."
        fi
        ;;
    
    help|--help|-h|"")
        show_help
        ;;
    
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        show_help
        exit 1
        ;;
esac
