# 📱 Parking Ticketing Mobile App - Setup Guide

## 🎯 Overview
This guide will help you build, test, and deploy the Parking Ticketing System as an Android APK with Bluetooth thermal printer support (PT-210).

---

## ✅ Prerequisites

### Required Software:
1. **Node.js** (v18+) - Already installed ✓
2. **Composer** (PHP 8.2+) - Already installed ✓
3. **Android Studio** - [Download here]     
4. **Java Development Kit (JDK 17)** - Installed with Android Studio

### Hardware:
- PT-210 Bluetooth Thermal Printer (58mm)
- Android device (API 24+) or Emulator

---

## 🚀 Quick Start

### 1. Build the Application

```powershell
# Install dependencies (if not done)
npm install
composer install

# Build frontend assets
npm run build

# Sync with Capacitor
npx cap sync android
```

### 2. Configure for Development

#### Option A: Test with Real Device + Local Laravel Server

1. Start Laravel server:
```powershell
php artisan serve --host=0.0.0.0
```

2. Find your local IP address:
```powershell
ipconfig
# Look for "IPv4 Address" under your WiFi adapter
# Example: 192.168.1.100
```

3. Update `capacitor.config.ts`:
```typescript
server: {
  url: 'http://192.168.1.100:8000',  // Replace with your IP
  cleartext: true
}
```

4. Rebuild:
```powershell
npx cap sync android
```

#### Option B: Test with Production Build

Keep the default config (no server URL) to use compiled assets.

---

## 🧪 Testing in Android Studio Emulator

### Setup Emulator:

1. **Open Android Studio**
   ```
   File → Open → Select 'android' folder in your project
   ```

2. **Create Virtual Device**
   - Tools → Device Manager → Create Device
   - Select: Pixel 6 Pro
   - System Image: Android 13 (API 33) or higher
   - Click "Finish"

3. **Start Emulator**
   - Click ▶️ Play button in Device Manager
   - Wait for emulator to boot

4. **Run App**
   ```
   Click "Run" (▶️) in Android Studio toolbar
   OR
   ```
   ```powershell
   npx cap run android
   ```

### ⚠️ Emulator Limitations:
- ❌ **Bluetooth NOT available** in emulator
- ✓ Test all other features (login, tickets, payments, UI)
- ✓ Check network connectivity to Laravel API
- ✓ Verify navigation and layouts

---

## 📱 Testing on Real Android Device

### 1. Enable Developer Mode:
1. Go to **Settings** → **About Phone**
2. Tap **Build Number** 7 times
3. Developer options enabled!

### 2. Enable USB Debugging:
1. Go to **Settings** → **Developer Options**
2. Enable **USB Debugging**
3. Enable **Install via USB**

### 3. Connect Device:
1. Connect phone via USB cable
2. Allow "USB Debugging" popup on phone
3. Verify connection:
```powershell
adb devices
# Should show: <device-id>   device
```

### 4. Install App:
```powershell
# Deploy to connected device
npx cap run android --target=<your-device-id>

# OR build APK and install manually
cd android
./gradlew assembleDebug
# APK location: android/app/build/outputs/apk/debug/app-debug.apk
```

### 5. Install APK Manually:
```powershell
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🖨️ Testing Bluetooth Printer (PT-210)

### Printer Setup:
1. **Turn on PT-210 printer**
2. **Enter pairing mode:**
   - Press and hold power button
   - Blue LED should blink rapidly
3. **Load thermal paper** (58mm)

### In the App:
1. **Login** to the app
2. **Create a ticket** and process payment
3. On **Receipt page**, you'll see "Bluetooth Printer" section
4. **Tap "Connect to PT-210"**
   - App will scan for Bluetooth devices
   - Select your PT-210 from the list
5. **Tap "Test Print"** first
   - Should print: "TEST PRINT / PT-210 Printer / Connection successful!"
6. **Tap "Print Receipt"**
   - Full parking receipt will print

### Troubleshooting:
- **Can't find printer**: Make sure printer is in pairing mode (blue LED blinking)
- **Connection fails**: Turn printer off and on, try again
- **Partial print**: Check paper roll, ensure it's thermal paper
- **No print**: Check battery, try test print first

---

## 🔧 Common Issues & Solutions

### Issue: "Web assets directory must contain index.html"
**Solution:**
```powershell
# Make sure you built first
npm run build
npx cap sync android
```

### Issue: "Cannot connect to Laravel API"
**Solution:**
- Check `capacitor.config.ts` has correct server URL
- Ensure phone and computer are on same WiFi
- Laravel server running: `php artisan serve --host=0.0.0.0`
- Check Windows Firewall allows port 8000

### Issue: "Bluetooth permission denied"
**Solution:**
- Go to Android Settings → Apps → Parking Ticketing → Permissions
- Enable "Nearby devices" or "Bluetooth"
- Enable "Location" (required for Bluetooth scanning on Android)

### Issue: App crashes on startup
**Solution:**
```powershell
# Check logs
adb logcat | grep -i "capacitor"

# Clear app data
adb shell pm clear com.lanaodelnorte.parking

# Reinstall
npx cap sync android
npx cap run android
```

---

## 📦 Building Production APK

### Debug APK (for testing):
```powershell
cd android
./gradlew assembleDebug
# Output: android/app/build/outputs/apk/debug/app-debug.apk
```

### Release APK (for distribution):

1. **Generate Keystore:**
```powershell
keytool -genkey -v -keystore parking-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias parking-key
```

2. **Update `android/app/build.gradle`:**
```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file('../../parking-release-key.jks')
            storePassword 'your-password'
            keyAlias 'parking-key'
            keyPassword 'your-password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

3. **Build:**
```powershell
cd android
./gradlew assembleRelease
# Output: android/app/build/outputs/apk/release/app-release.apk
```

4. **Install:**
```powershell
adb install android/app/build/outputs/apk/release/app-release.apk
```

---

## 🔄 Development Workflow

### Making Changes:

1. **Edit code** in `resources/js/`
2. **Build:**
   ```powershell
   npm run build
   ```
3. **Sync:**
   ```powershell
   npx cap sync android
   ```
4. **Run:**
   ```powershell
   npx cap run android
   ```

### Hot Reload Development:

1. **Start dev server:**
   ```powershell
   npm run dev
   ```

2. **Update capacitor.config.ts:**
   ```typescript
   server: {
     url: 'http://192.168.1.100:5173',  // Vite dev server
     cleartext: true
   }
   ```

3. **Sync and run:**
   ```powershell
   npx cap sync android
   npx cap run android
   ```

Now changes update automatically! 🔥

---

## 📊 App Features Checklist

### ✅ Core Features:
- [x] PWA installable
- [x] Capacitor Android wrapper
- [x] Bluetooth printer support (PT-210)
- [x] ESC/POS receipt printing
- [x] QR code generation on receipts
- [x] Offline capability (PWA)
- [x] Material design UI
- [x] Dark mode support

### ✅ Tested On:
- [ ] Android Emulator (API 33)
- [ ] Real Android device
- [ ] PT-210 Bluetooth printer
- [ ] Local Laravel API
- [ ] Production Laravel API

---

## 📝 Notes

### PT-210 Printer Specs:
- **Paper Width:** 58mm
- **Characters per line:** ~32 (normal size)
- **Connection:** Bluetooth 4.0
- **Battery:** 1500mAh rechargeable
- **Printing method:** Thermal (no ink needed)

### Bluetooth UUIDs Used:
- Service: `000018f0-0000-1000-8000-00805f9b34fb`
- Write: `00002af1-0000-1000-8000-00805f9b34fb`

### Support:
For issues, check:
1. Android Studio Logcat
2. Chrome DevTools (chrome://inspect)
3. Laravel logs
4. Browser console

---

## 🎉 Success Criteria

You've successfully set up the mobile app when:
1. ✅ App installs on Android device
2. ✅ Can login and access all features
3. ✅ Can connect to PT-210 printer
4. ✅ Can print test receipt
5. ✅ Can print full parking receipts
6. ✅ App works offline (basic PWA features)

---

## 📞 Next Steps

1. **Test thoroughly** on real device with printer
2. **Generate release APK** with proper signing
3. **Upload to Google Play Store** (optional)
4. **Train staff** on using the mobile app
5. **Monitor** for issues and feedback

Happy coding! 🚀
