param([int]$LocalPort = 3001)

$ErrorActionPreference = "Continue"
$Root = Split-Path $PSScriptRoot -Parent
$NotifyScript = Join-Path $PSScriptRoot "tunnel-notify.ps1"
$UrlPattern = 'https://[a-z0-9][a-z0-9-]*\.trycloudflare\.com'
$CurrentFile = Join-Path $Root "tunnel-current-url.txt"
$LastFile = Join-Path $Root "tunnel-last-url.txt"
$LocalCloudflared = Join-Path $Root "tools\cloudflared.exe"

$cloudflared = $null
if (Test-Path $LocalCloudflared) { $cloudflared = $LocalCloudflared }
else {
    $cmd = Get-Command cloudflared -ErrorAction SilentlyContinue
    if ($cmd) { $cloudflared = $cmd.Source }
}

if (-not $cloudflared) {
    Write-Host "cloudflared not found." -ForegroundColor Red
    Write-Host "Run: .\scripts\install-cloudflared.ps1"
    Write-Host "Or: winget install Cloudflare.cloudflared"
    exit 1
}

try {
    $h = Invoke-RestMethod ("http://127.0.0.1:" + $LocalPort + "/api/health") -TimeoutSec 5
    Write-Host ("API OK: " + $h.service) -ForegroundColor Green
}
catch {
    Write-Host ("Start API on port " + $LocalPort + " first!") -ForegroundColor Red
}

$lastSent = $null
if (Test-Path $LastFile) { $lastSent = (Get-Content $LastFile -Raw).Trim() }
$seen = $null

Write-Host ("Using: " + $cloudflared) -ForegroundColor Cyan
Write-Host ("Tunnel -> http://127.0.0.1:" + $LocalPort) -ForegroundColor Cyan
Write-Host "Wait for https://....trycloudflare.com" -ForegroundColor Cyan

& $cloudflared tunnel --protocol http2 --url ("http://127.0.0.1:" + $LocalPort) 2>&1 | ForEach-Object {
    $line = $_.ToString()
    if ($line.Trim()) { Write-Host $line }
    if ($line -match $UrlPattern) {
        $url = $Matches[0]
        if ($url -ne $seen) {
            $script:seen = $url
            Set-Content -Path $CurrentFile -Value $url -Encoding UTF8 -NoNewline
            Write-Host ("FOUND URL: " + $url) -ForegroundColor Green
            if ($url -ne $lastSent) {
                try {
                    & powershell -NoProfile -ExecutionPolicy Bypass -File $NotifyScript `
                        -Url $url -LocalPort $LocalPort
                    Set-Content -Path $LastFile -Value $url -Encoding UTF8 -NoNewline
                    $script:lastSent = $url
                }
                catch {
                    Write-Host ("Notify error: " + $_.Exception.Message) -ForegroundColor Red
                }
            }
        }
    }
}
