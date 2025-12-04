# 🚀 QUICK TEST GUIDE - Bluetooth Thermal Printer

## ✅ DATABASE SETUP - COMPLETED!
- ✅ Migrations created (tickets, payments, rate_settings)
- ✅ Database tables exist
- ✅ Rate settings configured

## 📱 STEP 1: START LARAVEL SERVER

Open PowerShell and run:
```powershell
php artisan serve --host=0.0.0.0 --port=8000
```

**Keep this terminal running!** Your mobile app will connect to: `http://192.168.0.36:8000`

---

## 🔨 STEP 2: BUILD & SYNC ANDROID APP

In another PowerShell terminal:
```powershell
npm run build
npx cap sync android
```

---

## 📲 STEP 3: INSTALL ON ANDROID DEVICE

### Option A: Run directly (if device is connected via USB)
```powershell
npx cap run android
```

### Option B: Build APK and install manually
```powershell
cd android
./gradlew assembleDebug
adb install app/build/outputs/apk/debug/app-debug.apk
```

---

## 🖨️ STEP 4: TEST BLUETOOTH PRINTER

### Before opening the app:
1. **Turn on your thermal printer**
2. **Put it in pairing mode** (usually hold power button)
3. **Blue LED should blink** (discoverable mode)
4. **Keep phone and printer close** (within 10 meters)

### In the app:
1. **Login** (or register if first time)
2. **Create a new ticket:**
   - Enter plate number (e.g., ABC-1234)
   - Select parking zone
   - Choose rate type (try "Flat Rate" for quick test)
   - Take photo (optional)
   - Submit

3. **Process payment:**
   - Select payment method (Cash/GCash/Card)
   - Tap "Pay Now"

4. **On Receipt page:**
   - You'll see "Bluetooth Printer" section
   - Tap **"Connect to PT-210"** button
   - Select your printer from the list
   - Tap **"Test Print"** (prints test message)
   - Tap **"Print Receipt"** (prints full receipt)

---

## 🔍 TROUBLESHOOTING

### App can't connect to server?
- Make sure Laravel server is running on port 8000
- Check your phone is on same WiFi network as computer
- Verify IP address: `ipconfig` shows `192.168.0.36`
- Try accessing `http://192.168.0.36:8000` in phone browser

### Bluetooth won't connect?
- Grant Bluetooth permissions when app asks
- Make sure printer is in pairing mode (blue LED blinking)
- Try turning printer off and on
- Check printer battery is charged

### App crashes?
```powershell
# View Android logs
adb logcat | Select-String "Capacitor"
```

---

## 📊 WHAT TO TEST

- ✅ Login functionality
- ✅ Create ticket with photo
- ✅ Payment processing
- ✅ Receipt display
- ✅ Bluetooth printer connection
- ✅ Test print
- ✅ Full receipt printing
- ✅ QR code on receipt
- ✅ View ticket history

---

## 🎯 NEXT COMMANDS TO RUN

```powershell
# Terminal 1 (Laravel Server)
php artisan serve --host=0.0.0.0 --port=8000

# Terminal 2 (Build & Deploy)
npm run build
npx cap sync android
npx cap run android
```

---

**Your Local Network IP:** `192.168.0.36`
**Laravel Server:** `http://192.168.0.36:8000`
**App ID:** `com.lanaodelnorte.parking`

---

Good luck! 🎉
