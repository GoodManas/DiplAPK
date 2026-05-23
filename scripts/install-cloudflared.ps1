# Download cloudflared.exe into DP\tools\ (no winget needed)
$ErrorActionPreference = "Stop"
$tools = Join-Path (Split-Path $PSScriptRoot -Parent) "tools"
$exe = Join-Path $tools "cloudflared.exe"
New-Item -ItemType Directory -Force -Path $tools | Out-Null

if (Test-Path $exe) {
    Write-Host "Already exists: $exe"
    & $exe --version
    exit 0
}

$url = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
Write-Host "Downloading..."
Invoke-WebRequest -Uri $url -OutFile $exe -UseBasicParsing
Write-Host "OK: $exe"
& $exe --version
