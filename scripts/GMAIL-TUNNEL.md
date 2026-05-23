# Tunnel URL -> Gmail

## 1. Gmail app password

1. https://myaccount.google.com/security
2. Enable **2-Step Verification**
3. **App passwords** (if available in your region)
4. Create password for **Mail** / **Windows Computer**
5. Copy 16-character password (no spaces)

If **App passwords** page is blocked -> use **Yandex** block below (letters still arrive at Gmail).

## 2. secrets file

`scripts\tunnel-email.secrets.ps1`:

```powershell
$env:TUNNEL_SMTP_PASSWORD = "your16charapppassword"
```

## 3. config (already Email mode)

`scripts\tunnel-email.config.ps1`:

- `TunnelEmailTo` = where to receive (your Gmail)
- `smtp.gmail.com` port `587`

## 4. Test

```powershell
cd C:\Users\PC\vscode\DP
.\scripts\test-tunnel-email.ps1
```

Check inbox mrg828196@gmail.com (and Spam).

## 5. Daily use

1. `python run_mobile_api.py` (alica)
2. `.\tunnel-notify.bat` - new https://....lhr.life -> email + tunnel-current-url.txt

---

## Yandex sends TO Gmail (if Google app password unavailable)

`tunnel-email.config.ps1`:

```powershell
$NotifyVia = "Email"
$TunnelEmailTo   = "mrg828196@gmail.com"
$TunnelEmailFrom = "you@yandex.ru"
$SmtpServer = "smtp.yandex.ru"
$SmtpPort   = 465
$SmtpUser   = "you@yandex.ru"
```

Password: Yandex app password from https://id.yandex.ru
