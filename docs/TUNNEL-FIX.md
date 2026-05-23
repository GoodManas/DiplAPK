# Tunnel ne rabotaet (Cloudflare / lhr.life)

## Simptom

- URL pokazyvaetsya (trycloudflare.com ili lhr.life)
- No `/api/health` ne otkryvaetsya
- V loge: `QUIC timeout`, `connection reset`

Prichina: provayder ili firewall blokiruet Cloudflare / tuneli.

---

## Variant 1 — odna Wi-Fi (samoe prostoe)

Telefon i PK v odnoi seti:

```powershell
cd C:\Users\PC\vscode\DP
.\tunnel-lan.bat
```

V DP vvedite naprimer:

```
http://192.168.0.104:3001
```

(IP mozhet byt drugoi — skript pokazhet.)

Tunel ne nuzhen.

---

## Variant 2 — localtunnel (cherez Node)

```powershell
.\tunnel-localtunnel.bat
```

Podozhdite `https://....loca.lt` — proverte v brauzere `/api/health`.

---

## Variant 3 — SSH localhost.run

Okno 2:

```powershell
ssh -R 80:127.0.0.1:3001 nokey@localhost.run
```

Esli v brauzere otkryvaetsya `https://....lhr.life/api/health` — vstavte v DP.

---

## Vsegda

1. Okno 1: `python run_mobile_api.py` (alica)
2. Na PK: http://127.0.0.1:3001/api/health — dolzhen rabotat
3. Tolko potom tunel
4. Okno tunelya ne zakryvat

---

## V DP

Adres **bez** `/api` v konce:

```
https://xxxx.trycloudflare.com
```

Login: 405IS / demo123
