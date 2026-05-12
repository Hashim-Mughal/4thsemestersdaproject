// ============================================================
// ROUTES: commentRoutes
// Responsibility: URL-to-handler wiring for /api/tasks/:taskId/comments ONLY.
// mergeParams: true — required to access :taskId from the parent router.
// ============================================================

import { Router }             from 'express';
import { protect }            from '../middleware/auth';
import { CommentController }  from '../controllers/CommentController';

export function createCommentRouter(c: CommentController): Router {
  const r = Router({ mergeParams: true });
  r.post  ('/',            protect, c.add);
  r.get   ('/',            protect, c.getAll);
  r.put   ('/:commentId',  protect, c.update);
  r.delete('/:commentId',  protect, c.delete);
  return r;
}
