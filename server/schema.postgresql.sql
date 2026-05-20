-- Схема для PostgreSQL (продакшен / пояснительная записка)
-- Локальная разработка использует SQLite с теми же сущностями.

CREATE TYPE user_role AS ENUM ('dispatcher', 'executor');
CREATE TYPE request_status AS ENUM ('new', 'assigned', 'in_progress', 'completed', 'cancelled');

CREATE TABLE employees (
  id            SERIAL PRIMARY KEY,
  employee_code VARCHAR(32) NOT NULL UNIQUE,
  full_name     VARCHAR(200) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          user_role NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE service_requests (
  id            VARCHAR(32) PRIMARY KEY,
  title         VARCHAR(300) NOT NULL,
  client_name   VARCHAR(200) NOT NULL,
  address       TEXT NOT NULL,
  description   TEXT,
  scheduled_at  TIMESTAMPTZ NOT NULL,
  status        request_status NOT NULL DEFAULT 'new',
  latitude      DOUBLE PRECISION,
  longitude     DOUBLE PRECISION,
  assignee_id   INTEGER REFERENCES employees(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE repair_history (
  id            SERIAL PRIMARY KEY,
  request_id    VARCHAR(32) NOT NULL REFERENCES service_requests(id),
  employee_id   INTEGER NOT NULL REFERENCES employees(id),
  status_from   request_status,
  status_to     request_status NOT NULL,
  note          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_requests_assignee ON service_requests(assignee_id);
CREATE INDEX idx_requests_status ON service_requests(status);
CREATE INDEX idx_history_request ON repair_history(request_id);
