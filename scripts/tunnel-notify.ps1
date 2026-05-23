param(
    [string]$Url,
    [int]$LocalPort = 3001,
    [string]$ConfigPath = ""
)

$ErrorActionPreference = "Stop"

if (-not $ConfigPath) {
    $ConfigPath = Join-Path $PSScriptRoot "tunnel-email.config.ps1"
}
if (-not (Test-Path $ConfigPath)) {
    throw "Missing tunnel-email.config.ps1"
}
. $ConfigPath
$secretsFile = Join-Path $PSScriptRoot "tunnel-email.secrets.ps1"
if (Test-Path $secretsFile) { . $secretsFile }
if (-not $NotifyVia) { $NotifyVia = "File" }

$isTest = $Url -match "test\.lhr\.life|test-ntfy|test-tunnel"
$label = if ($isTest) { "TEST (ne vvodite v DP)" } else { "RABOCHIJ TUNEL - vstavte v DP" }
$text = @"
$label

$Url

Health: $Url/api/health
V DP: Adres servera (bez /api)
405IS / demo123
"@

$Root = Split-Path $PSScriptRoot -Parent
$CurrentFile = Join-Path $Root "tunnel-current-url.txt"

function Send-Ntfy {
    param([string]$Message, [string]$Topic)
    if (-not $Topic) { throw "Set NTFY_TOPIC in tunnel-email.secrets.ps1" }
    $uri = "https://ntfy.sh/" + $Topic
    try {
        Invoke-RestMethod -Uri $uri -Method Post -Body $Message -TimeoutSec 60 | Out-Null
        return
    }
    catch {
        Write-Warning $_.Exception.Message
    }
    $curl = Get-Command curl.exe -ErrorAction SilentlyContinue
    if (-not $curl) { throw "ntfy failed and curl.exe not found" }
    & curl.exe -sS -m 60 -d $Message $uri | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "ntfy curl failed" }
}

function Send-Discord {
    param([string]$Message, [string]$WebhookUrl)
    if (-not $WebhookUrl) { throw "Set DISCORD_WEBHOOK_URL in tunnel-email.secrets.ps1" }
    $body = @{ content = $Message } | ConvertTo-Json -Compress
    Invoke-RestMethod -Uri $WebhookUrl -Method Post -ContentType "application/json" -Body $body -TimeoutSec 25 | Out-Null
}

function Send-TunnelEmail {
    param([string]$Message, [string]$To, [string]$From, [string]$Server, [int]$Port, [string]$User, [string]$Password)
    if (-not $Password) { throw "Set TUNNEL_SMTP_PASSWORD" }
    $sec = ConvertTo-SecureString $Password -AsPlainText -Force
    $cred = New-Object System.Management.Automation.PSCredential($User, $sec)
    if (-not $From) { $From = $User }
    Send-MailMessage -From $From -To $To -Subject "DP tunel" -Body $Message `
        -SmtpServer $Server -Port $Port -UseSsl -Credential $cred
}

function Send-TunnelTelegram {
    param([string]$Message, [string]$Token, [string]$ChatId)
    $uri = "https://api.telegram.org/bot$Token/sendMessage"
    $body = @{ chat_id = $ChatId; text = $Message } | ConvertTo-Json -Compress
    Invoke-RestMethod -Uri $uri -Method Post -ContentType "application/json; charset=utf-8" `
        -Body ([System.Text.Encoding]::UTF8.GetBytes($body)) -TimeoutSec 25 | Out-Null
}

Set-Content -Path $CurrentFile -Value $Url -Encoding UTF8 -NoNewline
Write-Host ("Saved: " + $CurrentFile)

if ($CopyUrlToClipboard -ne $false) {
    try {
        Set-Clipboard -Value $Url
        Write-Host "Clipboard: URL copied"
    }
    catch { Write-Warning "Clipboard failed" }
}

$via = $NotifyVia.ToString().ToLowerInvariant()

if ($via -eq "file") {
    Write-Host "File OK (open tunnel-current-url.txt)"
    [console]::beep(800, 200)
    exit 0
}

if ($via -eq "ntfy") {
    $topic = $NtfyTopic
    if (-not $topic) { $topic = $env:NTFY_TOPIC }
    try {
        Send-Ntfy -Message $text -Topic $topic
        Write-Host "ntfy OK" -ForegroundColor Green
    }
    catch {
        Write-Host ("ntfy FAIL: " + $_.Exception.Message) -ForegroundColor Yellow
        Write-Host "URL is in tunnel-current-url.txt and clipboard"
    }
    exit 0
}

if ($via -eq "discord") {
    $wh = $DiscordWebhookUrl
    if (-not $wh) { $wh = $env:DISCORD_WEBHOOK_URL }
    Send-Discord -Message $text -WebhookUrl $wh
    Write-Host "Discord OK"
    exit 0
}

if ($via -eq "email") {
    $pass = $SmtpPassword
    if (-not $pass) { $pass = $env:TUNNEL_SMTP_PASSWORD }
    Send-TunnelEmail -Message $text -To $TunnelEmailTo -From $TunnelEmailFrom `
        -Server $SmtpServer -Port $SmtpPort -User $SmtpUser -Password $pass
    Write-Host ("Email OK -> " + $TunnelEmailTo)
    exit 0
}

if ($via -eq "telegram") {
    $token = $TelegramBotToken
    if (-not $token) { $token = $env:TELEGRAM_BOT_TOKEN }
    $chatId = $TelegramChatId
    if (-not $chatId) { $chatId = $env:TELEGRAM_CHAT_ID }
    Send-TunnelTelegram -Message $text -Token $token -ChatId $chatId
    Write-Host "Telegram OK"
    exit 0
}

throw "Unknown NotifyVia=$NotifyVia. Use: File, Ntfy, Discord, Email, Telegram"
