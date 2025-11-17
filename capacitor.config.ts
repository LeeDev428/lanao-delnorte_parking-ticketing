import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lanaodelnorte.parking',
  appName: 'Parking Ticketing',
  webDir: 'public',
  server: {
    androidScheme: 'http',
    // For development with local Laravel server: 192.168.0.36
    url: 'http://192.168.0.36:8000',
    cleartext: true
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
