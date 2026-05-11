// ============================================================
// SERVICE: AuthService
// Responsibility: JWT token generation and verification ONLY.
// Extracted from UserService — Single Responsibility.
//
// In the BEFORE code, token generation was scattered in every
// route that needed auth. Here it lives in one place.
// ============================================================

import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';

const JWT_SECRET  = process.env.JWT_SECRET  || 'secret123_change_in_production';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

export class AuthService {
  generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES } as jwt.SignOptions);
  }

  verifyToken(token: string): JwtPayload {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  }
}
