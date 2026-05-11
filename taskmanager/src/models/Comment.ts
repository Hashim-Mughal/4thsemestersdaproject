// ============================================================
// MODEL: Comment
// Responsibility: Define Mongoose schema ONLY.
// ============================================================

import mongoose, { Schema, Document } from 'mongoose';
import { IComment } from '../types';

export interface CommentDocument extends Omit<IComment, '_id'>, Document {}

const CommentSchema = new Schema<CommentDocument>({
  text:      { type: String, required: true },
  task:      { type: Schema.Types.ObjectId, ref: 'Task', required: true },
  author:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

export const CommentModel = mongoose.model<CommentDocument>('Comment', CommentSchema);
