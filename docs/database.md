# Модель базы данных

## ER-диаграмма

```mermaid
erDiagram
  employees ||--o{ service_requests : "assignee"
  employees ||--o{ repair_history : "performs"
  service_requests ||--o{ repair_history : "has"

  employees {
    int id PK
    string employee_code UK
    string full_name
    string password_hash
    enum role
    datetime created_at
  }

  service_requests {
    string id PK
    string title
    string client_name
    text address
    text description
    datetime scheduled_at
    enum status
    float latitude
    float longitude
    int assignee_id FK
    datetime created_at
    datetime updated_at
  }

  repair_history {
    int id PK
    string request_id FK
    int employee_id FK
    enum status_from
    enum status_to
    text note
    datetime created_at
  }
```

## Таблицы

### employees (сотрудники)

| Поле | Описание |
|------|----------|
| employee_code | Табельный номер (логин) |
| role | `dispatcher` — диспетчер, `executor` — выездной специалист |

### service_requests (заявки на выезд)

| Статус | Значение |
|--------|----------|
| new | Создана диспетчером |
| assigned | Назначен исполнитель |
| in_progress | Специалист начал работу |
| completed | Работы завершены |
| cancelled | Отменена |

### repair_history (история ремонтов / статусов)

Каждое изменение статуса фиксируется с привязкой к заявке и сотруднику — для отчётности и пояснительной записки.

## Демо-учётные записи

| Роль | Логин | Пароль |
|------|-------|--------|
| Диспетчер | DISPATCHER | demo123 |
| Исполнитель | 405IS | demo123 |
| Исполнитель | EXEC02 | demo123 |

Скрипт заполнения: `npm run server:seed` из корня проекта.

## PostgreSQL

Полный DDL для промышленного варианта: `server/schema.postgresql.sql`.
