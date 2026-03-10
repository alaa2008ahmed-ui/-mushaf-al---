import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // التعديل هنا: يجب أن يطابق اسم الحزمة القديم على جوجل بلاي بالضبط
  appId: 'com.AhmedLaila.Quran', 
  appName: 'مصحف أحمد وليلى',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav",
    },
  },
};

export default config;