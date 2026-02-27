import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.Ahmed11Laila.Quran',
  appName: 'remix-mushaf-alaa',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      // 1. ضبط وقت الظهور (3000 ملي ثانية = 3 ثوانٍ)
      launchShowDuration: 3000, 
      launchAutoHide: true,
      
      // 2. إعدادات المظهر
      backgroundColor: "#ffffff",
      androidScaleType: "CENTER_CROP", // لجعل الصورة تملأ الشاشة بشكل احترافي
      
      // 3. إعدادات الشاشة الكاملة
      splashFullScreen: true,
      splashImmersive: true,
      
      // 4. مدة تلاشي الصورة عند الاختفاء (نعومة في الانتقال)
      launchFadeOutDuration: 500 
    }
  }
};

export default config;