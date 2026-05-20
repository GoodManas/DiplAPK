import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { db } from '../db.js';
import { authRequired, requireRole } from '../auth.js';
import { mapEmployee } from '../mappers.js';
import type { EmployeeRow } from '../types.js';

export const employeesRouter = Router();

employeesRouter.use(authRequired);

employeesRouter.get('/executors', requireRole('dispatcher'), (_req, res) => {
  const rows = db
    .prepare(
      `SELECT * FROM employees WHERE role = 'executor' AND is_active = 1 ORDER BY full_name`,
    )
    .all() as EmployeeRow[];
  res.json({ items: rows.map(mapEmployee) });
});

employeesRouter.get('/', requireRole('dispatcher'), (_req, res) => {
  const rows = db
    .prepare(`SELECT * FROM employees ORDER BY role, full_name`)
    .all() as EmployeeRow[];
  res.json({ items: rows.map(mapEmployee) });
});

employeesRouter.post('/', requireRole('dispatcher'), (req, res) => {
  const { employeeCode, fullName, password, phone, role } = req.body as {
    employeeCode?: string;
    fullName?: string;
    password?: string;
    phone?: string;
    role?: 'executor' | 'dispatcher';
  };

  if (!employeeCode?.trim() || !fullName?.trim() || !password) {
    res.status(400).json({ error: 'Код, ФИО и пароль обязательны' });
    return;
  }

  const userRole = role === 'dispatcher' ? 'dispatcher' : 'executor';
  const hash = bcrypt.hashSync(password, 10);

  try {
    const result = db
      .prepare(
        `INSERT INTO employees (employee_code, full_name, password_hash, role, phone)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .run(employeeCode.trim().toUpperCase(), fullName.trim(), hash, userRole, phone ?? null);

    const row = db.prepare(`SELECT * FROM employees WHERE id = ?`).get(result.lastInsertRowid) as
      EmployeeRow;
    res.status(201).json({ item: mapEmployee(row) });
  } catch {
    res.status(409).json({ error: 'Сотрудник с таким табельным номером уже есть' });
  }
});

employeesRouter.patch('/:id', requireRole('dispatcher'), (req, res) => {
  const { fullName, phone, isActive, password } = req.body as {
    fullName?: string;
    phone?: string;
    isActive?: boolean;
    password?: string;
  };

  const existing = db.prepare(`SELECT * FROM employees WHERE id = ?`).get(req.params.id) as
    | EmployeeRow
    | undefined;
  if (!existing) {
    res.status(404).json({ error: 'Сотрудник не найден' });
    return;
  }

  if (fullName) {
    db.prepare(`UPDATE employees SET full_name = ? WHERE id = ?`).run(fullName.trim(), req.params.id);
  }
  if (phone !== undefined) {
    db.prepare(`UPDATE employees SET phone = ? WHERE id = ?`).run(phone || null, req.params.id);
  }
  if (isActive !== undefined) {
    db.prepare(`UPDATE employees SET is_active = ? WHERE id = ?`).run(isActive ? 1 : 0, req.params.id);
  }
  if (password) {
    const hash = bcrypt.hashSync(password, 10);
    db.prepare(`UPDATE employees SET password_hash = ? WHERE id = ?`).run(hash, req.params.id);
  }

  const row = db.prepare(`SELECT * FROM employees WHERE id = ?`).get(req.params.id) as EmployeeRow;
  res.json({ item: mapEmployee(row) });
});
