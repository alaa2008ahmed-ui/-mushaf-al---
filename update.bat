@echo off
title Mushaf Fast Deployer
echo ==========================================
echo      REPAIRING AND DEPLOYING MUSHAF
echo ==========================================

:: --- اكتب الاسم اللي عاوزه يظهر في جيت هاب هنا ---
set DEPLOY_NAME="نسخة_مصحف_أحمد_وليلى_النهائية"
:: -----------------------------------------------

echo [1/7] Installing Core Capacitor Android...
call npm install @capacitor/core @capacitor/android @capacitor/cli
if %ERRORLEVEL% neq 0 goto :error

echo [2/7] Installing Geolocation...
call npm install @capacitor/geolocation
if %ERRORLEVEL% neq 0 goto :error

echo [3/7] Updating Android Platform...
call npx cap sync android
if %ERRORLEVEL% neq 0 goto :error

echo [4/7] Building web project...
call npm run build
if %ERRORLEVEL% neq 0 goto :error

echo [5/7] Setting up Git...
git remote remove origin >nul 2>&1
git remote add origin https://github.com/alaa2008ahmed-ui/-mushaf-al---.git

echo [6/7] Committing with name: %DEPLOY_NAME%...
git add .
:: هنا الاسم هيظهر في الـ Commit History في جيت هاب
git commit -m "Deploy: %DEPLOY_NAME% [%date% %time%]"

echo [7/7] Pushing to GitHub...
:: الرفع بالإجبار مع تسجيل التغيير بالاسم الجديد
git push -u origin main --force
if %ERRORLEVEL% neq 0 goto :error

echo ==========================================
echo      SUCCESS! %DEPLOY_NAME% is LIVE
echo ==========================================
exit

:error
echo.
echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
echo     ERROR DETECTED! Process Stopped.
echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
pause
exit