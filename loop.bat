@echo off
cd /d "C:\Users\PC\vscode\DP"

:loop
echo [%time%] Запуск tunnel-localtunnel.bat
start "" tunnel-localtunnel.bat
timeout /t 300 /nobreak
goto loop