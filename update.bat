@echo off
cls
color 0B
echo =========================================
echo      جاري تحديث تطبيق (مصحف أحمد وليلى)
echo =========================================

:: طلب وصف التحديث من المستخدم
set /p desc="Enter update description (ماذا فعلت في هذا التحديث؟): "

echo [1/4] Syncing Capacitor (Android)...
call npx cap sync android

echo [2/4] Saving Changes to Git...
git add .
:: هنا قمت بدمج الوصف مع التاريخ والوقت
git commit -m "%desc% (%date% %time%)"

echo [3/4] Pushing to GitHub (Main Branch)...
git push origin main

echo [4/4] Process Completed Successfully!
echo =========================================
echo تم الرفع بنجاح! يمكنك الآن الذهاب إلى 
echo GitHub Actions لتحميل ملف الـ APK الجديد.
echo =========================================
pause