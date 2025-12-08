# 🚗 Lanao del Norte Parking Ticketing System

A comprehensive **PWA parking management system** built with Laravel, React, Inertia.js, and Capacitor for Android deployment. Features Bluetooth thermal printer integration (PT-210), real-time collections tracking, and multi-role access control.

[![Laravel](https://img.shields.io/badge/Laravel-12.x-FF2D20?logo=laravel)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)](https://react.dev)
[![Capacitor](https://img.shields.io/badge/Capacitor-7.4-119EFF?logo=capacitor)](https://capacitorjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org)

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Database Schema](#-database-schema)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Mobile Build](#-mobile-build)
- [User Roles](#-user-roles)
- [API Routes](#-api-routes)
- [Bluetooth Printer Setup](#-bluetooth-printer-setup)
- [Screenshots](#-screenshots)
- [Development](#-development)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)

---

## ✨ Features

### 🎫 Ticketing System
- **Create Parking Tickets**: Plate number, zone selection, photo capture
- **Multi-Rate Support**: Hourly (₱40/hr), Flat Rate (₱50/3hrs), Overnight (₱100/12hrs)
- **Active Ticket Management**: Real-time tracking of parked vehicles
- **Advanced Filtering**: Search by plate, zone, rate type, status
- **Automatic Duration Calculation**: Real-time parking duration tracking

### 💰 Payment Processing
- **Multiple Payment Methods**: Cash, GCash QR, Card payments
- **Receipt Generation**: QR code receipts with unique receipt numbers
- **Bluetooth Printing**: Direct print to PT-210 58mm thermal printer
- **Payment History**: Complete transaction audit trail

### 📊 Reports & Analytics
- **Admin Collections Dashboard**: 
  - Total collections by payment method
  - Agent-wise revenue breakdown
  - Date range filtering
  - CSV export functionality
  
- **Agent Remittance System**:
  - Monthly collections view
  - Cash vs Digital payment separation
  - Sales summary with averages
  - Transaction search and filtering
  - Privacy toggle for amounts

### 👥 Multi-Role Access
- **Admin Portal**:
  - User management (create/deactivate agents)
  - Rate settings configuration
  - System-wide reports
  - All tickets overview
  
- **Agent Portal**:
  - Ticket creation and management
  - Payment processing
  - Personal remittance tracking
  - Daily collections summary

### 📱 Mobile-First Design
- **Capacitor Android App**: Full native mobile experience
- **Responsive UI**: Optimized for phone, tablet, desktop
- **Offline-Ready**: PWA capabilities with service worker
- **Touch-Optimized**: Mobile-friendly buttons and inputs

### 🖨️ Bluetooth Printer Integration
- **PT-210 Support**: 58mm thermal printer
- **ESC/POS Commands**: Professional receipt formatting
- **BLE Scanning**: Automatic device discovery
- **Connection Management**: Reconnect capability

---

## 🛠️ Tech Stack

### Backend
- **Laravel 12** - PHP framework
- **Inertia.js 2.1** - Server-side routing with SPA experience
- **Laravel Fortify** - Authentication system
- **MySQL** - Relational database

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Headless component library
- **shadcn/ui** - Pre-built UI components
- **Lucide React** - Icon library

### Mobile
- **Capacitor 7.4** - Native mobile wrapper
- **Capacitor Bluetooth LE** - Bluetooth thermal printer
- **Android SDK** - Target platform

### Development Tools
- **Vite** - Build tool and dev server
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Pest** - PHP testing framework

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Android Application                    │
│                  (Capacitor WebView)                     │
└─────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────┐
│              React + Inertia.js Frontend                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Admin   │  │  Agent   │  │  Auth    │              │
│  │  Pages   │  │  Pages   │  │  Pages   │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────┐
│                  Laravel Backend API                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Ticket     │  │   Payment    │  │   Report     │  │
│  │ Controller   │  │ Controller   │  │ Controller   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────┐
│                     MySQL Database                       │
│  ┌───────┐  ┌────────┐  ┌──────────┐  ┌──────────────┐ │
│  │ Users │  │Tickets │  │ Payments │  │RateSettings  │ │
│  └───────┘  └────────┘  └──────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────┐
│              Bluetooth Printer (PT-210)                  │
│                   ESC/POS Protocol                       │
└─────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

### Users Table
```sql
- id (bigint, PK)
- name (varchar)
- email (varchar, unique)
- password (varchar, hashed)
- role (enum: 'admin', 'agent')
- is_active (boolean)
- email_verified_at (timestamp)
- remember_token (varchar)
- timestamps
```

### Tickets Table
```sql
- id (bigint, PK)
- ticket_id (varchar, unique) -- Format: TKT-YYYYMMDD-XXXX
- plate_number (varchar, nullable)
- parking_zone (varchar) -- Zone 1, Zone 2, Zone 3, Zone 4
- rate_type (enum: 'hourly', 'flat_rate', 'overnight')
- price (decimal 10,2)
- entry_time (timestamp)
- exit_time (timestamp, nullable)
- duration_minutes (integer, nullable)
- status (enum: 'active', 'paid', 'cancelled')
- agent_id (FK → users.id)
- photo_path (varchar, nullable) -- Vehicle plate photo
- timestamps
```

### Payments Table
```sql
- id (bigint, PK)
- receipt_number (varchar, unique) -- Format: TKT-YYYYMMDD-XXXX
- ticket_id (FK → tickets.id)
- amount (decimal 10,2)
- payment_method (enum: 'cash', 'gcash', 'card')
- paid_at (timestamp)
- collected_by (FK → users.id)
- qr_code_path (varchar, nullable) -- Receipt QR code
- timestamps
```

### Rate Settings Table
```sql
- id (bigint, PK)
- rate_type (enum: 'hourly', 'flat_rate', 'overnight', unique)
- price (decimal 10,2)
- duration_minutes (integer, nullable) -- Fixed duration for flat/overnight
- description (varchar)
- is_active (boolean)
- timestamps
```

### Relationships
```
User (Admin/Agent)
  ├── hasMany → Tickets (as agent_id)
  └── hasMany → Payments (as collected_by)

Ticket
  ├── belongsTo → User (agent)
  └── hasOne → Payment

Payment
  ├── belongsTo → Ticket
  └── belongsTo → User (collector)

RateSetting
  └── (Independent configuration table)
```

---

## 🚀 Installation

### Prerequisites
- **PHP** ≥ 8.2
- **Composer** ≥ 2.x
- **Node.js** ≥ 20.x
- **MySQL** ≥ 8.x
- **Android Studio** (for mobile builds)
- **JDK** 17 (for Android)

### Step 1: Clone Repository
```bash
git clone https://github.com/LeeDev428/lanao-delnorte_parking-ticketing.git
cd lanao-delnorte_parking-ticketing
```

### Step 2: Install Dependencies
```bash
# Backend dependencies
composer install

# Frontend dependencies
npm install
```

### Step 3: Environment Setup
```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

### Step 4: Database Configuration
Edit `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=parking_ticketing
DB_USERNAME=root
DB_PASSWORD=your_password
```

### Step 5: Run Migrations & Seeders
```bash
# Create database tables
php artisan migrate

# Seed default data (admin, agent, rate settings)
php artisan db:seed
```

**Default Credentials:**
- Admin: `admin@gmail.com` / `admin123`
- Agent: `agent@gmail.com` / `agent123`

### Step 6: Storage Setup
```bash
# Create symbolic link for storage
php artisan storage:link
```

### Step 7: Start Development Server
```bash
# Option 1: Single command (recommended)
composer dev

# Option 2: Manual start
# Terminal 1: Laravel server
php artisan serve

# Terminal 2: Vite dev server
npm run dev
```

Access: `http://localhost:8000`

---

## ⚙️ Configuration

### Network Configuration (for Mobile)
Edit `capacitor.config.ts`:
```typescript
const config: CapacitorConfig = {
  appId: 'com.lanaodelnorte.parking',
  appName: 'Parking Ticketing',
  webDir: 'public',
  server: {
    androidScheme: 'http',
    url: 'http://YOUR_LOCAL_IP:8000', // Change this!
    cleartext: true
  }
};
```

Edit `android/app/src/main/res/xml/network_security_config.xml`:
```xml
<domain-config cleartextTrafficPermitted="true">
    <domain includeSubdomains="true">YOUR_LOCAL_IP</domain>
</domain-config>
```

### Rate Settings
Configure parking rates in Admin Panel:
- Navigate to **Admin → Rate Settings**
- Edit existing rates or create new ones
- Rates apply immediately to all new tickets

### Parking Zones
Default zones: `Zone 1`, `Zone 2`, `Zone 3`, `Zone 4`
- Configured in `TicketController.php`
- Can be customized in database or controller

---

## 📱 Mobile Build

### Android APK Build

#### 1. Build Frontend Assets
```bash
npm run build
```

#### 2. Sync with Capacitor
```bash
npx cap sync android
```

#### 3. Open Android Studio
```bash
npx cap open android
```

#### 4. Build APK
In Android Studio:
1. **Build → Clean Project**
2. **Build → Rebuild Project**
3. **Build → Build APK(s)**

APK Location:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

#### 5. Install on Device
```bash
# Via ADB
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Or use npm script
npm run mobile:install
```

### Quick Build Commands
```bash
# Complete build and sync
npm run mobile:sync

# Build and run on connected device
npm run mobile:run
```

---

## 👤 User Roles

### 🔑 Admin Role
**Permissions:**
- ✅ View all tickets (system-wide)
- ✅ Manage agents (create, edit, deactivate)
- ✅ Configure rate settings
- ✅ Access comprehensive reports
- ✅ View all collections (by agent, date, payment method)
- ✅ Export data to CSV

**Access Pages:**
- `/admin/tickets` - All tickets overview
- `/admin/users` - Agent management
- `/admin/rate-settings` - Rate configuration
- `/admin/reports` - Collections dashboard

### 👨‍💼 Agent Role
**Permissions:**
- ✅ Create parking tickets
- ✅ Process payments
- ✅ View own tickets only
- ✅ Track personal remittance
- ✅ Print receipts (Bluetooth)

**Access Pages:**
- `/dashboard` - Personal stats
- `/tickets/create` - New ticket
- `/tickets` - Active tickets (own)
- `/tickets/history` - Ticket history (own)
- `/tickets/remittance` - Collections report

---

## 🛤️ API Routes

### Public Routes
```php
GET  /                    # Welcome page
POST /login               # Authentication
POST /register            # Registration (if enabled)
POST /logout              # Logout
```

### Agent Routes (Authenticated)
```php
GET  /dashboard                        # Agent dashboard
GET  /tickets                          # Active tickets list
GET  /tickets/create                   # Create ticket form
POST /tickets                          # Store new ticket
GET  /tickets/{ticket}/payment         # Payment page
POST /tickets/{ticket}/payment         # Process payment
POST /tickets/{ticket}/deactivate      # Cancel ticket
GET  /tickets/receipt/{payment}        # View receipt
GET  /tickets/history                  # Ticket history
GET  /tickets/remittance               # Agent remittance report
```

### Admin Routes (Authenticated + Admin)
```php
GET    /admin/tickets                  # All tickets
GET    /admin/tickets/{ticket}         # Ticket details
PATCH  /admin/tickets/{ticket}         # Update ticket
DELETE /admin/tickets/{ticket}         # Delete ticket
GET    /admin/users                    # User management
POST   /admin/users                    # Create user
PATCH  /admin/users/{user}             # Update user
DELETE /admin/users/{user}             # Delete user
GET    /admin/rate-settings            # Rate settings
POST   /admin/rate-settings            # Create rate
PATCH  /admin/rate-settings/{rate}     # Update rate
DELETE /admin/rate-settings/{rate}     # Delete rate
GET    /admin/reports                  # Collections report
```

---

## 🖨️ Bluetooth Printer Setup

### PT-210 Thermal Printer Configuration

#### 1. Hardware Requirements
- **Printer Model**: PT-210 (58mm thermal)
- **Connection**: Bluetooth 4.0 (BLE)
- **Power**: Battery or USB charging
- **Paper**: 58mm thermal paper roll

#### 2. Pairing Mode
1. Turn on printer
2. Press and hold power button (3-5 seconds)
3. Blue LED should blink rapidly (pairing mode)
4. Printer is now discoverable

#### 3. App Connection
1. Open parking app
2. Navigate to receipt page
3. Tap **"Connect to PT-210"**
4. Select printer from device list
5. Wait for "Connected" status

#### 4. Service Implementation
Located in `resources/js/services/printer.service.ts`:

**Features:**
- BLE device scanning (3-second discovery)
- Automatic service UUID detection
- ESC/POS command encoding
- Receipt formatting (58mm width)
- Error handling and reconnection

**Supported Commands:**
- Text alignment (left/center/right)
- Font sizes (normal/double width/double height)
- Bold/underline styling
- QR code printing (if supported by printer)
- Paper cutting command

#### 5. Receipt Format
```
================================
    PARKING RECEIPT
================================
Receipt No: TKT-20251118-0001
Ticket ID: TKT-20251118-0001
Plate: ABC-1234
Zone: Zone 3
Entry: 2025-11-18 09:30 AM
Exit: 2025-11-18 11:45 AM
Duration: 2h 15m
Rate: Hourly (₱40/hr)
--------------------------------
Amount: ₱120.00
Payment: Cash
Collected: Agent User
Date: 2025-11-18 11:45 AM
================================
     Thank you!
================================
```

#### 6. Troubleshooting
**Problem**: Printer not found
- ✅ Ensure Bluetooth is enabled on phone
- ✅ Put printer in pairing mode (blue LED blinking)
- ✅ Check printer battery level
- ✅ Move closer to printer (< 10 meters)

**Problem**: Connection fails
- ✅ Unpair printer in phone Settings → Bluetooth
- ✅ Restart printer
- ✅ Restart app
- ✅ Try scanning again

**Problem**: Print quality poor
- ✅ Check thermal paper quality
- ✅ Clean printer head (isopropyl alcohol)
- ✅ Adjust darkness setting (if available)

---

## 📸 Screenshots

### Admin Dashboard
- Collections overview
- Agent performance metrics
- Payment method breakdown
- Real-time statistics

### Agent Dashboard
- Today's tickets count
- Total collected amount
- Active tickets list
- Quick action buttons

### Ticket Creation
- Plate number input
- Photo capture
- Zone selection
- Rate type selection (visual cards)

### Payment Processing
- Ticket details display
- Amount calculation
- Payment method selection (Cash/GCash/Card)
- Confirmation screen

### Receipt Page
- QR code display
- Transaction details
- Bluetooth print button
- Share/Download options

### Remittance Report
- Monthly collections view
- Sales summary (gross, net, average)
- Payment method breakdown with percentages
- Transaction list with search
- Cash vs digital separation

---

## 💻 Development

### Project Structure
```
lanao-delnorte_parking-ticketing/
├── app/
│   ├── Http/
│   │   └── Controllers/
│   │       ├── Admin/
│   │       │   └── AdminTicketController.php
│   │       ├── ReportController.php
│   │       └── TicketController.php
│   └── Models/
│       ├── Payment.php
│       ├── RateSetting.php
│       ├── Ticket.php
│       └── User.php
├── database/
│   ├── migrations/
│   │   ├── 0001_01_01_000000_create_users_table.php
│   │   ├── 2024_11_14_000001_create_rate_settings_table.php
│   │   ├── 2024_11_14_000002_create_tickets_table.php
│   │   └── 2024_11_14_000003_create_payments_table.php
│   └── seeders/
│       └── DatabaseSeeder.php
├── resources/
│   ├── css/
│   │   └── app.css
│   ├── js/
│   │   ├── components/
│   │   │   ├── ui/          # shadcn/ui components
│   │   │   ├── app-logo.tsx
│   │   │   ├── app-sidebar.tsx
│   │   │   └── input-error.tsx
│   │   ├── hooks/
│   │   │   ├── use-printer.ts
│   │   │   └── use-mobile.tsx
│   │   ├── layouts/
│   │   │   ├── admin/
│   │   │   │   └── admin-layout.tsx
│   │   │   ├── app-layout.tsx
│   │   │   └── auth-layout.tsx
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── reports.tsx
│   │   │   │   ├── rate-settings.tsx
│   │   │   │   ├── tickets.tsx
│   │   │   │   └── users.tsx
│   │   │   ├── auth/
│   │   │   │   ├── login.tsx
│   │   │   │   └── register.tsx
│   │   │   ├── tickets/
│   │   │   │   ├── create.tsx
│   │   │   │   ├── index.tsx
│   │   │   │   ├── history.tsx
│   │   │   │   ├── payment.tsx
│   │   │   │   ├── receipt.tsx
│   │   │   │   └── remittance.tsx
│   │   │   ├── dashboard.tsx
│   │   │   └── welcome.tsx
│   │   ├── services/
│   │   │   └── printer.service.ts
│   │   └── app.tsx
│   └── views/
│       └── app.blade.php
├── routes/
│   ├── web.php
│   └── settings.php
├── android/                 # Capacitor Android project
│   ├── app/
│   │   ├── src/
│   │   │   └── main/
│   │   │       ├── res/
│   │   │       │   └── xml/
│   │   │       │       └── network_security_config.xml
│   │   │       └── AndroidManifest.xml
│   │   └── build.gradle
│   └── gradle/
├── public/
│   ├── build/               # Built assets
│   └── index.php
├── capacitor.config.ts      # Capacitor configuration
├── package.json
├── composer.json
├── vite.config.ts
└── README.md
```

### Key Files

#### Backend Controllers
- **`TicketController.php`** - Agent ticket operations (CRUD, payment)
- **`AdminTicketController.php`** - Admin ticket management
- **`ReportController.php`** - Reports and remittance logic

#### Frontend Pages
- **`dashboard.tsx`** - Agent dashboard with stats
- **`tickets/create.tsx`** - Ticket creation form
- **`tickets/payment.tsx`** - Payment processing
- **`tickets/receipt.tsx`** - Receipt display + Bluetooth print
- **`tickets/remittance.tsx`** - Agent remittance report
- **`admin/reports.tsx`** - Admin collections dashboard

#### Services
- **`printer.service.ts`** - Bluetooth printer communication
- **`use-printer.ts`** - React hook for printer state management

### Code Style

#### PHP (Laravel)
```bash
# Format code with Pint
./vendor/bin/pint

# Run tests
php artisan test
```

#### TypeScript/React
```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run types
```

### Testing
```bash
# Run PHP tests
php artisan test

# Run specific test
php artisan test --filter=TicketTest

# With coverage
php artisan test --coverage
```

---

## 🚀 Deployment

### Production Build

#### 1. Build Frontend
```bash
npm run build
```

#### 2. Optimize Backend
```bash
# Cache config
php artisan config:cache

# Cache routes
php artisan route:cache

# Cache views
php artisan view:cache

# Optimize autoloader
composer install --optimize-autoloader --no-dev
```

#### 3. Environment Variables
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

DB_CONNECTION=mysql
DB_HOST=your-db-host
DB_DATABASE=your-db-name
DB_USERNAME=your-db-user
DB_PASSWORD=your-db-password
```

#### 4. Web Server Configuration

**Nginx:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/parking-ticketing/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

#### 5. SSL Certificate (Let's Encrypt)
```bash
sudo certbot --nginx -d your-domain.com
```

### Mobile App Deployment

#### Release APK
1. Update version in `android/app/build.gradle`:
```gradle
defaultConfig {
    versionCode 2
    versionName "1.1.0"
}
```

2. Generate signed APK:
```bash
cd android
./gradlew assembleRelease
```

3. APK location:
```
android/app/build/outputs/apk/release/app-release.apk
```

#### Google Play Store
1. Create keystore for signing
2. Configure `android/app/build.gradle` with signing config
3. Generate signed bundle:
```bash
./gradlew bundleRelease
```
4. Upload to Google Play Console

---

## 🐛 Troubleshooting

### Common Issues

#### "SQLSTATE[42000]: Syntax error"
**Solution:**
```bash
php artisan config:clear
php artisan migrate:fresh --seed
```

#### "Vite manifest not found"
**Solution:**
```bash
npm run build
php artisan optimize:clear
```

#### "Class 'App\Models\Ticket' not found"
**Solution:**
```bash
composer dump-autoload
php artisan optimize:clear
```

#### "Network error" on mobile app
**Solution:**
1. Check WiFi network (must be same as Laravel server)
2. Update `capacitor.config.ts` with correct IP
3. Update `network_security_config.xml`
4. Run `npx cap sync android`

#### Bluetooth printer connection fails
**Solution:**
1. Enable Bluetooth permissions in Android settings
2. Put printer in pairing mode
3. Check printer battery
4. Try restarting app and printer

#### "419 Page Expired" on form submission
**Solution:**
```bash
php artisan config:clear
# Clear browser cookies
# Try again
```

### Debug Mode

Enable debug mode temporarily:
```env
APP_DEBUG=true
```

View logs:
```bash
tail -f storage/logs/laravel.log
```

Clear all caches:
```bash
php artisan optimize:clear
```

---

## 📚 Additional Documentation

- [Mobile Setup Guide](MOBILE_SETUP.md)
- [Quick Start Mobile](QUICK_START_MOBILE.md)
- [Installation on Phone](INSTALL_ON_PHONE.md)
- [Testing Guide](TESTING_GUIDE.md)
- [Visual Guide](VISUAL_GUIDE.md)
- [Recent Updates](RECENT_UPDATES.md)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Guidelines
- Follow PSR-12 for PHP code
- Use TypeScript strict mode
- Write descriptive commit messages
- Add tests for new features
- Update documentation

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2025 Lanao del Norte Parking System

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👨‍💻 Developer

**LeeDev428**
- GitHub: [@LeeDev428](https://github.com/LeeDev428)
- Repository: [lanao-delnorte_parking-ticketing](https://github.com/LeeDev428/lanao-delnorte_parking-ticketing)

---

## 📞 Support

For issues, questions, or feature requests:
- 🐛 [Open an Issue](https://github.com/LeeDev428/lanao-delnorte_parking-ticketing/issues)
- 💬 [Discussions](https://github.com/LeeDev428/lanao-delnorte_parking-ticketing/discussions)
- 📧 Email: (Add your support email)

---

## 🙏 Acknowledgments

- **Laravel Team** - Amazing PHP framework
- **React Team** - Powerful UI library
- **Capacitor Team** - Seamless mobile integration
- **shadcn/ui** - Beautiful component library
- **Tailwind CSS** - Utility-first CSS framework
- **Point of Sale Receipt Printer Encoder** - ESC/POS library

---

## 📝 Changelog

### Version 1.0.0 (November 2025)
- ✅ Initial release
- ✅ Ticket management system
- ✅ Payment processing
- ✅ Admin and agent portals
- ✅ Bluetooth printer integration (PT-210)
- ✅ Collections reporting
- ✅ Remittance tracking
- ✅ Mobile Android app
- ✅ Multi-role authentication
- ✅ Responsive UI design

---

**Built with ❤️ using Laravel, React, and Capacitor**

⭐ **Star this repository** if you find it helpful!
