import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.Ahmed11Laila.Quran',
  appName: 'remix-mushaf-alaa',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,     // جعل مدة العرض صفر
      launchAutoHide: true,      // إخفاء تلقائي فوري
      backgroundColor: "#ffffff" // لون خلفية احتياطي سريع جداً
    }
  }
};

export default config;