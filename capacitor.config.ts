import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.Ahmed11Laila.Quran',
  appName: 'remix-mushaf-alaa',
  webDir: 'dist', // هذا السطر هو الأهم، ليوجه البرنامج لمجلد ملفاتك
  bundledWebRuntime: false
};

export default config;