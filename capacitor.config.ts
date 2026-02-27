import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.Ahmed11Laila.Quran',
  appName: 'remix-mushaf-alaa',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      // تم جعل المدة 0 لتعطيل الظهور
      launchShowDuration: 0, 
      launchAutoHide: true,
      
      // اللون #00000000 يعني شفاف تماماً (Transparent)
      backgroundColor: "#00000000",
      
      androidScaleType: "CENTER_CROP", 
      splashFullScreen: false,
      splashImmersive: false,
      launchFadeOutDuration: 0,
      androidSplashScreenAnimationDuration: 0
    }
  }
};

export default config;