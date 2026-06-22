import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jaritechnology.absennow',
  appName: 'AbsenNow',
  webDir: 'www',
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    Camera: {},
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1B59F8',
      showSpinner: false,
    },
  },
};

export default config;
