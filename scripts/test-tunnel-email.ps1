$ErrorActionPreference = "Stop"
& (Join-Path $PSScriptRoot "tunnel-notify.ps1") -Url "https://test-tunnel-check.lhr.life" -LocalPort 3001
Write-Host "Check inbox (and Spam folder)"
