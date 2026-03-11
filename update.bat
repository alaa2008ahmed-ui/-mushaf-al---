@echo off
title Mushaf Fixer and Deployer
echo ==========================================
echo     REPAIRING AND DEPLOYING MUSHAF
echo ==========================================

:: 1. إعادة تثبيت المكتبات الأساسية الناقصة (حل مشكلة Unable to find @capacitor/android)
echo [1/7] Installing Core Capacitor Android...
call npm install @capacitor/core @capacitor/android @capacitor/cli

:: 2. تثبيت مكتبة تحديد الموقع (اللي كانت ناقصة المرة اللي فاتت)
echo [2/7] Installing Geolocation...
call npm install @capacitor/geolocation

:: 3. تحديث ومزامنة الأندرويد
echo [3/7] Updating Android Platform...
call npx cap sync android

:: 4. بناء مشروع الويب
echo [4/7] Building web project...
:: تأكد أنك مسحت سطر cordova.js من index.html يدوياً
call npm run build
if %ERRORLEVEL% neq 0 (
    echo !!!!!!!!! BUILD FAILED !!!!!!!!!
    echo Make sure index.html is clean.
    pause
    exit /b
)

:: 5. تحضير الـ Git للمستودع التجريبي
echo [5/7] Setting up Git...
git remote remove origin >nul 2>&1
git remote add origin https://github.com/alaa2008ahmed-ui/-mushaf-al---.git

:: 6. التسجيل
echo [6/7] Committing...
git add .
git commit -m "Fix missing android core: %date% %time%"

:: 7. الرفع بالإجبار
echo [7/7] Pushing to GitHub...
git push -u origin main --force

echo ==========================================
echo     DONE! Ready for GitHub Actions.
echo ==========================================
timeout /t 5 > nul
exit