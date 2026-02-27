import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.Ahmed11Laila.Quran',
  appName: 'remix-mushaf-alaa',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      // تعديل هام: نجعل المدة 0 ونلغي الإخفاء التلقائي
      launchShowDuration: 0, 
      launchAutoHide: false, // لا تختفي حتى نأمرها نحن بذلك من الكود
      
      backgroundColor: "#ffffff",
      androidScaleType: "CENTER_CROP", 
      splashFullScreen: true,
      splashImmersive: true,
      launchFadeOutDuration: 300, // إضافة تلاشي بسيط جداً لجعل الانتقال ناعماً
      androidSplashScreenAnimationDuration: 0
    }
  }
};

export default config;