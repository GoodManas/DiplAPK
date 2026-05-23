# Kuda slat URL tunelya (bez Gmail / Telegram)

## 0. Samoe prostoe — bez nastroyki (uzhe rabotaet)

`tunnel-notify.bat` s `NotifyVia = "File"`:

- fajl `tunnel-current-url.txt` v korne DP
- URL v **bufer obmena** — vstavte v DP na telefone

Nichego ne nastroili — uzhe OK.

---

## 1. ntfy — push na telefon (2 minuty, rekomenduem)

Rabotaet cherez internet, bez Gmail i bez botov.

**Telefon:**

1. Ustanovite prilozhenie **ntfy** (Google Play / App Store)
2. Dobavte podpisku na temu, naprimer: `fsm-ahror-secret-12345`  
   (lyuboe unikalnoe imya — kak parol, chtoby drugie ne chitali)

**PK:** `scripts\tunnel-email.secrets.ps1`:

```powershell
$env:NTFY_TOPIC = "fsm-ahror-secret-12345"
```

**PK:** `scripts\tunnel-email.config.ps1`:

```powershell
$NotifyVia = "Ntfy"
```

Test:

```powershell
.\scripts\tunnel-notify.ps1 -Url "https://test.lhr.life"
```

Na telefone vyzovet uvedomlenie.

---

## 2. Discord — esli polzuetes Discordom

1. Svoj server -> kanal -> Nastroyki -> Integracii -> Vebkhuki -> Sozdat
2. Skopirovat URL vebkhuka v secrets:

```powershell
$env:DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/..."
```

3. V config: `$NotifyVia = "Discord"`

Soobschenie prihodit v kanal — chitaete s telefona v Discord.

---

## 3. Gmail / Telegram

Tolko esli uzhe rabotayut u vas (u vas Telegram API i Gmail app password chasto zablokirovany).

---

## Sravnenie

| Sposob      | Gemor | Telefon        |
|------------|-------|----------------|
| **File**   | net   | ruchnaya vstavka |
| **ntfy**   | malo  | push           |
| **Discord**| malo  | v prilozhenii  |
| Gmail      | sredn | pochta         |
| Telegram   | sredn | chasto blok    |
