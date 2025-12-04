# 🅿️ Parking Ticketing System - Setup Guide

A complete parking management system with **Web Dashboard** and **Mobile App (Android APK)** for agents.

---

## 📋 What You'll Get

| Feature | Web | Mobile APK |
|---------|-----|------------|
| Admin Dashboard | ✅ | ❌ |
| Agent Ticketing | ✅ | ✅ |
| QR Code Scanner | ❌ | ✅ |
| Bluetooth Printing | ❌ | ✅ |
| Reports & Analytics | ✅ | ❌ |

---

## 🔑 Default Login Accounts

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@gmail.com | admin123 |
| **Staff Admin** | staff@gmail.com | staff123 |
| **Agent** | agent@gmail.com | agent123 |

> ⚠️ **Important:** Change these passwords after first login!

---

## 📦 Requirements

Before starting, make sure you have these installed:

| Software | Version | Download Link |
|----------|---------|---------------|
| **XAMPP** | 8.2+ (with PHP 8.2) | [Download XAMPP](https://www.apachefriends.org/download.html) |
| **Composer** | Latest | [Download Composer](https://getcomposer.org/download/) |
| **Node.js** | 18+ | [Download Node.js](https://nodejs.org/) |
| **Git** | Latest | [Download Git](https://git-scm.com/downloads) |

---

## 🚀 SETUP INSTRUCTIONS

### Step 1: Clone the Project

Open **Command Prompt** or **PowerShell** and run:

```bash
cd C:\xampp\htdocs
git clone https://github.com/makyleladion/parkingticket-system.git
cd parkingticket-system
```

---

### Step 2: Install Dependencies

Run these commands one by one:

```bash
composer install
npm install
```

---

### Step 3: Setup Environment File

```bash
copy .env.example .env
```

---

### Step 4: Configure Database

1. Open **XAMPP Control Panel**
2. Start **Apache** and **MySQL**
3. Open browser and go to: `http://localhost/phpmyadmin`
4. Create a new database named: `lanao_parking_db`

Now edit the `.env` file (use Notepad):

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=lanao_parking_db
DB_USERNAME=root
DB_PASSWORD=
```

---

### Step 5: Generate App Key & Migrate Database

```bash
php artisan key:generate
php artisan migrate
php artisan db:seed
```

---

### Step 6: Build Frontend Assets

```bash
npm run build
```

---

### Step 7: Start the Server

```bash
php artisan serve
```

Open browser: **http://localhost:8000**

✅ **Web is now running!**

---

## 📱 MOBILE APP SETUP (Important!)

The mobile APK needs to connect to your computer's server. You need to find your **IPv4 address**.

### Step 1: Find Your IPv4 Address

Open **Command Prompt** and run:

```bash
ipconfig
```

Look for something like:
```
IPv4 Address. . . . . . . . . . . : 192.168.1.XXX
```

Write down this number (e.g., `192.168.1.100`)

---

### Step 2: Edit the Config File ⚠️ IMPORTANT

Open this file: `capacitor.config.ts`

Find this line:
```typescript
url: 'http://192.168.0.36:8000',
```

Change `192.168.0.36` to **YOUR IPv4 address**:
```typescript
url: 'http://192.168.1.100:8000',  // Use YOUR IP here!
```

---

### Step 3: Start Server with Your IP

Instead of normal `php artisan serve`, run:

```bash
php artisan serve --host=YOUR_IP_HERE --port=8000
```

Example:
```bash
php artisan serve --host=192.168.1.100 --port=8000
```

---

### Step 4: Build & Install APK

**Option A: I'll send you the APK file (Easier)**

If you receive an APK file via Google Drive:
1. Copy APK to your Android phone
2. Enable "Install from Unknown Sources" in Settings
3. Open the APK and install

**Option B: Build it yourself**

If you want to build the APK:

1. Install [Android Studio](https://developer.android.com/studio)
2. Run these commands:
```bash
npm run build
npx cap sync android
npx cap open android
```
3. In Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
4. APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## ⚡ QUICK START (After Setup is Done)

Every time you want to use the system:

1. **Start XAMPP** (Apache + MySQL)
2. **Open Command Prompt** in project folder
3. Run:
```bash
php artisan serve --host=YOUR_IP_HERE --port=8000
```
4. **Web:** Open browser → `http://YOUR_IP:8000`
5. **Mobile:** Open the APK app (make sure phone is on same WiFi!)

---

## 📁 Files You Need to Modify

| File | What to Change | When |
|------|----------------|------|
| `.env` | Database settings | Initial setup |
| `capacitor.config.ts` | Your IPv4 address | When IP changes / Initial setup |

---

## 🔄 If Your IP Address Changes

Your IP might change when:
- You reconnect to WiFi
- Router restarts
- Different network

**What to do:**
1. Find new IP: `ipconfig`
2. Update `capacitor.config.ts` with new IP
3. Rebuild APK: `npm run build && npx cap sync android`
4. Reinstall APK on phone

---

## 🎯 System Features

### Admin Panel (Web Only)
- 📊 Dashboard with analytics
- 🎫 View all tickets
- 💰 Revenue reports
- 👥 User management
- ⚙️ Rate settings

### Agent Features (Web & Mobile)
- 🎫 Create parking tickets
- 📷 QR Code scanning (Mobile)
- 🖨️ Bluetooth thermal printing (Mobile)
- 💵 Process payments
- 📋 View ticket history

### Parking Rate Types
| Type | Description |
|------|-------------|
| **Hourly** | ₱40/hour (rounded up) |
| **Flat Rate** | ₱50 for 3 hours |
| **Overnight** | ₱2000 for 12 hours |

---

## 🛠️ Troubleshooting

### "Cannot connect" on Mobile App
- ✅ Phone and computer must be on **same WiFi**
- ✅ Check if IP address is correct in `capacitor.config.ts`
- ✅ Server must be running with `--host=YOUR_IP`
- ✅ Try disabling Windows Firewall temporarily

### Database Error
- ✅ Make sure MySQL is running in XAMPP
- ✅ Check database name in `.env` matches phpMyAdmin

### Blank White Screen
- ✅ Run `npm run build` again
- ✅ Clear browser cache (Ctrl + Shift + R)

### "Page Expired" or CSRF Error on Mobile
- This is already fixed in the code, but if it happens:
- ✅ Close and reopen the app
- ✅ Make sure server is running

---

## 📞 Support

If you have issues, check:
1. Is XAMPP running? (Apache + MySQL)
2. Is the server running with correct IP?
3. Is phone on same WiFi as computer?

---

## 📄 License

This project is proprietary software developed for Lanao del Norte Parking System.

---

**Developer:** Lee  
**Last Updated:** December 2025
