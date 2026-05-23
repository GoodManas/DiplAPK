# File | Ntfy | Discord | Email | Telegram
$NotifyVia = "File"
$CopyUrlToClipboard = $true

$secretsFile = Join-Path $PSScriptRoot "tunnel-email.secrets.ps1"
if (Test-Path $secretsFile) { . $secretsFile }

# --- Ntfy (prosto push na telefon) ---
# $NotifyVia = "Ntfy"
# $env:NTFY_TOPIC = "fsm-moj-parol-topic"

# --- Discord ---
# $NotifyVia = "Discord"
# $env:DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/..."

# --- Gmail ---
# $NotifyVia = "Email"
# $TunnelEmailTo = "you@gmail.com"
# ...
