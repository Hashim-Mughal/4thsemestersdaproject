// ============================================================
// PATTERN: Factory (Creational)
//
// Three factories: UserFactory, TaskFactory, CommentFactory
//
// WHY: No caller should ever know HOW an entity is constructed.
// Default values, required transformations (hashing), and
// validation of construction inputs all live here — nowhere else.
//
// SOLID:
//   S — Creation responsibility is here, not in services/controllers
//   O — New creation rules = edit factory only, not callers
//   D — Services depend on factory methods (abstraction), not `new Model()`
// ============================================================

import bcrypt from 'bcryptjs';
import { CreateUserDTO, CreateTaskDTO, CreateCommentDTO, UserRole, TaskStatus, TaskPriority } from '../types';

// ─── USER FACTORY ─────────────────────────────────────────────
export class UserFactory {
  /**
   * Produces a ready-to-persist user DTO with:
   * - hashed password (bcrypt, 12 rounds)
   * - role defaulted to 'user'
   * Callers never touch bcrypt directly.
   */
  static async create(dto: CreateUserDTO): Promise<CreateUserDTO & { password: string }> {
    const salt   = await bcrypt.genSalt(12);   // 12 rounds — more secure than before's 10
    const hashed = await bcrypt.hash(dto.password, salt);

    return {
      name:     dto.name.trim(),
      email:    dto.email.toLowerCase().trim(),
      password: hashed,
      role:     dto.role ?? ('user' as UserRole),   // default in ONE place
    };
  }

  /**
   * Verify a plaintext password against a stored hash.
   * Centralised — if we swap bcrypt for argon2, one change here.
   */
  static async verifyPassword(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}

// ─── TASK FACTORY ─────────────────────────────────────────────
export class TaskFactory {
  /**
   * Produces a fully-formed CreateTaskDTO with:
   * - status defaulted to 'pending'
   * - priority defaulted to 'medium'
   * - description defaulted to empty string
   * One canonical source of defaults — not spread across route handlers.
   */
  static create(dto: {
    title:        string;
    description?: string;
    status?:      TaskStatus;
    priority?:    TaskPriority;
    dueDate?:     Date;
    assignedTo?:  string;
    createdBy:    string;
  }): CreateTaskDTO {
    return {
      title:       dto.title.trim(),
      description: dto.description?.trim() ?? '',
      status:      dto.status      ?? 'pending',
      priority:    dto.priority    ?? 'medium',
      dueDate:     dto.dueDate,
      assignedTo:  dto.assignedTo,
      createdBy:   dto.createdBy,
    };
  }
}

// ─── COMMENT FACTORY ─────────────────────────────────────────
export class CommentFactory {
  /**
   * Produces a CreateCommentDTO.
   * Simple now — but if comments gain attachments, mentions, or
   * moderation flags, this is the only file that changes.
   */
  static create(dto: { text: string; taskId: string; author: string }): CreateCommentDTO {
    return {
      text:   dto.text.trim(),
      taskId: dto.taskId,
      author: dto.author,
    };
  }
}
