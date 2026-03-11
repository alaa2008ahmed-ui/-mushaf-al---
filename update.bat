@echo off
title Mushaf Fast Deployer
echo ==========================================
echo     REPAIRING AND DEPLOYING MUSHAF
echo ==========================================

:: 1. إعادة تثبيت المكتبات الأساسية الناقصة
echo [1/7] Installing Core Capacitor Android...
call npm install @capacitor/core @capacitor/android @capacitor/cli
if %ERRORLEVEL% neq 0 goto :error

:: 2. تثبيت مكتبة تحديد الموقع
echo [2/7] Installing Geolocation...
call npm install @capacitor/geolocation
if %ERRORLEVEL% neq 0 goto :error

:: 3. تحديث ومزامنة الأندرويد
echo [3/7] Updating Android Platform...
call npx cap sync android
if %ERRORLEVEL% neq 0 goto :error

:: 4. بناء مشروع الويب
echo [4/7] Building web project...
call npm run build
if %ERRORLEVEL% neq 0 goto :error

:: 5. تحضير الـ Git
echo [5/7] Setting up Git...
git remote remove origin >nul 2>&1
git remote add origin https://github.com/alaa2008ahmed-ui/-mushaf-al---.git

:: 6. التسجيل
echo [6/7] Committing...
git add .
git commit -m "Auto Fix and Deploy: %date% %time%"

:: 7. الرفع بالإجبار
echo [7/7] Pushing to GitHub...
git push -u origin main --force
if %ERRORLEVEL% neq 0 goto :error

echo ==========================================
echo     SUCCESS! Closing immediately...
echo ==========================================
:: الخروج الفوري بدون انتظار
exit

:error
echo.
echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
echo    ERROR DETECTED! Process Stopped.
echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
pause
exit