@echo off
cd /d "C:\Users\PC\vscode\DP"

:loop
echo [%time%] Запуск туннеля...
call tunnel-localtunnel.bat

echo [%time%] Туннель остановлен. Жду 10 минут...
timeout /t 600 /nobreak

goto loop