#!/bin/bash

# ===========================================
# Faydo Docker Setup Script
# Creates SSL certificates and starts services
# ===========================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Faydo Docker Setup Script${NC}"
echo -e "${BLUE}========================================${NC}"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Docker installation
if ! command_exists docker; then
    echo -e "${RED}Error: Docker is not installed.${NC}"
    echo "Please install Docker first: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check Docker Compose
if ! command_exists docker-compose && ! docker compose version >/dev/null 2>&1; then
    echo -e "${RED}Error: Docker Compose is not installed.${NC}"
    echo "Please install Docker Compose first."
    exit 1
fi

# Use docker compose v2 if available, otherwise docker-compose
if docker compose version >/dev/null 2>&1; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

echo -e "${GREEN}✓ Docker and Docker Compose are installed${NC}"

# Create SSL directory
SSL_DIR="$SCRIPT_DIR/docker/nginx/ssl"
mkdir -p "$SSL_DIR"

# Generate self-signed SSL certificate if not exists
if [ ! -f "$SSL_DIR/cert.pem" ] || [ ! -f "$SSL_DIR/key.pem" ]; then
    echo -e "${YELLOW}Generating self-signed SSL certificate...${NC}"
    
    # Get server IP or hostname
    read -p "Enter your server IP or domain (default: localhost): " SERVER_NAME
    SERVER_NAME=${SERVER_NAME:-localhost}
    
    # Generate SSL certificate
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$SSL_DIR/key.pem" \
        -out "$SSL_DIR/cert.pem" \
        -subj "/C=IR/ST=Tehran/L=Tehran/O=Faydo/CN=$SERVER_NAME" \
        -addext "subjectAltName=DNS:$SERVER_NAME,DNS:localhost,IP:127.0.0.1,IP:$SERVER_NAME" 2>/dev/null || \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$SSL_DIR/key.pem" \
        -out "$SSL_DIR/cert.pem" \
        -subj "/C=IR/ST=Tehran/L=Tehran/O=Faydo/CN=$SERVER_NAME"
    
    echo -e "${GREEN}✓ SSL certificate generated${NC}"
else
    echo -e "${GREEN}✓ SSL certificate already exists${NC}"
fi

# Create .env file if not exists
if [ ! -f "$SCRIPT_DIR/.env" ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    
    # Generate random secret key
    SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(50))" 2>/dev/null || \
                 openssl rand -base64 50 | tr -d '\n=' | head -c 50)
    
    cat > "$SCRIPT_DIR/.env" << EOF
# Faydo Environment Variables
# Generated on $(date)

# Django Settings
SECRET_KEY=$SECRET_KEY
DEBUG=False
ALLOWED_HOSTS=*

# Database (SQLite by default)
DATABASE_URL=sqlite:///db.sqlite3

# Server Configuration
SERVER_PORT=9000
EOF
    
    echo -e "${GREEN}✓ .env file created${NC}"
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

# Ensure database file exists and has correct permissions
if [ ! -f "$SCRIPT_DIR/backend/db.sqlite3" ]; then
    touch "$SCRIPT_DIR/backend/db.sqlite3"
fi
chmod 666 "$SCRIPT_DIR/backend/db.sqlite3"

echo ""
echo -e "${BLUE}Building Docker images...${NC}"
$DOCKER_COMPOSE build

echo ""
echo -e "${BLUE}Starting services...${NC}"
$DOCKER_COMPOSE up -d

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Faydo is now running!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Access the application at:"
echo -e "  ${BLUE}HTTPS:${NC} https://YOUR_SERVER_IP:9000"
echo -e "  ${BLUE}HTTP:${NC}  http://YOUR_SERVER_IP:9080 (redirects to HTTPS)"
echo ""
echo -e "${YELLOW}Note:${NC} Since we're using a self-signed certificate,"
echo -e "      you'll need to accept the security warning in your browser."
echo ""
echo -e "To view logs: ${BLUE}$DOCKER_COMPOSE logs -f${NC}"
echo -e "To stop:      ${BLUE}$DOCKER_COMPOSE down${NC}"
echo -e "To restart:   ${BLUE}$DOCKER_COMPOSE restart${NC}"
echo ""
