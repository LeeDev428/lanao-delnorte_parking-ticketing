# 🎯 VISUAL GUIDE: How To Use The Mobile App

## 📱 App Flow with Bluetooth Printing

```
┌─────────────────────────────────────────────────────────────┐
│                    AGENT WORKFLOW                           │
└─────────────────────────────────────────────────────────────┘

1. OPEN APP 📱
   ↓
   [Login Screen]
   - Email: agent@gmail.com
   - Password: agent123
   ↓
   
2. DASHBOARD 📊
   ↓
   [Agent Dashboard]
   - Today's Tickets: 12
   - Total Collected: ₱940
   - Active Tickets: 3
   ↓
   [Tap "New Ticket"]
   ↓

3. CREATE TICKET 🎫
   ↓
   [New Ticket Form]
   - Plate Number: ABC-1234 (optional)
   - Parking Zone: Zone 1
   - Rate Type: Hourly / Flat Rate / Overnight
   - [Optional] Take Photo of Plate
   ↓
   [Tap "Generate Ticket"]
   ↓

4. ACTIVE TICKETS 🚗
   ↓
   [Active Tickets List]
   - Shows all active tickets
   - Each ticket displays:
     * Ticket ID
     * Plate Number
     * Zone
     * Entry Time
     * Duration (live counter)
   ↓
   [Tap ticket to process payment]
   ↓

5. PAYMENT 💳
   ↓
   [Payment Screen]
   - Displays calculated amount
   - Shows duration
   - Choose payment method:
     * Cash
     * GCash
     * Card
   ↓
   [Tap "Process Payment"]
   ↓

6. RECEIPT (WITH BLUETOOTH!) 🖨️
   ↓
   [Receipt Page - SUCCESS SCREEN]
   
   ┌─────────────────────────────────────┐
   │  ✅ Payment Received                │
   │  Transaction completed successfully │
   ├─────────────────────────────────────┤
   │  Receipt No: TKT-00001              │
   │  [QR CODE]                          │
   │  Show to Attendant upon exit        │
   ├─────────────────────────────────────┤
   │  Ticket ID: P23-0214                │
   │  Plate: ABC-1234                    │
   │  Zone: Zone 1                       │
   │  Amount: ₱40.00                     │
   ├─────────────────────────────────────┤
   │  📱 BLUETOOTH PRINTER               │
   │  ┌─────────────────────────────┐   │
   │  │ Status: Not Connected       │   │
   │  │ [Connect to PT-210]         │   │
   │  └─────────────────────────────┘   │
   ├─────────────────────────────────────┤
   │  [Print]  [Share]                   │
   │  [Back to Dashboard]                │
   └─────────────────────────────────────┘
   ↓
   [Tap "Connect to PT-210"]
   ↓
   
   📡 SCANNING FOR DEVICES...
   ↓
   [Device List Popup]
   - PT-210 Bluetooth Printer
   - Other BT Devices...
   ↓
   [Select "PT-210 Bluetooth Printer"]
   ↓
   
   ✅ CONNECTED!
   
   ┌─────────────────────────────────────┐
   │  📱 BLUETOOTH PRINTER               │
   │  ┌─────────────────────────────┐   │
   │  │ Status: ✅ Connected        │   │
   │  │ Device: PT-210              │   │
   │  │ [🖨️ Print Receipt]          │   │
   │  │ [Test Print]                │   │
   │  │ [Disconnect]                │   │
   │  └─────────────────────────────┘   │
   └─────────────────────────────────────┘
   ↓
   [Tap "Test Print" first]
   ↓
   
   🖨️ PRINTER: TEST PRINT
   ================================
   TEST PRINT
   PT-210 Printer
   
   Connection successful!
   ================================
   
   ↓
   [Tap "Print Receipt"]
   ↓
   
   🖨️ PRINTER: FULL RECEIPT
   ================================
   LANAO DEL NORTE
   PARKING TICKETING SYSTEM
   ================================
   
   Receipt No: TKT-00001
   Ticket No : P23-0214
   --------------------------------
   Plate No  : ABC-1234
   Zone      : Zone 1
   Rate Type : HOURLY
   --------------------------------
   Entry Time: Nov 01, 2025 10:00 AM
   Exit Time : Nov 01, 2025 12:30 PM
   Duration  : 2h 30m
   --------------------------------
                   AMOUNT: ₱40.00
   --------------------------------
   Payment   : CASH
   Collected : Agent User
   Date/Time : Nov 01, 2025 12:30 PM
   
      [QR CODE]
   Scan QR for verification
   
   Thank you!
   Drive safely!
   ================================
   
   ✅ SUCCESS!
   ↓
   [Back to Dashboard]
   ↓
   REPEAT! 🔄
```

---

## 🖨️ PT-210 Printer Setup

### Physical Setup:
```
1. POWER ON
   ┌──────────┐
   │  PT-210  │  ← Turn on (blue LED)
   │ [======] │  ← Paper loaded
   └──────────┘
   
2. PAIRING MODE
   Press & Hold Power Button
   ↓
   💙 Blue LED Blinking Rapidly
   ↓
   Ready to pair!

3. LOAD PAPER
   ┌──────────┐
   │  PT-210  │
   │ [======] │ ← Open lid
   │    🧻    │ ← Insert 58mm paper
   │ [======] │ ← Close lid
   └──────────┘
   
4. TEST
   Feed button → Paper feeds out ✅
```

### In App:
```
Receipt Page
   ↓
"Connect to PT-210"
   ↓
[Select PT-210 from list]
   ↓
✅ Connected
   ↓
"Test Print" → Small test receipt
   ↓
"Print Receipt" → Full parking receipt
```

---

## 🔧 Android Testing Setup

### Option 1: Emulator (No Bluetooth)
```
┌─────────────────────────┐
│   ANDROID STUDIO        │
├─────────────────────────┤
│ 1. Open 'android' folder│
│ 2. Wait for sync        │
│ 3. Device Manager       │
│ 4. Create Device:       │
│    - Pixel 6 Pro        │
│    - Android 13 (API 33)│
│ 5. Click ▶️ Run         │
└─────────────────────────┘
         ↓
┌─────────────────────────┐
│   EMULATOR LAUNCHES     │
├─────────────────────────┤
│ ✅ Test login           │
│ ✅ Test tickets         │
│ ✅ Test payments        │
│ ✅ Test UI              │
│ ❌ NO BLUETOOTH         │
└─────────────────────────┘
```

### Option 2: Real Device (Full Features)
```
┌─────────────────────────┐
│   ANDROID PHONE         │
├─────────────────────────┤
│ 1. Settings → About     │
│ 2. Tap Build# (7x)      │
│ 3. Dev Mode ✅          │
│ 4. USB Debugging ✅     │
└─────────────────────────┘
         ↓
      [USB Cable]
         ↓
┌─────────────────────────┐
│   COMPUTER              │
├─────────────────────────┤
│ adb devices             │
│ → Shows device ✅       │
│                         │
│ npm run mobile:run      │
│ → Installs app          │
└─────────────────────────┘
         ↓
┌─────────────────────────┐
│   APP ON PHONE          │
├─────────────────────────┤
│ ✅ All features work    │
│ ✅ Bluetooth works      │
│ ✅ Can print receipts   │
└─────────────────────────┘
```

---

## 📂 Project Structure

```
your-project/
│
├── resources/js/
│   ├── services/
│   │   └── printer.service.ts     ← 🖨️ Bluetooth logic
│   ├── hooks/
│   │   └── use-printer.ts         ← 🎣 React hook
│   └── pages/tickets/
│       └── receipt.tsx            ← 📄 Updated with BT UI
│
├── android/                       ← 📱 Android project
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml ← Permissions
│   │   │   └── res/xml/
│   │   │       └── network_security_config.xml
│   │   └── build.gradle
│   └── build.gradle
│
├── capacitor.config.ts            ← ⚙️ Capacitor config
├── vite.config.ts                 ← 🏗️ PWA enabled
│
└── Documentation:
    ├── MOBILE_SETUP.md            ← 📖 Full guide
    ├── QUICK_START_MOBILE.md      ← ⚡ Quick ref
    └── SETUP_COMPLETE.md          ← ✅ This summary
```

---

## ⚡ Quick Commands

```bash
# 🏗️ Build & Sync
npm run mobile:sync

# 🚀 Run on Device
npm run mobile:run

# 🔧 Open Android Studio
npm run mobile:open

# 📦 Build APK
npm run mobile:build

# 📲 Install APK
npm run mobile:install

# 🔍 Debug Logs
adb logcat | grep Capacitor
```

---

## 🎨 UI Preview

### Receipt Page (Mobile View)

```
╔══════════════════════════════════════╗
║  ✅  Payment Received                ║
║      Transaction completed           ║
╠══════════════════════════════════════╣
║                                      ║
║     Receipt No: TKT-00001            ║
║                                      ║
║       ┌──────────────┐               ║
║       │              │               ║
║       │   QR CODE    │               ║
║       │              │               ║
║       └──────────────┘               ║
║                                      ║
║  Show to Attendant upon exit         ║
║                                      ║
╠══════════════════════════════════════╣
║  Ticket ID:    P23-0214              ║
║  Plate:        ABC-1234              ║
║  Zone:         Zone 1                ║
║  Entry:        10:00 AM              ║
║  Exit:         12:30 PM              ║
║  Payment:      CASH                  ║
║                                      ║
║  ┌────────────────────────────────┐  ║
║  │  Total: ₱40.00                 │  ║
║  └────────────────────────────────┘  ║
║                                      ║
╠══════════════════════════════════════╣
║  📱 BLUETOOTH PRINTER                ║
║  ┌────────────────────────────────┐  ║
║  │ ✅ Connected: PT-210           │  ║
║  ├────────────────────────────────┤  ║
║  │  [🖨️ Print Receipt]            │  ║
║  │  [Test Print]                  │  ║
║  ├────────────────────────────────┤  ║
║  │  [Disconnect]                  │  ║
║  └────────────────────────────────┘  ║
╠══════════════════════════════════════╣
║  [📥 Print]    [📤 Share]           ║
║                                      ║
║  [🏠 Back to Dashboard]              ║
╚══════════════════════════════════════╝
```

---

## 🎓 Staff Training Checklist

### For Agents:
- [ ] How to open the app
- [ ] Login credentials
- [ ] Creating a new ticket
- [ ] Processing payments
- [ ] **Connecting to PT-210 printer**
- [ ] **Printing receipts**
- [ ] **Troubleshooting printer issues**
- [ ] Disconnecting printer at end of shift
- [ ] Charging printer battery

### For Admins:
- [ ] Installing app on agent devices
- [ ] Configuring API connection
- [ ] Managing users
- [ ] Viewing reports
- [ ] Troubleshooting connectivity
- [ ] Updating app (APK distribution)

---

## 🏆 SUCCESS CHECKLIST

Your setup is complete when:

- [x] ✅ Dependencies installed
- [x] ✅ Capacitor configured
- [x] ✅ Android project created
- [x] ✅ Bluetooth service implemented
- [x] ✅ Receipt page updated
- [x] ✅ Permissions configured
- [x] ✅ Documentation created
- [ ] ⏳ Tested in emulator
- [ ] ⏳ Tested on real device
- [ ] ⏳ Bluetooth printing tested
- [ ] ⏳ PT-210 connected successfully
- [ ] ⏳ Receipts printing correctly
- [ ] ⏳ Staff trained
- [ ] ⏳ Production APK built

---

## 🚀 YOU'RE READY!

Next steps:
1. **Open Android Studio**: `npm run mobile:open`
2. **Test in emulator** (no BT, but test UI)
3. **Deploy to real device**: `npm run mobile:run`
4. **Connect PT-210** and test printing
5. **Train staff** on using the app
6. **Deploy to production** 🎉

---

**Happy printing! 🖨️✨**
```