# ntfy — push na telefon

## Telefon (1 raz)

1. Ustanovite **ntfy** (Play Market / App Store).
2. Knopka **+** ili "Subscribe to topic".
3. Vvedite temu (sekretnoe slovo), naprimer:
   ```
   fsm-ahror-2026-secret
   ```
   Nikomu ne govorite — kto znaet temu, vidit soobscheniya.

## PK

Fajl `scripts\tunnel-email.secrets.ps1` (sozdat iz example):

```powershell
$env:NTFY_TOPIC = "fsm-ahror-2026-secret"
```

Ta zhe tema chto na telefone.

## Test

```powershell
cd C:\Users\PC\vscode\DP
.\scripts\tunnel-notify.ps1 -Url "https://test.lhr.life"
```

Na telefone dolzhno pridti uvedomlenie.

## Kazhdyj den

1. `python run_mobile_api.py` (alica)
2. `.\tunnel-notify.bat` — novyj URL v ntfy + `tunnel-current-url.txt`
