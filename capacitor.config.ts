import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.Ahmed11Laila.Quran',
  appName: 'remix-mushaf-alaa',
  webDir: 'dist',
  bundledWebRuntime: false,
  // إضافة قسم الإضافات (Plugins) للتحكم في شاشة البداية
  plugins: {
    SplashScreen: {
      launchShowDuration: 5000, // المدة 3 ثوانٍ (يمكنك تغييرها من هنا)
      launchAutoHide: true,     // تختفي تلقائياً بعد انتهاء الوقت
      launchFadeOutDuration: 500, // مدة التلاشي عند الاختفاء (نصف ثانية)
      backgroundColor: "#ffffff", // لون الخلفية (يجب أن يطابق ما وضعته في Styles)
      androidScaleType: "CENTER_CROP", // لجعل الصورة تغطي المساحة بشكل جيد
      showSpinner: false        // هل تريد إظهار دائرة تحميل فوق الصورة؟ (false للإخفاء)
    }
  }
};

export default config;