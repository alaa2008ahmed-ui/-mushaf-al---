@echo off
title Mushaf Test Deployer (Fix & Deploy)
echo ==========================================
echo     STARTING MUSHAF TEST VERSION DEPLOY
echo ==========================================

:: 1. حل مشكلة المكتبات الناقصة (Geolocation)
echo [1/6] Installing missing dependencies...
call npm install @capacitor/geolocation

:: 2. تأكد من مزامنة كاباسيتور
echo [2/6] Syncing Capacitor settings...
call npx cap sync android

:: 3. بناء مشروع الويب
echo [3/6] Building web project...
:: ملحوظة: لو فشل هنا، اتأكد إنك مسحت سطر cordova.js من index.html يدوياً
call npm run build
if %ERRORLEVEL% neq 0 (
    echo !!!!!!!!! BUILD FAILED !!!!!!!!!
    echo Check if you removed cordova.js from index.html
    pause
    exit /b
)

:: 4. تحضير الـ Git للمستودع الجديد
echo [4/6] Setting up Git Remote...
git remote remove origin >nul 2>&1
git remote add origin https://github.com/alaa2008ahmed-ui/-mushaf-al---.git

:: 5. إضافة الملفات والتسجيل
echo [5/6] Committing changes...
git add .
git commit -m "Test Version: %date% %time% - Fixed Geolocation"

:: 6. الرفع بالإجبار (Force Push)
echo [6/6] Pushing to GitHub (Force)...
git push -u origin main --force

echo ==========================================
echo     DONE! Check GitHub Actions for APK.
echo ==========================================
echo Closing in 5 seconds...
timeout /t 5 > nul
exit