// ============================================================
// ROUTES: userRoutes
// Responsibility: URL-to-handler wiring for /api/users ONLY.
// No logic. No data. Pure Express plumbing.
// ============================================================

import { Router }                from 'express';
import { protect, adminOnly }    from '../middleware/auth';
import { UserController }        from '../controllers/UserController';

export function createUserRouter(c: UserController): Router {
  const r = Router();
  r.post  ('/register',  c.register);
  r.post  ('/login',     c.login);
  r.get   ('/profile',   protect, c.getProfile);
  r.put   ('/profile',   protect, c.updateProfile);
  r.get   ('/',          protect, adminOnly, c.getAllUsers);
  r.delete('/:id',       protect, adminOnly, c.deleteUser);
  return r;
}
