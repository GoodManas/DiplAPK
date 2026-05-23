@echo off
cd /d "%~dp0"

:loop
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\show-lan-url.ps1"
echo [%time%] Уведомление отправлено. Жду 10 минут...
timeout /t 600 /nobreak
goto loop