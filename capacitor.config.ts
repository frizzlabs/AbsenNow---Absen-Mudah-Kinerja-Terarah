import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'karajo-hr',
  webDir: 'www',
  plugins: {
    Camera: {
      // Android: izin kamera sudah otomatis via @capacitor/camera plugin
      // iOS: setelah "npx cap add ios", tambahkan ke ios/App/App/Info.plist:
      //   <key>NSCameraUsageDescription</key>
      //   <string>Diperlukan untuk mengambil selfie bukti kehadiran dinas luar</string>
      //   <key>NSPhotoLibraryAddUsageDescription</key>
      //   <string>Diperlukan untuk menyimpan foto absen</string>
    },
  },
};

export default config;
