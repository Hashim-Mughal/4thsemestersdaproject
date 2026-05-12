// ============================================================
// PATTERN: Factory (Creational)
// Responsibility: User creation and password verification ONLY.
// Callers never touch bcrypt directly.
// ============================================================

import bcrypt from 'bcryptjs';
import { CreateUserDTO, UserRole } from '../types';

export class UserFactory {
  /**
   * Produces a ready-to-persist user DTO:
   * - hashed password (bcrypt, 12 rounds)
   * - role defaulted to 'user'
   */
  static async create(dto: CreateUserDTO): Promise<CreateUserDTO & { password: string }> {
    const salt   = await bcrypt.genSalt(12);
    const hashed = await bcrypt.hash(dto.password, salt);
    return {
      name:     dto.name.trim(),
      email:    dto.email.toLowerCase().trim(),
      password: hashed,
      role:     dto.role ?? ('user' as UserRole),
    };
  }

  /**
   * Verify a plaintext password against a stored hash.
   * If we swap bcrypt for argon2, only this file changes.
   */
  static async verifyPassword(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}
