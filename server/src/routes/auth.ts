import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { db } from '../db.js';
import { signToken, authRequired } from '../auth.js';
import { mapEmployee } from '../mappers.js';
import { ROLE_PERMISSIONS } from '../roles.js';
import type { EmployeeRow } from '../types.js';

export const authRouter = Router();

authRouter.post('/login', (req, res) => {
  const { employeeCode, password } = req.body as {
    employeeCode?: string;
    password?: string;
  };

  if (!employeeCode?.trim() || !password) {
    res.status(400).json({ error: 'Укажите табельный номер и пароль' });
    return;
  }

  const row = db
    .prepare(`SELECT * FROM employees WHERE employee_code = ? COLLATE NOCASE`)
    .get(employeeCode.trim()) as EmployeeRow | undefined;

  if (!row || row.is_active === 0) {
    res.status(401).json({ error: 'Неверный логин или пароль' });
    return;
  }

  if (!bcrypt.compareSync(password, row.password_hash)) {
    res.status(401).json({ error: 'Неверный логин или пароль' });
    return;
  }

  const token = signToken({
    sub: row.id,
    role: row.role,
    employeeCode: row.employee_code,
  });

  res.json({
    token,
    user: mapEmployee(row),
    permissions: ROLE_PERMISSIONS[row.role],
  });
});

authRouter.get('/roles', (_req, res) => {
  res.json({ roles: ROLE_PERMISSIONS });
});

authRouter.post('/change-password', authRequired, (req, res) => {
  const { currentPassword, newPassword } = req.body as {
    currentPassword?: string;
    newPassword?: string;
  };
  if (!currentPassword || !newPassword || newPassword.length < 6) {
    res.status(400).json({ error: 'Новый пароль не менее 6 символов' });
    return;
  }

  const row = db.prepare(`SELECT * FROM employees WHERE id = ?`).get(req.user!.sub) as EmployeeRow;
  if (!bcrypt.compareSync(currentPassword, row.password_hash)) {
    res.status(400).json({ error: 'Неверный текущий пароль' });
    return;
  }

  const hash = bcrypt.hashSync(newPassword, 10);
  db.prepare(`UPDATE employees SET password_hash = ? WHERE id = ?`).run(hash, req.user!.sub);
  res.json({ ok: true });
});

authRouter.get('/me', authRequired, (req, res) => {
  const row = db.prepare(`SELECT * FROM employees WHERE id = ?`).get(req.user!.sub) as
    | EmployeeRow
    | undefined;

  if (!row) {
    res.status(404).json({ error: 'Пользователь не найден' });
    return;
  }

  res.json({
    user: mapEmployee(row),
    permissions: ROLE_PERMISSIONS[row.role],
  });
});
