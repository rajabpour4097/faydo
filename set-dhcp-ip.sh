#!/bin/bash
# Script to revert to DHCP (automatic IP)
# Save as: set-dhcp-ip.sh

echo "📡 Reverting to DHCP (automatic IP)..."

# Get current connection name
CONNECTION=$(nmcli -t -f NAME connection show --active | grep -i wifi | head -1)

if [ -z "$CONNECTION" ]; then
    echo "❌ No active WiFi connection found"
    exit 1
fi

echo "Current connection: $CONNECTION"
echo ""

# Set to DHCP
sudo nmcli connection modify "$CONNECTION" ipv4.method auto

# Restart connection
sudo nmcli connection down "$CONNECTION"
sudo nmcli connection up "$CONNECTION"

echo ""
echo "✅ DHCP enabled successfully!"
echo "Your IP will be assigned automatically"
echo ""
echo "Current IP:"
ip addr show wlo1 | grep "inet " | awk '{print $2}'
