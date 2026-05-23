# Alternative when Cloudflare/localhost.run blocked. Needs Node.js (npm).
param([int]$LocalPort = 3001)

$ErrorActionPreference = "Continue"
$Root = Split-Path $PSScriptRoot -Parent
$NotifyScript = Join-Path $PSScriptRoot "tunnel-notify.ps1"
$CurrentFile = Join-Path $Root "tunnel-current-url.txt"
$LastFile = Join-Path $Root "tunnel-last-url.txt"

if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
    Write-Host "Need Node.js: npm install -g localtunnel" -ForegroundColor Red
    exit 1
}

try {
    $h = Invoke-RestMethod "http://127.0.0.1:$LocalPort/api/health" -TimeoutSec 5
    Write-Host ("API OK: " + $h.service) -ForegroundColor Green
}
catch {
    Write-Host "Start API first!" -ForegroundColor Red
    exit 1
}

Write-Host "Starting localtunnel (Ctrl+C to stop)..." -ForegroundColor Cyan
$lastSent = $null
if (Test-Path $LastFile) { $lastSent = (Get-Content $LastFile -Raw).Trim() }

npx --yes localtunnel --port $LocalPort 2>&1 | ForEach-Object {
    $line = $_.ToString()
    Write-Host $line
    if ($line -match 'https://[a-z0-9-]+\.loca\.lt') {
        $url = $Matches[0]
        Set-Content -Path $CurrentFile -Value $url -NoNewline
        Write-Host ("FOUND: " + $url) -ForegroundColor Green
        try { Set-Clipboard $url } catch {}
        if ($url -ne $lastSent) {
            try {
                & powershell -NoProfile -ExecutionPolicy Bypass -File $NotifyScript -Url $url -LocalPort $LocalPort
                Set-Content -Path $LastFile -Value $url -NoNewline
                $script:lastSent = $url
            }
            catch { Write-Host $_.Exception.Message -ForegroundColor Yellow }
        }
    }
    if ($line -match 'your url is:\s*(https://\S+)') {
        $url = $Matches[1].Trim()
        Set-Content -Path $CurrentFile -Value $url -NoNewline
        Write-Host ("FOUND: " + $url) -ForegroundColor Green
    }
}
