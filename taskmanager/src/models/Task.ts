// ============================================================
// MODEL: Task
// Responsibility: Define Mongoose schema ONLY.
// ============================================================

import mongoose, { Schema, Document } from 'mongoose';
import { ITask, TaskStatus, TaskPriority } from '../types';

export interface TaskDocument extends Omit<ITask, '_id'>, Document {}

const TaskSchema = new Schema<TaskDocument>({
  title:       { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  status:      { type: String, enum: ['pending', 'in-progress', 'done'], default: 'pending' as TaskStatus },
  priority:    { type: String, enum: ['low', 'medium', 'high'], default: 'medium' as TaskPriority },
  dueDate:     { type: Date },
  assignedTo:  { type: Schema.Types.ObjectId, ref: 'User' },
  createdBy:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt:   { type: Date, default: Date.now },
  updatedAt:   { type: Date, default: Date.now }
});

export const TaskModel = mongoose.model<TaskDocument>('Task', TaskSchema);
