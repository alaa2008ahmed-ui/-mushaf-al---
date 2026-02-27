import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.Ahmed11Laila.Quran',
  appName: 'remix-mushaf-alaa',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      // إلغاء الشاشة تماماً بجعل الوقت 0 والإخفاء التلقائي true
      launchShowDuration: 0, 
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      androidScaleType: "CENTER_CROP", 
      splashFullScreen: false,
      splashImmersive: false,
      launchFadeOutDuration: 0,
      androidSplashScreenAnimationDuration: 0
    }
  }
};

export default config;