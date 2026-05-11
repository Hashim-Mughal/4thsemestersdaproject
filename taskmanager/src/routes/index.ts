// ============================================================
// ROUTES: userRouter, taskRouter, commentRouter
// Responsibility: URL-to-handler wiring ONLY.
// No logic, no conditions, no data. Pure Express plumbing.
// ============================================================

import { Router } from 'express';
import { protect, adminOnly } from '../middleware/auth';
import { UserController, TaskController, CommentController } from '../controllers';

export function createUserRouter(c: UserController): Router {
  const r = Router();
  r.post('/register',  c.register);
  r.post('/login',     c.login);
  r.get ('/profile',   protect, c.getProfile);
  r.put ('/profile',   protect, c.updateProfile);
  r.get ('/',          protect, adminOnly, c.getAllUsers);
  r.delete('/:id',     protect, adminOnly, c.deleteUser);
  return r;
}

export function createTaskRouter(c: TaskController): Router {
  const r = Router();
  r.post  ('/',              protect, c.create);
  r.get   ('/',              protect, c.getAll);
  r.get   ('/stats/summary', protect, c.getStats);
  r.get   ('/:id',           protect, c.getById);
  r.put   ('/:id',           protect, c.update);
  r.delete('/:id',           protect, c.delete);
  return r;
}

export function createCommentRouter(c: CommentController): Router {
  const r = Router({ mergeParams: true });
  r.post  ('/',            protect, c.add);
  r.get   ('/',            protect, c.getAll);
  r.put   ('/:commentId',  protect, c.update);
  r.delete('/:commentId',  protect, c.delete);
  return r;
}
