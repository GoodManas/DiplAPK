import { Router } from 'express';
import { db } from '../db.js';
import { authRequired, requireRole } from '../auth.js';

export const statsRouter = Router();

statsRouter.use(authRequired, requireRole('dispatcher'));

statsRouter.get('/', (_req, res) => {
  const byStatus = db
    .prepare(
      `SELECT status, COUNT(*) AS count FROM service_requests GROUP BY status`,
    )
    .all() as { status: string; count: number }[];

  const executorsActive = db
    .prepare(`SELECT COUNT(*) AS count FROM employees WHERE role = 'executor' AND is_active = 1`)
    .get() as { count: number };

  const today = db
    .prepare(
      `SELECT COUNT(*) AS count FROM service_requests
       WHERE date(scheduled_at) = date('now', 'localtime')`,
    )
    .get() as { count: number };

  const highPriority = db
    .prepare(
      `SELECT COUNT(*) AS count FROM service_requests
       WHERE priority = 'high' AND status NOT IN ('completed', 'cancelled')`,
    )
    .get() as { count: number };

  res.json({
    byStatus: Object.fromEntries(byStatus.map((r) => [r.status, r.count])),
    executorsActive: executorsActive.count,
    scheduledToday: today.count,
    highPriorityOpen: highPriority.count,
    total: byStatus.reduce((s, r) => s + r.count, 0),
  });
});
