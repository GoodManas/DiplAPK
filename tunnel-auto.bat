@echo off
cd /d C:\Users\PC\vscode\DP

:loop
echo [%time%] Starting localtunnel...
npx localtunnel --port 3001 --subdomain field-service-management-api

echo [%time%] Tunnel stopped. Waiting 10 minutes...
timeout /t 600 /nobreak

goto loop