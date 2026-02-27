import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.Ahmed11Laila.Quran',
  appName: 'remix-mushaf-alaa',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 1000,      // ثانية واحدة بالضبط
      launchAutoHide: true,           // إخفاء تلقائي
      backgroundColor: "#ffffff",     // خلفية بيضاء
      androidScaleType: "CENTER_CROP", 
      splashFullScreen: true,
      splashImmersive: true,
      launchFadeOutDuration: 0,       // إغلاق فوري بدون تلاشي (يمنع الشاشة البيضاء)
      androidSplashScreenAnimationDuration: 0 // تعطيل حركة أندرويد 12 لسرعة الدخول
    }
  }
};

export default config;