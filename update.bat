@echo off
cls
color 0B
echo =========================================
echo     جاري تحديث تطبيق (مصحف أحمد وليلى)
echo =========================================

:: هنا نطلب منك إدخال وصف التحديث يدوياً
set /p desc="Enter update description (ماذا فعلت في هذا التحديث؟): "

echo [1/4] Syncing Capacitor (Android)...
call npx cap sync android

echo [2/4] Saving Changes to Git...
git add .
:: هنا سيستخدم الكلام الذي كتبته أنت بالأعلى
git commit -m "%desc%"

echo [3/4] Pushing to GitHub (Main Branch)...
git push origin main

echo [4/4] Process Completed Successfully!
echo =========================================
echo اذهب الآن إلى GitHub Actions لتحميل ملف الـ APK
echo =========================================
timeout /t 5
start https://github.com/Ahmed11Laila/mushaf-al/actions
pause