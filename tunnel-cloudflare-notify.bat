@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Cloudflare tunnel + ntfy
if not exist "%~dp0tools\cloudflared.exe" (
  echo First time: powershell -File scripts\install-cloudflared.ps1
  echo.
)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\tunnel-cloudflare-notify.ps1"
pause
