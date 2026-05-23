param(
    [int]$LocalPort = 3001,
    [switch]$NoAutoRestart
)

$ErrorActionPreference = "Continue"
$Root = Split-Path $PSScriptRoot -Parent
$ConfigPath = Join-Path $PSScriptRoot "tunnel-email.config.ps1"
$NotifyScript = Join-Path $PSScriptRoot "tunnel-notify.ps1"
$UrlPattern = 'https://[a-z0-9][a-z0-9-]*\.lhr\.life'
$LastFile = Join-Path $Root "tunnel-last-url.txt"
$CurrentFile = Join-Path $Root "tunnel-current-url.txt"

if (-not (Test-Path $ConfigPath)) {
    throw "Copy scripts\tunnel-email.config.example.ps1 to tunnel-email.config.ps1"
}
. $ConfigPath

function Write-Info([string]$msg) {
    Write-Host ("[{0}] {1}" -f (Get-Date -Format "HH:mm:ss"), $msg)
}

Write-Info ("Tunnel 127.0.0.1:" + $LocalPort + " notify=" + $NotifyVia)
Write-Info ("URL file: " + $CurrentFile)

Write-Host ""
Write-Host "Checking API on PC..." -ForegroundColor Cyan
try {
    $h = Invoke-RestMethod ("http://127.0.0.1:" + $LocalPort + "/api/health") -TimeoutSec 5
    Write-Host ("API OK: " + $h.service) -ForegroundColor Green
}
catch {
    Write-Host ("API NOT running on port " + $LocalPort) -ForegroundColor Red
    Write-Host "Start first: python run_mobile_api.py (alica field_service_management)"
    Write-Host ""
}

$lastSent = $null
if (Test-Path $LastFile) { $lastSent = (Get-Content $LastFile -Raw).Trim() }

while ($true) {
    Write-Info "SSH localhost.run (wait for https://....lhr.life)..."
    $script:seenThisSession = $null
    $gotUrl = $false

    & ssh -o ServerAliveInterval=30 `
        -o ExitOnForwardFailure=yes `
        -R ("80:127.0.0.1:" + $LocalPort) `
        nokey@localhost.run `
        -o StrictHostKeyChecking=accept-new 2>&1 | ForEach-Object {
        $line = $_.ToString()
        if ($line.Trim()) { Write-Host $line }
        if ($line -match $UrlPattern) {
            $url = $Matches[0]
            $script:gotUrl = $true
            if ($url -ne $script:seenThisSession) {
                $script:seenThisSession = $url
                Set-Content -Path $CurrentFile -Value $url -Encoding UTF8 -NoNewline
                Write-Host ""
                Write-Info ("FOUND URL: " + $url)
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

    $code = $LASTEXITCODE
    if ($code -ne 0 -and -not $gotUrl) {
        Write-Host ""
        Write-Host ("SSH failed, exit code: " + $code) -ForegroundColor Red
        Write-Host "Try instead: tunnel-cloudflare-notify.bat (often works on Windows)"
        Write-Host "Or manual: ssh -R 80:127.0.0.1:3001 nokey@localhost.run"
    }

    if ($NoAutoRestart) { break }
    Write-Info "Reconnect in 15 sec..."
    Start-Sleep -Seconds 15
}
