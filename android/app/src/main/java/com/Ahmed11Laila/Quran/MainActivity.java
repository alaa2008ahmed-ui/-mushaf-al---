package com.Ahmed11Laila.Quran;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // 1. استخدام ثيم شفاف قبل تشغيل السوبر لمنع ظهور أي أيقونة
        setTheme(androidx.appcompat.R.style.Theme_Translucent_NoTitleBar);
        
        super.onCreate(savedInstanceState);
        
        // 2. إخفاء شاشة البداية برمجياً فوراً في حال حاول الكاباسيتور إظهارها
        if (this.bridge != null) {
            this.bridge.getSplashScreen().hide();
        }
    }
}