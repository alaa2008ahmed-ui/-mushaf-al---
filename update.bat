@echo off
title Mushaf Test Deployer
echo ==========================================
echo    STARTING MUSHAF TEST VERSION DEPLOY
echo ==========================================

:: 1. تأكد من مزامنة كاباسيتور (لتطبيق الـ ID الجديد)
echo [1/5] Syncing Capacitor settings...
call npx cap sync android

:: 2. بناء مشروع الويب (اختياري لو مغيرتش في الكود)
echo [2/5] Building web project...
call npm run build

:: 3. تحضير الـ Git للمستودع الجديد
echo [3/5] Setting up Git Remote...
git remote remove origin >nul 2>&1
git remote add origin https://github.com/alaa2008ahmed-ui/-mushaf-al---.git

:: 4. إضافة الملفات والتسجيل
echo [4/5] Committing changes...
git add .
git commit -m "Test Version: %date% %time%"

:: 5. الرفع بالإجبار (Force Push)
echo [5/5] Pushing to GitHub (Force)...
git push -u origin main --force

echo ==========================================
echo    DONE! Check GitHub Actions for APK.
echo ==========================================
pause