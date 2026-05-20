import bcrypt from 'bcryptjs';
import { db, initSchema } from './db.js';
import { runMigrations } from './migrate.js';

initSchema();
runMigrations();

const passwordHash = bcrypt.hashSync('demo123', 10);

const employees = [
  ['DISPATCHER', 'Никифорова А.Д. (диспетчер)', passwordHash, 'dispatcher'],
  ['405IS', 'Тошматов Алишер Ахроржонович', passwordHash, 'executor'],
  ['EXEC02', 'Петров Иван Сергеевич', passwordHash, 'executor'],
] as const;

const insertEmployee = db.prepare(`
  INSERT OR IGNORE INTO employees (employee_code, full_name, password_hash, role)
  VALUES (?, ?, ?, ?)
`);

for (const row of employees) {
  insertEmployee.run(...row);
}

const executorId = db
  .prepare(`SELECT id FROM employees WHERE employee_code = '405IS'`)
  .get() as { id: number };

const insertRequest = db.prepare(`
  INSERT OR IGNORE INTO service_requests (
    id, title, client_name, client_phone, address, description, scheduled_at,
    status, priority, latitude, longitude, assignee_id
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

insertRequest.run(
  'REQ-1042',
  'Диагностика холодильного оборудования',
  'ООО «СеверТорг»',
  '+7 (8482) 12-34-56',
  'г. Тольятти, ул. Юбилейная, 12',
  'Проверить компрессор, зафиксировать давление и температуру.',
  '2026-05-20T10:30:00',
  'assigned',
  'high',
  53.5303,
  49.3461,
  executorId.id,
);

const requests = [
  [
    'REQ-1045',
    'Замена расходников на линии',
    'ИП Козлов',
    '+7 900 111-22-33',
    'г. Тольятти, пр-т Степана Разина, 45',
    'Заменить фильтры, приложить фото до/после.',
    '2026-05-20T14:00:00',
    'in_progress',
    'normal',
    53.5078,
    49.4204,
    executorId.id,
  ],
  [
    'REQ-1038',
    'Плановое ТО выездного оборудования',
    'АО «ПромСервис»',
    '+7 927 000-00-01',
    'г. Тольятти, ул. Баумана, 7',
    'Выполнено ТО, акт подписан на месте.',
    '2026-05-18T09:00:00',
    'completed',
    'low',
    53.5201,
    49.3892,
    executorId.id,
  ],
  [
    'REQ-1050',
    'Срочный выезд: неисправность насоса',
    'ООО «АгроПлюс»',
    '+7 8482 55-66-77',
    'г. Тольятти, ул. Мира, 3',
    'Насос не запускается, требуется диагностика на месте.',
    '2026-05-21T08:00:00',
    'new',
    'high',
    null,
    null,
    null,
  ],
] as const;

for (const row of requests) {
  insertRequest.run(...row);
}

console.log('База заполнена. Учётные записи:');
console.log('  Диспетчер: DISPATCHER / demo123');
console.log('  Исполнитель: 405IS / demo123');
