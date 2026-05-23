@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo [1] localhost.run SSH  - tunnel-with-notify.ps1
echo [2] Cloudflare         - tunnel-cloudflare-notify.bat  (if SSH fails)
echo.
echo API first: python run_mobile_api.py
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\tunnel-with-notify.ps1"
if errorlevel 1 pause
