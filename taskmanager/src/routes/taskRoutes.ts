// ============================================================
// ROUTES: taskRoutes
// Responsibility: URL-to-handler wiring for /api/tasks ONLY.
// Note: /stats/summary is registered BEFORE /:id — Express
// matches in order, so 'stats' must not be caught as an id.
// ============================================================

import { Router }             from 'express';
import { protect }            from '../middleware/auth';
import { TaskController }     from '../controllers/TaskController';

export function createTaskRouter(c: TaskController): Router {
  const r = Router();
  r.post  ('/',              protect, c.create);
  r.get   ('/',              protect, c.getAll);
  r.get   ('/stats/summary', protect, c.getStats);  // must be before /:id
  r.get   ('/:id',           protect, c.getById);
  r.put   ('/:id',           protect, c.update);
  r.delete('/:id',           protect, c.delete);
  return r;
}
