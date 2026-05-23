# Test ntfy only - URL is FAKE, do not use in DP app
Write-Host "Sending TEST message (not real tunnel)..." -ForegroundColor Yellow
& (Join-Path $PSScriptRoot "tunnel-notify.ps1") -Url "https://TEST-NE-SSYLKA.lhr.life"
Write-Host "Real URL comes only from tunnel-notify.bat when SSH is running."
