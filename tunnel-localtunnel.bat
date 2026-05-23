@echo off
cd /d "%~dp0"
echo localtunnel - if Cloudflare does not work
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\tunnel-localtunnel.ps1"
pause
