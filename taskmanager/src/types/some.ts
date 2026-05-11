// ============================================================
// TYPES: Shared domain types and interfaces
// Single source of truth for all data contracts in the system.
// No logic here — only type definitions.
// ============================================================

import { Types } from 'mongoose';

export type TaskStatus   = 'pending' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';
export type UserRole     = 'user' | 'admin';

// ── User ─────────────────────────────────────────────────────
export interface IUser {
  _id:       Types.ObjectId;
  name:      string;
  email:     string;
  password:  string;
  role:      UserRole;
  createdAt: Date;
}

export type CreateUserDTO = {
  name:     string;
  email:    string;
  password: string;
  role?:    UserRole;
};

export type LoginDTO = {
  email:    string;
  password: string;
};

export type UpdateUserDTO = Partial<Pick<IUser, 'name' | 'email'>>;

// ── Task ─────────────────────────────────────────────────────
export interface ITask {
  _id:         Types.ObjectId;
  title:       string;
  description: string;
  status:      TaskStatus;
  priority:    TaskPriority;
  dueDate?:    Date;
  assignedTo?: Types.ObjectId;
  createdBy:   Types.ObjectId;
  createdAt:   Date;
  updatedAt:   Date;
}

export type CreateTaskDTO = {
  title:        string;
  description?: string;
  status?:      TaskStatus;
  priority?:    TaskPriority;
  dueDate?:     Date;
  assignedTo?:  string;
  createdBy:    string;
};

export type UpdateTaskDTO = Partial<Omit<CreateTaskDTO, 'createdBy'>>;

export type TaskFilter = {
  createdBy:   string;
  status?:     TaskStatus;
  priority?:   TaskPriority;
  assignedTo?: string;
};

// ── Comment ───────────────────────────────────────────────────
export interface IComment {
  _id:       Types.ObjectId;
  text:      string;
  task:      Types.ObjectId;
  author:    Types.ObjectId;
  createdAt: Date;
}

export type CreateCommentDTO = {
  text:   string;
  taskId: string;
  author: string;
};

export type UpdateCommentDTO = { text: string };

// ── Auth ─────────────────────────────────────────────────────
export interface JwtPayload {
  id:    string;
  email: string;
  role:  UserRole;
}

export interface AuthResult {
  token: string;
  user:  Omit<IUser, 'password'>;
}

// ── Task Stats ───────────────────────────────────────────────
export interface TaskStats {
  pending:      number;
  inProgress:   number;
  done:         number;
  highPriority: number;
  total:        number;
}
