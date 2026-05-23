# Same Wi-Fi: phone uses http://PC_IP:3001 (no tunnel)
$ErrorActionPreference = "Stop"
$port = 3001
try {
    $h = Invoke-RestMethod "http://127.0.0.1:$port/api/health" -TimeoutSec 5
    Write-Host ("API OK: " + $h.service) -ForegroundColor Green
}
catch {
    Write-Host "Start API: python run_mobile_api.py" -ForegroundColor Red
    exit 1
}

$ip = $null
Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
    Where-Object { $_.IPAddress -notmatch '^127\.' -and $_.PrefixOrigin -ne 'WellKnown' } |
    ForEach-Object {
        if ($_.IPAddress -match '^192\.168\.|^10\.|^172\.(1[6-9]|2[0-9]|3[0-1])\.') {
            $script:ip = $_.IPAddress
        }
    }

if (-not $ip) {
    Write-Host "Run ipconfig and find IPv4 (192.168.x.x)"
    exit 1
}

$url = "http://${ip}:${port}"
Write-Host ""
Write-Host "Phone on SAME Wi-Fi - in DP enter:" -ForegroundColor Green
Write-Host $url
Write-Host ""
Set-Content -Path (Join-Path (Split-Path $PSScriptRoot -Parent) "tunnel-current-url.txt") -Value $url -NoNewline
try { Set-Clipboard $url; Write-Host "Copied to clipboard" } catch {}
