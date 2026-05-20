import { Router } from 'express';
import { db } from '../db.js';
import { authRequired, requireRole } from '../auth.js';
import { mapHistory, mapRequest } from '../mappers.js';
import type { Priority, RequestRow, RequestStatus } from '../types.js';

function nextRequestId() {
  const row = db
    .prepare(`SELECT id FROM service_requests ORDER BY id DESC LIMIT 1`)
    .get() as { id: string } | undefined;
  const num = row ? Number.parseInt(row.id.replace('REQ-', ''), 10) + 1 : 1000;
  return `REQ-${num}`;
}

function fetchRequest(id: string) {
  return db
    .prepare(
      `SELECT r.*, e.full_name AS assignee_name
       FROM service_requests r
       LEFT JOIN employees e ON e.id = r.assignee_id
       WHERE r.id = ?`,
    )
    .get(id) as (RequestRow & { assignee_name: string | null }) | undefined;
}

function listRequests(options: {
  assigneeId?: number;
  status?: string;
  priority?: string;
  search?: string;
}) {
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (options.assigneeId != null) {
    clauses.push('r.assignee_id = ?');
    params.push(options.assigneeId);
  }
  if (options.status) {
    clauses.push('r.status = ?');
    params.push(options.status);
  }
  if (options.priority) {
    clauses.push('r.priority = ?');
    params.push(options.priority);
  }
  if (options.search?.trim()) {
    clauses.push(
      `(r.id LIKE ? OR r.title LIKE ? OR r.client_name LIKE ? OR r.address LIKE ?)`,
    );
    const q = `%${options.search.trim()}%`;
    params.push(q, q, q, q);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return db
    .prepare(
      `SELECT r.*, e.full_name AS assignee_name
       FROM service_requests r
       LEFT JOIN employees e ON e.id = r.assignee_id
       ${where}
       ORDER BY
         CASE r.priority WHEN 'high' THEN 0 WHEN 'normal' THEN 1 ELSE 2 END,
         r.scheduled_at ASC`,
    )
    .all(...params) as (RequestRow & { assignee_name: string | null })[];
}

export function createRequestsRouter(broadcast: (payload: unknown) => void) {
  const router = Router();
  router.use(authRequired);

  router.get('/', (req, res) => {
    const status = req.query.status as string | undefined;
    const priority = req.query.priority as string | undefined;
    const search = req.query.search as string | undefined;

    const rows =
      req.user!.role === 'executor'
        ? listRequests({ assigneeId: req.user!.sub, status, priority, search })
        : listRequests({ status, priority, search });

    res.json({ items: rows.map(mapRequest) });
  });

  router.get('/:id/history', (req, res) => {
    const history = db
      .prepare(
        `SELECT h.*, e.full_name AS employee_name
         FROM repair_history h
         JOIN employees e ON e.id = h.employee_id
         WHERE h.request_id = ?
         ORDER BY h.created_at DESC`,
      )
      .all(req.params.id) as Parameters<typeof mapHistory>[0][];

    res.json({ items: history.map(mapHistory) });
  });

  router.get('/:id/history/:historyId/photo', (req, res) => {
    const row = db
      .prepare(`SELECT photo_data FROM repair_history WHERE id = ? AND request_id = ?`)
      .get(req.params.historyId, req.params.id) as { photo_data: string | null } | undefined;

    if (!row?.photo_data) {
      res.status(404).json({ error: 'Фото не найдено' });
      return;
    }
    res.json({ photoData: row.photo_data });
  });

  router.get('/:id', (req, res) => {
    const row = fetchRequest(req.params.id);
    if (!row) {
      res.status(404).json({ error: 'Заявка не найдена' });
      return;
    }
    if (req.user!.role === 'executor' && row.assignee_id !== req.user!.sub) {
      res.status(403).json({ error: 'Заявка не назначена вам' });
      return;
    }
    res.json({ item: mapRequest(row) });
  });

  router.post('/', requireRole('dispatcher'), (req, res) => {
    const {
      title,
      clientName,
      clientPhone,
      address,
      description,
      scheduledAt,
      latitude,
      longitude,
      priority,
    } = req.body as Record<string, unknown>;

    if (!title || !clientName || !address || !scheduledAt) {
      res.status(400).json({ error: 'Заполните обязательные поля заявки' });
      return;
    }

    const id = nextRequestId();
    const p = (['low', 'normal', 'high'].includes(String(priority))
      ? priority
      : 'normal') as Priority;

    db.prepare(
      `INSERT INTO service_requests (
        id, title, client_name, client_phone, address, description, scheduled_at,
        status, priority, latitude, longitude, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'new', ?, ?, ?, ?)`,
    ).run(
      id,
      String(title),
      String(clientName),
      clientPhone ? String(clientPhone) : null,
      String(address),
      description ? String(description) : null,
      String(scheduledAt),
      p,
      latitude != null ? Number(latitude) : null,
      longitude != null ? Number(longitude) : null,
      req.user!.sub,
    );

    db.prepare(
      `INSERT INTO repair_history (request_id, employee_id, status_from, status_to, note)
       VALUES (?, ?, NULL, 'new', 'Заявка зарегистрирована')`,
    ).run(id, req.user!.sub);

    const item = mapRequest(fetchRequest(id)!);
    broadcast({ type: 'request:created', item });
    res.status(201).json({ item });
  });

  router.patch('/:id', requireRole('dispatcher'), (req, res) => {
    const existing = fetchRequest(req.params.id);
    if (!existing) {
      res.status(404).json({ error: 'Заявка не найдена' });
      return;
    }

    const fields = req.body as Record<string, unknown>;
    const updates: string[] = [];
    const values: unknown[] = [];

    const map: Record<string, string> = {
      title: 'title',
      clientName: 'client_name',
      clientPhone: 'client_phone',
      address: 'address',
      description: 'description',
      scheduledAt: 'scheduled_at',
      priority: 'priority',
    };

    for (const [key, col] of Object.entries(map)) {
      if (fields[key] !== undefined) {
        updates.push(`${col} = ?`);
        values.push(fields[key]);
      }
    }

    if (!updates.length) {
      res.status(400).json({ error: 'Нет полей для обновления' });
      return;
    }

    updates.push(`updated_at = datetime('now')`);
    values.push(req.params.id);
    db.prepare(`UPDATE service_requests SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    db.prepare(
      `INSERT INTO repair_history (request_id, employee_id, status_from, status_to, note)
       VALUES (?, ?, ?, ?, ?)`,
    ).run(req.params.id, req.user!.sub, existing.status, existing.status, 'Данные заявки изменены');

    const item = mapRequest(fetchRequest(req.params.id)!);
    broadcast({ type: 'request:updated', item });
    res.json({ item });
  });

  router.patch('/:id/cancel', requireRole('dispatcher'), (req, res) => {
    const { reason } = req.body as { reason?: string };
    const existing = fetchRequest(req.params.id);
    if (!existing) {
      res.status(404).json({ error: 'Заявка не найдена' });
      return;
    }

    db.prepare(
      `UPDATE service_requests SET status = 'cancelled', updated_at = datetime('now') WHERE id = ?`,
    ).run(req.params.id);

    db.prepare(
      `INSERT INTO repair_history (request_id, employee_id, status_from, status_to, note)
       VALUES (?, ?, ?, 'cancelled', ?)`,
    ).run(req.params.id, req.user!.sub, existing.status, reason ?? 'Отменено диспетчером');

    const item = mapRequest(fetchRequest(req.params.id)!);
    broadcast({ type: 'request:updated', item });
    res.json({ item });
  });

  router.patch('/:id/assign', requireRole('dispatcher'), (req, res) => {
    const { assigneeId } = req.body as { assigneeId?: number };
    if (!assigneeId) {
      res.status(400).json({ error: 'Укажите исполнителя' });
      return;
    }

    const executor = db
      .prepare(`SELECT id FROM employees WHERE id = ? AND role = 'executor' AND is_active = 1`)
      .get(assigneeId);
    if (!executor) {
      res.status(400).json({ error: 'Исполнитель не найден' });
      return;
    }

    const existing = fetchRequest(req.params.id);
    if (!existing) {
      res.status(404).json({ error: 'Заявка не найдена' });
      return;
    }

    const statusTo: RequestStatus = 'assigned';
    db.prepare(
      `UPDATE service_requests
       SET assignee_id = ?, status = ?, updated_at = datetime('now')
       WHERE id = ?`,
    ).run(assigneeId, statusTo, req.params.id);

    db.prepare(
      `INSERT INTO repair_history (request_id, employee_id, status_from, status_to, note)
       VALUES (?, ?, ?, ?, ?)`,
    ).run(req.params.id, req.user!.sub, existing.status, statusTo, 'Назначен исполнитель');

    const item = mapRequest(fetchRequest(req.params.id)!);
    broadcast({ type: 'request:updated', item });
    res.json({ item });
  });

  router.patch('/:id/status', (req, res) => {
    const { status, note, photoBase64 } = req.body as {
      status?: RequestStatus;
      note?: string;
      photoBase64?: string;
    };
    const allowed: RequestStatus[] = ['assigned', 'in_progress', 'completed', 'cancelled'];

    if (!status || !allowed.includes(status)) {
      res.status(400).json({ error: 'Недопустимый статус' });
      return;
    }

    const existing = fetchRequest(req.params.id);
    if (!existing) {
      res.status(404).json({ error: 'Заявка не найдена' });
      return;
    }

    if (req.user!.role === 'executor') {
      if (existing.assignee_id !== req.user!.sub) {
        res.status(403).json({ error: 'Заявка не назначена вам' });
        return;
      }
      if (!['in_progress', 'completed'].includes(status)) {
        res.status(403).json({ error: 'Исполнитель может только начать или завершить работу' });
        return;
      }
    }

    db.prepare(
      `UPDATE service_requests SET status = ?, updated_at = datetime('now') WHERE id = ?`,
    ).run(status, req.params.id);

    db.prepare(
      `INSERT INTO repair_history (
        request_id, employee_id, status_from, status_to, note, photo_data
      ) VALUES (?, ?, ?, ?, ?, ?)`,
    ).run(
      req.params.id,
      req.user!.sub,
      existing.status,
      status,
      note?.trim() || null,
      photoBase64 ?? null,
    );

    const item = mapRequest(fetchRequest(req.params.id)!);
    broadcast({ type: 'request:updated', item });
    res.json({ item });
  });

  return router;
}
