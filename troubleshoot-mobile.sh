#!/bin/bash
# Quick troubleshooting script for mobile connection issues

echo "🔍 Troubleshooting mobile connection..."
echo ""

# Check current IP
echo "📡 Current IP Address:"
CURRENT_IP=$(ip addr show wlo1 | grep "inet " | awk '{print $2}' | cut -d/ -f1)
echo "   $CURRENT_IP"
echo ""

# Check if servers are running
echo "🖥️  Server Status:"
DJANGO_RUNNING=$(ps aux | grep "manage.py runserver" | grep -v grep | wc -l)
VITE_RUNNING=$(ps aux | grep "node.*vite" | grep -v grep | wc -l)
NGINX_RUNNING=$(ps aux | grep "nginx.*master" | grep -v grep | wc -l)

if [ $DJANGO_RUNNING -gt 0 ]; then
    echo "   ✅ Django is running"
else
    echo "   ❌ Django is NOT running"
fi

if [ $VITE_RUNNING -gt 0 ]; then
    echo "   ✅ Vite is running"
else
    echo "   ❌ Vite is NOT running"
fi

if [ $NGINX_RUNNING -gt 0 ]; then
    echo "   ✅ Nginx is running"
else
    echo "   ❌ Nginx is NOT running"
fi
echo ""

# Check if IP in nginx config matches current IP
echo "🔧 Nginx Configuration:"
NGINX_IP=$(grep "server_name" nginx-https.conf | grep -oE "192\.168\.[0-9]+\.[0-9]+" | head -1)
if [ "$NGINX_IP" == "$CURRENT_IP" ]; then
    echo "   ✅ Nginx IP matches current IP ($NGINX_IP)"
else
    echo "   ⚠️  WARNING: Nginx IP ($NGINX_IP) doesn't match current IP ($CURRENT_IP)"
    echo "   Run: sed -i 's/$NGINX_IP/$CURRENT_IP/g' nginx-https.conf"
    echo "   Then: sudo cp nginx-https.conf /etc/nginx/sites-available/faydo-https && sudo systemctl restart nginx"
fi
echo ""

# Test localhost
echo "🧪 Testing localhost connection:"
if curl -k https://localhost/api/accounts/users/ -I --max-time 3 > /dev/null 2>&1; then
    echo "   ✅ Localhost works"
else
    echo "   ❌ Localhost connection failed"
fi
echo ""

# Test network IP
echo "🧪 Testing network IP connection:"
if curl -k https://$CURRENT_IP/api/accounts/users/ -I --max-time 3 > /dev/null 2>&1; then
    echo "   ✅ Network IP ($CURRENT_IP) works"
else
    echo "   ❌ Network IP connection failed"
fi
echo ""

# Summary
echo "📱 Mobile Connection Instructions:"
echo "   1. On your phone, connect to the same WiFi"
echo "   2. Go to: https://$CURRENT_IP"
echo "   3. Accept SSL certificate warning"
echo "   4. If still not working:"
echo "      - Toggle Airplane mode ON then OFF"
echo "      - Clear browser cache (Settings > Safari/Chrome > Clear Data)"
echo "      - Close browser completely and reopen"
echo ""

# Quick actions
echo "🚀 Quick Actions:"
echo "   Restart all servers: ./stop-https.sh && ./start-https.sh"
echo "   Set static IP: ./set-static-ip.sh"
echo "   Revert to DHCP: ./set-dhcp-ip.sh"
echo ""
