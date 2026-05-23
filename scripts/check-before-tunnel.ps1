Write-Host "=== Before tunnel ===" -ForegroundColor Cyan
$ok = $true
try {
    $h = Invoke-RestMethod "http://127.0.0.1:3001/api/health" -TimeoutSec 5
    Write-Host ("OK API: " + $h.service) -ForegroundColor Green
}
catch {
    Write-Host "FAIL: start python run_mobile_api.py" -ForegroundColor Red
    $ok = $false
}
if (-not (Get-Command ssh -ErrorAction SilentlyContinue)) {
    Write-Host "FAIL: ssh not found" -ForegroundColor Red
    $ok = $false
}
else { Write-Host "OK ssh" -ForegroundColor Green }
if ($ok) { Write-Host "Run: tunnel-notify.bat or tunnel-cloudflare-notify.bat" -ForegroundColor Green }
