// ============================================================
// MODEL: User
// Responsibility: Define Mongoose schema and document type ONLY.
// No business logic, no creation logic, no hashing here.
// SOLID — S: One reason to change (schema shape changes only).
// ============================================================

import mongoose, { Schema, Document } from 'mongoose';
import { IUser, UserRole } from '../types';

export interface UserDocument extends Omit<IUser, '_id'>, Document {}

const UserSchema = new Schema<UserDocument>({
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true },
  password:  { type: String, required: true },
  role:      { type: String, enum: ['user', 'admin'], default: 'user' as UserRole },
  createdAt: { type: Date, default: Date.now }
});

export const UserModel = mongoose.model<UserDocument>('User', UserSchema);
