# Туннель и адрес для DP

## Почему URL меняется

Бесплатный **localhost.run** (`ssh -R 80:... nokey@localhost.run`) при **каждом новом SSH** выдаёт новый адрес, например:

`https://6cf50f6ea3b9bc.lhr.life`

**Сделать один и тот же `lhr.life` навсегда на бесплатном localhost.run нельзя.**

Варианты:

| Способ | URL | Уведомление |
|--------|-----|-------------|
| localhost.run | меняется | Telegram (ниже) |
| cloudflared quick | меняется (`trycloudflare.com`) | Telegram |
| Свой домен + Cloudflare Tunnel | **постоянный** | не обязательно |
| Телефон в той же Wi‑Fi | `http://192.168.x.x:3001` | не нужен туннель |

---

## Уведомление на Gmail

См. **`scripts/GMAIL-TUNNEL.md`** — пароль приложения Gmail, тест `.\scripts\test-tunnel-email.ps1`, каждый день `tunnel-notify.bat`.

Если пароли приложений Google недоступны в регионе — отправка через **Яндекс SMTP** на ящик Gmail (описано в том же файле).

---

## Уведомление в Telegram (если api.telegram.org доступен)

Когда появляется новый URL — сообщение на телефон. **Gmail не нужен.**

### Один раз

```powershell
cd C:\Users\PC\vscode\DP
copy scripts\tunnel-email.config.example.ps1 scripts\tunnel-email.config.ps1
copy scripts\tunnel-email.secrets.example.ps1 scripts\tunnel-email.secrets.ps1
notepad scripts\tunnel-email.secrets.ps1
```

1. Telegram → **@BotFather** → `/newbot` → скопировать **токен** в `TELEGRAM_BOT_TOKEN`
2. Открыть бота → **Start** → написать `hi`
3. `.\scripts\get-telegram-chat-id.ps1` → вписать `TELEGRAM_CHAT_ID`

**Если скрипт пишет «Невозможно соединиться с удаленным сервером»** — с ПК не открывается `api.telegram.org` (блокировка/провайдер):

- Включите **VPN** и повторите скрипт, **или**
- В Telegram откройте **@userinfobot** → Start → скопируйте **Id** (это ваш Chat ID), **или**
- После Start у **вашего** бота откройте в браузере (с VPN):  
  `https://api.telegram.org/botВАШ_ТОКЕН/getUpdates`  
  найдите `"chat":{"id":123456789}`

Без Telegram: после `tunnel-notify.bat` смотрите файл **`tunnel-current-url.txt`** в корне DP.

Проверка:

```powershell
copy scripts\tunnel-email.config.example.ps1 scripts\tunnel-email.config.ps1
# если config ещё нет — уже создан выше
$url = "https://test.lhr.life"
# лучше после реального туннеля; для теста бота:
.\scripts\tunnel-notify.ps1 -Url "https://example.lhr.life"
```

### Каждый день

**Окно 1** — API (у вас с MySQL это `field_service_management`, не `npm run server` из DP):

```powershell
cd C:\Users\PC\vscode\alica\field_service_management
python run_mobile_api.py
```

**Окно 2** — туннель **с уведомлением**:

```powershell
cd C:\Users\PC\vscode\DP
.\tunnel-notify.bat
```

Или если localhost.run обрывается на Windows:

```powershell
.\tunnel-cloudflare-notify.bat
```

Новый URL: **Telegram** + файл `tunnel-current-url.txt` в корне DP.

В приложении DP: **Профиль → Изменить адрес сервера** → вставить URL из Telegram.

---

## Постоянный URL (один и тот же)

Нужен **свой домен** (или поддомен) в Cloudflare.

1. Аккаунт [Cloudflare](https://dash.cloudflare.com)
2. Добавить домен (или бесплатный поддомен, если есть)
3. Установить `cloudflared`, создать **Named Tunnel** в Zero Trust
4. Маршрут, например: `api.ваш-домен.ru` → `http://127.0.0.1:3001`
5. В DP один раз сохранить `https://api.ваш-домен.ru`

Документация: [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/)

Платные альтернативы: **ngrok** (reserved domain), VPS с белым IP.

---

## Без туннеля (один адрес в локальной сети)

Телефон и ПК в одной Wi‑Fi:

```powershell
ipconfig
```

В DP: `http://192.168.1.XX:3001` (ваш IPv4). Адрес не меняется, пока не сменился IP ПК.

---

## Связка с Alica (общая MySQL)

Для заявок с ПК диспетчера API должен быть:

`field_service_management` → `python run_mobile_api.py` (порт **3001**).

Туннель всё равно ведёт на `127.0.0.1:3001` — подойдут скрипты из DP или из `field_service_management`.
