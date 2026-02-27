import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.Ahmed11Laila.Quran',
  appName: 'remix-mushaf-alaa',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      androidScaleType: "CENTER_CROP",
      splashFullScreen: true,
      splashImmersive: true,
      // هذا السطر يمنع الإضافة من محاولة التحكم في الشاشة برمجياً
      androidSplashScreenAnimationDuration: 0
    }
  }
};

export default config;