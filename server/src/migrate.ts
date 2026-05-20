import { db } from './db.js';

function hasColumn(table: string, column: string) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  return cols.some((c) => c.name === column);
}

function addColumn(table: string, column: string, ddl: string) {
  if (!hasColumn(table, column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${ddl}`);
  }
}

export function runMigrations() {
  addColumn('employees', 'phone', 'TEXT');
  addColumn('employees', 'is_active', 'INTEGER NOT NULL DEFAULT 1');

  addColumn('service_requests', 'client_phone', 'TEXT');
  addColumn('service_requests', 'priority', "TEXT NOT NULL DEFAULT 'normal'");
  addColumn('service_requests', 'created_by', 'INTEGER REFERENCES employees(id)');

  addColumn('repair_history', 'photo_data', 'TEXT');

  db.exec(`CREATE INDEX IF NOT EXISTS idx_requests_priority ON service_requests(priority)`);
}
