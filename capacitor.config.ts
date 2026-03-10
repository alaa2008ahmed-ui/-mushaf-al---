import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // تم تغيير الـ ID ليكون نسخة تجريبية مستقلة تماماً
  appId: 'com.mushaf.test', 
  appName: 'مصحف تجريبي',
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