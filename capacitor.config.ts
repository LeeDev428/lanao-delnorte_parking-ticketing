import type { CapacitorConfig } from '@capacitor/cli';

/**
 * ⚠️ IMPORTANT FOR SETUP:
 * 
 * Change the IP address below to YOUR computer's IPv4 address.
 * 
 * To find your IP:
 * 1. Open Command Prompt
 * 2. Type: ipconfig
 * 3. Look for "IPv4 Address" (e.g., 192.168.1.100)
 * 
 * After changing the IP, rebuild the APK:
 *   npm run build
 *   npx cap sync android
 */

const config: CapacitorConfig = {
  appId: 'com.lanaodelnorte.parking',
  appName: 'Parking Ticketing',
  webDir: 'public',
  server: {
    androidScheme: 'http',
    // ⚠️ CHANGE THIS IP TO YOUR COMPUTER'S IPv4 ADDRESS
    url: 'http://192.168.0.36:8000',
    cleartext: true
  },
  android: {
    allowMixedContent: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffff",
      androidSplashResourceName: "splash",
      showSpinner: false
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#ffffff'
    }
  }
};

export default config;
