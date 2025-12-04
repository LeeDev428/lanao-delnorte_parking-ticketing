# 📱 HOW TO INSTALL ON REAL ANDROID PHONE

## ⚠️ IMPORTANT: You MUST use a real Android phone because:
- Android Studio emulator doesn't have real Bluetooth hardware
- Your thermal printer needs Bluetooth to connect
- Camera also works better on real device

---

## 🔧 METHOD 1: BUILD APK & TRANSFER TO PHONE (EASIEST)

### Step 1: Build the APK
In Android Studio (which should be open now):

1. **Wait for Gradle sync to finish** (bottom right corner)
2. **Click:** `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
3. **Wait 2-5 minutes** for build to complete
4. **Click "locate"** in the notification that appears

**APK Location:** `android\app\build\outputs\apk\debug\app-debug.apk`

### Step 2: Transfer APK to Phone

**Option A - USB Cable:**
1. Connect phone to computer with USB cable
2. Copy `app-debug.apk` to phone's `Downloads` folder
3. On phone, open `Files` app → `Downloads`
4. Tap on `app-debug.apk`
5. Allow "Install from unknown sources" if prompted
6. Tap "Install"

**Option B - Share via Email/Drive:**
1. Email the APK to yourself
2. Open email on phone
3. Download APK
4. Tap to install

**Option C - QR Code (if you have web server):**
1. Upload APK to Google Drive/Dropbox
2. Get shareable link
3. Use phone to download and install

---

## 🔧 METHOD 2: USB DEBUGGING (IF YOU HAVE USB CABLE)

### Step 1: Enable Developer Mode on Phone
1. Go to **Settings** → **About Phone**
2. Tap **Build Number** 7 times (until you see "You are now a developer!")
3. Go back to **Settings** → **Developer Options**
4. Enable **USB Debugging**

### Step 2: Connect Phone to Computer
1. Connect phone with USB cable
2. On phone, tap **Allow USB Debugging** when prompted
3. Check connection in PowerShell:
```powershell
# First, find where Android SDK is installed
# Usually in: C:\Users\YourName\AppData\Local\Android\Sdk\platform-tools

cd "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk\platform-tools"
./adb devices
```

If you see your device listed, you're connected!

### Step 3: Install Directly from Android Studio
1. In Android Studio, click **Run** button (green play icon)
2. Select your phone from the list
3. App will install and launch automatically

---

## 🔧 METHOD 3: BUILD USING GRADLE (COMMAND LINE)

If Android Studio is slow or won't build:

```powershell
cd android
./gradlew assembleDebug
```

**APK will be at:** `android\app\build\outputs\apk\debug\app-debug.apk`

Then transfer to phone using Method 1.

---

## 📱 BEFORE TESTING ON PHONE

### 1. Make sure phone is on same WiFi as computer
- Check WiFi name on phone matches your computer's WiFi
- Both should be on `192.168.0.x` network

### 2. Start Laravel Server (if not already running)
```powershell
php artisan serve --host=0.0.0.0 --port=8000
```
Keep this terminal open!

### 3. Test Server Access from Phone
- Open browser on phone
- Go to: `http://192.168.0.36:8000`
- You should see your Laravel welcome page

---

## 🖨️ TESTING WITH BLUETOOTH PRINTER

### 1. Prepare Printer
- Turn on printer
- Hold power button (blue LED should blink)
- Keep printer close to phone (< 10 meters)

### 2. Phone Settings
- Enable Bluetooth on phone
- Don't pair in phone settings (app will handle it)

### 3. In the App
1. **Login** (or register first)
2. **Create ticket:**
   - Plate: ABC-1234
   - Zone: Zone 1
   - Rate: Flat Rate (₱50)
   - Photo: Optional
   - Submit
3. **Pay:**
   - Method: Cash
   - Pay Now
4. **Receipt page:**
   - Tap "Connect to PT-210"
   - Select printer from list
   - Tap "Test Print" (should print test)
   - Tap "Print Receipt" (should print full receipt)

---

## 🐛 TROUBLESHOOTING

### App won't connect to server?
```powershell
# Check your current IP
ipconfig | Select-String "IPv4"

# If IP changed, update capacitor.config.ts
# Then rebuild: npm run build && npx cap sync android
```

### Can't install APK on phone?
- Go to Settings → Security → Enable "Install from unknown sources"
- Or Settings → Apps → Special access → Install unknown apps → Enable for Files/Chrome

### Bluetooth won't connect?
- Make sure printer is in pairing mode (blue LED blinking)
- Grant all permissions when app asks
- Try restarting printer
- Keep phone close to printer

### App crashes on startup?
The app logs will show in Android Studio's Logcat (bottom panel)

---

## 📊 WHAT YOU SHOULD SEE

1. ✅ Login screen
2. ✅ Dashboard with "New Ticket" button
3. ✅ Create ticket form
4. ✅ Payment screen
5. ✅ Receipt with "Bluetooth Printer" section
6. ✅ "Connect to PT-210" button
7. ✅ Printer connects successfully
8. ✅ Receipt prints on thermal printer

---

## 🎯 QUICK COMMANDS SUMMARY

```powershell
# Terminal 1: Keep Laravel running
php artisan serve --host=0.0.0.0 --port=8000

# Terminal 2: Build APK (in Android Studio or command line)
cd android
./gradlew assembleDebug

# APK location:
# android\app\build\outputs\apk\debug\app-debug.apk
```

**Transfer APK to phone → Install → Test with printer!**

---

Good luck! 🚀
