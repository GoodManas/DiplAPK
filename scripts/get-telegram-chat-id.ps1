$ErrorActionPreference = "Stop"
$secrets = Join-Path $PSScriptRoot "tunnel-email.secrets.ps1"
if (-not (Test-Path $secrets)) {
    throw "Create tunnel-email.secrets.ps1 from tunnel-email.secrets.example.ps1"
}
. $secrets
$token = $env:TELEGRAM_BOT_TOKEN
if (-not $token -or $token -match "AAH\.\.\.|PASTE|123456789") {
    throw "Set real TELEGRAM_BOT_TOKEN in tunnel-email.secrets.ps1"
}

$apiUrl = "https://api.telegram.org/bot$token/getUpdates"
Write-Host "GET api.telegram.org/bot.../getUpdates"

function Get-TgUpdates {
    try {
        return Invoke-RestMethod -Uri $apiUrl -TimeoutSec 20
    }
    catch {
        Write-Warning $_.Exception.Message
    }
    $curl = Get-Command curl.exe -ErrorAction SilentlyContinue
    if ($curl) {
        Write-Host "Trying curl.exe..."
        $json = & curl.exe -sS -m 25 $apiUrl
        if ($json) { return $json | ConvertFrom-Json }
    }
    return $null
}

$r = Get-TgUpdates
if (-not $r) {
    Write-Host ""
    Write-Host "Cannot reach api.telegram.org"
    Write-Host "A) Use VPN and run again"
    Write-Host "B) Telegram @userinfobot -> Start -> copy your Id"
    Write-Host "C) Browser with VPN: $apiUrl"
    Write-Host "D) Skip Telegram - use tunnel-current-url.txt"
    exit 1
}

if (-not $r.ok) {
    throw ("Telegram API error: " + ($r | ConvertTo-Json -Compress))
}

if (-not $r.result -or $r.result.Count -eq 0) {
    Write-Host "No messages. Open your bot in Telegram, press Start, send hi, run again."
    exit 1
}

$id = $r.result[-1].message.chat.id
Write-Host ""
Write-Host ("TELEGRAM_CHAT_ID = " + $id)
Write-Host ""
Write-Host "Add to tunnel-email.secrets.ps1:"
Write-Host ('$env:TELEGRAM_CHAT_ID = "' + $id + '"')
