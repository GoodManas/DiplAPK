# DP — мобильное приложение исполнителя

Expo-приложение для выездных специалистов + API на Node.js (порт **3001**, SQLite).

**Важно:** адрес сервера **не зашит в APK**. Он вводится на телефоне и хранится в AsyncStorage.

- Туннель `localhost.run` **меняет URL** при каждом новом SSH — постоянный `https://....lhr.life` на бесплатном плане **нельзя**.
- **Telegram** при новом URL: `tunnel-notify.bat` — настройка в **[docs/TUNNEL.md](docs/TUNNEL.md)**.
- **Постоянный адрес:** свой домен + Cloudflare Tunnel (см. тот же файл) или Wi‑Fi `http://192.168.x.x:3001`.

---

## Быстрый старт (каждый рабочий день)

Три шага на ПК и два на телефоне.

### На компьютере

**Окно 1 — API-сервер** (не закрывать):

```powershell
cd C:\Users\PC\vscode\DP
npm run server
```

Проверка в браузере на ПК: [http://localhost:3001/api/health](http://localhost:3001/api/health) → `{"ok":true,...}`.

**Окно 2 — туннель** (не закрывать) + **уведомление в Telegram** при новом URL:

```powershell
cd C:\Users\PC\vscode\DP
.\tunnel-notify.bat
```

Или вручную: `ssh -R 80:127.0.0.1:3001 nokey@localhost.run` — URL вручную из окна SSH.

> Полная инструкция: **[docs/TUNNEL.md](docs/TUNNEL.md)** (Telegram, Cloudflare, постоянный домен).

> **Общая MySQL с диспетчером:** API запускать из `field_service_management` (`python run_mobile_api.py`), не `npm run server` из DP.

> Без туннеля в одной Wi‑Fi: `http://192.168.x.x:3001` (`ipconfig`).

### На телефоне

1. Откройте приложение **DP** (установленный APK).
2. Если просит адрес — вставьте URL туннеля **без** `/api` в конце, нажмите **Проверить подключение** → **Сохранить**.
3. Вход: **405IS** / **demo123**.

При смене URL туннеля: **Профиль → Изменить адрес сервера** (или ссылка на экране входа).

---

## Первичная настройка ПК (один раз)

### Что установить

| Компонент | Зачем |
|-----------|--------|
| [Node.js](https://nodejs.org/) LTS (20+) | сервер, сборка, скрипты |
| [Android Studio](https://developer.android.com/studio) | SDK и сборка APK (Platform-Tools, JDK) |
| OpenSSH (в Windows обычно уже есть) | туннель `ssh … localhost.run` |
| Git или архив проекта | копия кода |

Если `npm install` в `server/` падает на **better-sqlite3** — поставьте [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) с workload «Desktop development with C++» и повторите установку.

### Зависимости проекта

```powershell
cd C:\Users\PC\vscode\DP
npm install
cd server
npm install
cd ..
```

Опционально — веб диспетчера:

```powershell
cd dispatcher
npm install
cd ..
```

### Демо-база и учётки

Один раз:

```powershell
npm run server:seed
```

| Роль | Код | Пароль |
|------|-----|--------|
| Исполнитель (мобильное приложение) | `405IS` | `demo123` |
| Диспетчер (веб) | `DISPATCHER` | `demo123` |

Повторный `seed` не удаляет уже созданных пользователей.

Файл `.env` в корне **не обязателен** для APK — только подсказка для Expo Go:

```env
# EXPO_PUBLIC_API_URL=https://ваш-туннель.lhr.life
```

---

## Сборка и установка APK

Нужно при **первой** установке на телефон или когда менялся **код** приложения. Смена адреса туннеля APK не требует.

### Собрать APK

```powershell
cd C:\Users\PC\vscode\DP
npm run build:apk
```

Или двойной щелчок по **`build-apk.bat`**.

Готовый файл:

`android\app\build\outputs\apk\release\app-release.apk`

Скрипт сам находит Android SDK и выставляет `ANDROID_HOME`.

### Установить на телефон

**Способ A — USB (adb):**

1. На телефоне: **Настройки → Для разработчиков → Отладка по USB**.
2. Подключите USB, разрешите отладку.

```powershell
npm run install:apk
```

Или **`install-apk.bat`**, или вручную:

```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" install -r "C:\Users\PC\vscode\DP\android\app\build\outputs\apk\release\app-release.apk"
```

**Способ B — без adb:** скопируйте `app-release.apk` на телефон (USB, Telegram, облако) и откройте файл → разрешите установку из неизвестного источника.

### Первый запуск APK

1. Экран **«Адрес сервера»** — URL из туннеля или `http://IP_ПК:3001`.
2. **Проверить подключение** (`GET /api/health`).
3. **Сохранить и продолжить**.
4. Логин **405IS** / **demo123**.

---

## Разработка через Expo Go (опционально)

Вместо APK — для отладки UI без пересборки:

```powershell
npm start
```

Телефон и ПК в одной Wi‑Fi → Expo Go → QR. Адрес API всё равно задаётся в приложении (как в APK), не через жёсткий `.env` в сборке.

---

## Веб-диспетчер (опционально)

```powershell
npm run dispatcher
```

Открыть: [http://localhost:5173](http://localhost:5173). Логин: **DISPATCHER** / **demo123**.

В `dispatcher/.env` при необходимости: `VITE_API_URL=http://localhost:3001`.

---

## Команды

| Команда | Описание |
|---------|----------|
| `npm run server` | API + WebSocket (порт 3001) |
| `npm run server:seed` | демо-БД |
| `npm run build:apk` | собрать release APK |
| `npm run install:apk` | установить APK через adb |
| `npm start` | Expo Go (разработка) |
| `npm run android` | запуск на эмуляторе / устройстве через Expo |
| `npm run dispatcher` | веб панель диспетчера |
| `build-apk.bat` | то же, что `build:apk` |
| `install-apk.bat` | то же, что `install:apk` |

---

## Структура проекта

| Папка / файл | Назначение |
|--------------|------------|
| `src/` | мобильное приложение (экраны, API-клиент, адрес сервера) |
| `server/` | Express API, SQLite |
| `dispatcher/` | веб для диспетчера |
| `android/` | нативный проект для APK |
| `scripts/build-android-apk.js` | сборка APK с автопоиском SDK |
| `scripts/install-android-apk.js` | установка через adb |

Подробнее: [docs/architecture.md](docs/architecture.md).

---

## Частые проблемы

| Симптом | Что проверить |
|---------|----------------|
| «Проверить подключение» не проходит | `npm run server` запущен; SSH-туннель открыт; URL без `/api`; на телефоне в браузере открывается `https://…/api/health` |
| Не логинится | `npm run server:seed`; верный **405IS** / **demo123**; адрес сервера в приложении актуален |
| Сменился URL туннеля | **Профиль → Изменить адрес сервера**, не пересборка APK |
| `SDK location not found` при сборке | `npm run build:apk` (скрипт выставляет SDK); установлен Android Studio |
| `adb` не найден | `npm run install:apk` или копирование APK вручную |
| Порт 3001 занят | закрыть другой процесс или `set PORT=3002` и указать новый порт в URL на телефоне |

---

## Схема работы

```text
[Телефон: DP APK]
        │  HTTPS (туннель) или http://LAN:3001
        ▼
[localhost.run] ──► [ПК: Express :3001] ──► [SQLite]
```

Адрес туннеля → экран в приложении → все запросы и WebSocket идут на сохранённый URL.
