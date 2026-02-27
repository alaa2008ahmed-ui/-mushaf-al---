package com.Ahmed11Laila.Quran;

import android.os.Bundle;
import android.graphics.Color;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // منع الوميض الأبيض بجعل خلفية الـ WebView شفافة برمجياً
        // هذا السطر يضمن أنه حتى لو تأخر التطبيق في التحميل، لن يظهر لون أبيض
        this.bridge.getWebView().setBackgroundColor(Color.TRANSPARENT);
    }
}