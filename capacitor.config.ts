import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.Ahmed11Laila.Quran',
  appName: 'remix-mushaf-alaa',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      // إخفاء الشاشة بأسرع وقت ممكن
      launchShowDuration: 0, 
      launchAutoHide: true,
      
      // نستخدم اللون الأسود ليتوافق مع بداية فيديو Splash الخاص بك
      // ويمنع ظهور اللون الأبيض تماماً
      backgroundColor: "#000000",
      
      androidScaleType: "CENTER_CROP", 
      splashFullScreen: true,
      splashImmersive: true,
      launchFadeOutDuration: 0,
      androidSplashScreenAnimationDuration: 0
    }
  }
};

export default config;