# 🚀 Quick Start - Android APK with Bluetooth Printing

## One-Time Setup
```powershell
# 1. Install dependencies
npm install
composer install

# 2. Build app
npm run build

# 3. Initialize Android
npx cap sync android
```

## Testing on Emulator
```powershell
# Start Android Studio
# Open: android folder
# Click Run ▶️

# OR via command line:
npx cap run android
```

## Testing on Real Device
```powershell
# 1. Enable Developer Mode & USB Debugging on phone
# 2. Connect USB cable
# 3. Check connection
adb devices

# 4. Install app
npx cap run android
```

## Development Mode (Live Reload)
```powershell
# 1. Start servers
composer dev    # Laravel + Vite (or npm run dev separately)

# 2. Get your local IP
ipconfig        # Look for IPv4 Address (e.g., 192.168.1.100)

# 3. Edit capacitor.config.ts:
server: {
  url: 'http://192.168.1.100:8000',
  cleartext: true
}

# 4. Sync and run
npx cap sync android
npx cap run android
```

## After Code Changes
```powershell
npm run build
npx cap sync android
# App will reload automatically
```

## Bluetooth Printer Test
1. Turn on PT-210 printer (blue LED blinking)
2. Open app → Login
3. Create ticket → Process payment
4. On receipt page → "Connect to PT-210"
5. Select printer from list
6. Tap "Test Print"
7. Tap "Print Receipt"

## Build APK for Distribution
```powershell
cd android
./gradlew assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk

# Install manually:
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

## Troubleshooting
```powershell
# Can't connect to Laravel API?
php artisan serve --host=0.0.0.0
# Update capacitor.config.ts with correct IP

# App crashes?
adb logcat | grep Capacitor

# Clear app data
adb shell pm clear com.lanaodelnorte.parking
```

## PT-210 Printer Setup
- Paper: 58mm thermal paper
- Pairing mode: Hold power button (blue LED blinks)
- Battery: Charge before use (USB-C)
- Range: ~10 meters

## File Structure
```
resources/js/
├── services/printer.service.ts    # Bluetooth printer logic
├── hooks/use-printer.ts            # React hook for printing
└── pages/tickets/receipt.tsx       # Receipt page with BT buttons

android/                             # Android project folder
capacitor.config.ts                  # App configuration
```

---

For detailed guide, see: **MOBILE_SETUP.md**
