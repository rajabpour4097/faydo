# 📱 حل مشکل نوسان اتصال موبایل

## ❌ مشکل
گاهی موبایل به `https://192.168.70.102` وصل می‌شود، گاهی نه!

## 🔍 علت‌های نوسان

### 1. SSL Certificate Cache
موبایل certificate را cache می‌کند. وقتی:
- Server restart می‌شود
- Nginx restart می‌شود
- IP تغییر می‌کند

Certificate قدیمی invalid می‌شود اما موبایل آن را cache دارد.

### 2. DNS/IP Cache
موبایل IP قدیمی را cache کرده و به آن سعی می‌کند متصل شود.

### 3. WiFi Sleep/Power Saving
وقتی موبایل idle است، WiFi به حالت sleep می‌رود و connection drop می‌شود.

### 4. DHCP IP Change
Router ممکن است IP جدیدی به لپتاپ بدهد.

### 5. Browser Cache/Cookies
مرورگر موبایل state قدیمی را cache کرده است.

## ✅ راه‌حل فوری (هر بار که مشکل دارید)

### روی موبایل:

#### گام 1: پاک کردن SSL Cache
**iOS Safari:**
```
Settings > Safari > Clear History and Website Data
```

**Android Chrome:**
```
Settings > Privacy > Clear browsing data
- Cached images and files ✓
- Site settings ✓
```

#### گام 2: Airplane Mode Toggle
```
1. Airplane mode را ON کنید
2. 5 ثانیه صبر کنید
3. Airplane mode را OFF کنید
4. منتظر بمانید WiFi وصل شود
```

#### گام 3: Forget WiFi & Reconnect
```
1. Settings > WiFi
2. روی نام WiFi بزنید
3. "Forget This Network" بزنید
4. دوباره وصل شوید
```

#### گام 4: مرورگر را کاملاً ببندید
```
1. از app switcher مرورگر را swipe کنید و ببندید
2. 5 ثانیه صبر کنید
3. مرورگر را دوباره باز کنید
```

## 🔧 راه‌حل دائمی

### 1. استفاده از Static IP برای لپتاپ

در لپتاپ (Ubuntu):

<function_calls>
<invoke name="create_file">
<parameter name="content">#!/bin/bash
# Script to set static IP for development
# Save as: set-static-ip.sh

echo "📡 Setting static IP for WiFi interface..."

# Get current connection name
CONNECTION=$(nmcli -t -f NAME connection show --active | grep -i wifi | head -1)

if [ -z "$CONNECTION" ]; then
    echo "❌ No active WiFi connection found"
    exit 1
fi

echo "Current connection: $CONNECTION"
echo ""
echo "Setting static IP: 192.168.70.100"
echo "Gateway: 192.168.70.1"
echo "DNS: 8.8.8.8, 8.8.4.4"
echo ""

# Set static IP
sudo nmcli connection modify "$CONNECTION" \
    ipv4.method manual \
    ipv4.addresses 192.168.70.100/24 \
    ipv4.gateway 192.168.70.1 \
    ipv4.dns "8.8.8.8 8.8.4.4"

# Restart connection
sudo nmcli connection down "$CONNECTION"
sudo nmcli connection up "$CONNECTION"

echo ""
echo "✅ Static IP set successfully!"
echo "New IP: 192.168.70.100"
echo ""
echo "⚠️  You need to update nginx-https.conf with new IP:"
echo "   192.168.70.102 → 192.168.70.100"
