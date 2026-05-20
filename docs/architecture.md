# Архитектура системы (дипломный проект)

## Назначение

Корпоративная система управления **выездным сервисом и ремонтом** состоит из трёх клиентских модулей и единого API:

| Модуль | Технология | Роль |
|--------|------------|------|
| Мобильное приложение | Expo / React Native | Выездной специалист (исполнитель) |
| Веб-панель диспетчера | React + Vite | Регистрация заявок, назначение |
| Сервер API | Node.js + Express | Бизнес-логика, БД, WebSocket |

## Диаграмма компонентов

```mermaid
flowchart TB
  subgraph clients [Клиенты]
    M[Мобильный модуль исполнителя]
    D[Веб-модуль диспетчера]
  end

  subgraph server [Сервер]
    API[REST API Express]
    WS[Socket.IO]
    DB[(SQLite / PostgreSQL)]
  end

  M -->|HTTPS REST| API
  M -->|WebSocket + polling| WS
  D -->|REST| API
  D -->|WebSocket| WS
  API --> DB
  WS --> API
```

## Диаграмма развёртывания

```mermaid
flowchart LR
  Phone[Смартфон Expo Go]
  PC[ПК разработчика]
  Phone -->|Wi-Fi LAN| PC
  PC --> S[Node server :3001]
  PC --> V[Vite dispatcher :5173]
  S --> DB[(app.db)]
```

## Синхронизация статусов

1. Исполнитель меняет статус заявки → `PATCH /api/requests/:id/status`.
2. Сервер пишет запись в `repair_history` и обновляет `service_requests`.
3. Сервер рассылает событие `sync` через Socket.IO.
4. Диспетчер и мобильное приложение обновляют списки (WebSocket + резервный polling 15 с на телефоне).

## Диаграмма последовательности (назначение заявки)

```mermaid
sequenceDiagram
  participant Disp as Диспетчер
  participant API as REST API
  participant DB as БД
  participant Mob as Мобильный клиент

  Disp->>API: POST /api/requests
  API->>DB: INSERT заявка status=new
  Disp->>API: PATCH /api/requests/:id/assign
  API->>DB: UPDATE assignee, status=assigned
  API->>DB: INSERT repair_history
  API-->>Mob: WebSocket sync
  Mob->>API: GET /api/requests
  API-->>Mob: список заявок исполнителя
```

## Стек

- **СУБД (разработка):** SQLite (`better-sqlite3`) — не требует установки PostgreSQL.
- **СУБД (продакшен / записка):** PostgreSQL — скрипт `server/schema.postgresql.sql`.
- **Аутентификация:** JWT (Bearer token), роли `dispatcher` | `executor`.
