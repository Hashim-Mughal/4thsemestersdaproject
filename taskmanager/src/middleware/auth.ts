// ============================================================
// MIDDLEWARE: authMiddleware
// Responsibility: Verify JWT and attach decoded user to request.
//
// Uses AuthService — not raw jsonwebtoken.
// SOLID S: Only verifies identity. Authorization (admin check) is
// handled by a separate adminOnly middleware below.
// ============================================================

import { Request, Response, NextFunction } from 'express';
import { AuthService }  from '../services/AuthService';
import { JwtPayload }   from '../types';

// Extend Express Request to carry the authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

const authService = new AuthService();

export const protect = (req: Request, res: Response, next: NextFunction): void => {
  const header = req.headers['authorization'];
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }
  try {
    const token   = header.split(' ')[1];
    req.user = authService.verifyToken(token);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Separate middleware for admin-only routes
// Before: role check was hardcoded inside every admin route
// After: one reusable guard — single responsibility
export const adminOnly = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ message: 'Admin access required' });
    return;
  }
  next();
};
