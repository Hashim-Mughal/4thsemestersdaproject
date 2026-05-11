// ============================================================
// PATTERN: Repository (Structural)
//
// Three repositories: IUserRepository, ITaskRepository, ICommentRepository
// Each has: interface (abstraction) + Mongoose implementation (concrete)
//
// WHY: Services never touch Mongoose directly. They program to the
// interface. Swap Mongoose for Prisma or a mock — zero service changes.
//
// SOLID:
//   D — Service depends on IRepository abstraction, not MongooseRepository
//   O — New storage = new class, no edits to existing code
//   L — Any ITaskRepository impl can substitute another
//   I — Each repository exposes only what its consumers need
// ============================================================

import { Types } from 'mongoose';
import { UserModel }    from '../models/User';
import { TaskModel }    from '../models/Task';
import { CommentModel } from '../models/Comment';
import {
  IUser, ITask, IComment,
  CreateUserDTO, UpdateUserDTO,
  CreateTaskDTO, UpdateTaskDTO, TaskFilter,
  CreateCommentDTO, UpdateCommentDTO,
  TaskStats
} from '../types';

// ═══════════════════════════════════════════════════════════
// USER REPOSITORY
// ═══════════════════════════════════════════════════════════
export interface IUserRepository {
  findAll(): Promise<Omit<IUser, 'password'>[]>;
  findById(id: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  save(dto: CreateUserDTO & { password: string }): Promise<IUser>;
  update(id: string, dto: UpdateUserDTO): Promise<Omit<IUser, 'password'> | null>;
  delete(id: string): Promise<boolean>;
}

export class MongoUserRepository implements IUserRepository {
  async findAll() {
    return UserModel.find().select('-password').lean() as Promise<Omit<IUser, 'password'>[]>;
  }

  async findById(id: string) {
    return UserModel.findById(id).lean() as Promise<IUser | null>;
  }

  async findByEmail(email: string) {
    return UserModel.findOne({ email }).lean() as Promise<IUser | null>;
  }

  async save(dto: CreateUserDTO & { password: string }) {
    const user = new UserModel(dto);
    await user.save();
    return user.toObject() as unknown as IUser;
  }

  async update(id: string, dto: UpdateUserDTO) {
    return UserModel.findByIdAndUpdate(id, dto, { new: true, runValidators: true })
      .select('-password')
      .lean() as Promise<Omit<IUser, 'password'> | null>;
  }

  async delete(id: string) {
    const result = await UserModel.findByIdAndDelete(id);
    return !!result;
  }
}

// ═══════════════════════════════════════════════════════════
// TASK REPOSITORY
// ═══════════════════════════════════════════════════════════
export interface ITaskRepository {
  findAll(filter: TaskFilter): Promise<ITask[]>;
  findById(id: string): Promise<ITask | null>;
  save(dto: CreateTaskDTO): Promise<ITask>;
  update(id: string, dto: UpdateTaskDTO): Promise<ITask | null>;
  delete(id: string): Promise<boolean>;
  getStats(userId: string): Promise<TaskStats>;
}

export class MongoTaskRepository implements ITaskRepository {
  async findAll(filter: TaskFilter) {
    // Build Mongoose query from typed filter — no raw object manipulation in service
    const query: Record<string, unknown> = { createdBy: filter.createdBy };
    if (filter.status)     query['status']     = filter.status;
    if (filter.priority)   query['priority']   = filter.priority;
    if (filter.assignedTo) query['assignedTo'] = filter.assignedTo;

    return TaskModel.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .lean() as Promise<ITask[]>;
  }

  async findById(id: string) {
    return TaskModel.findById(id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .lean() as Promise<ITask | null>;
  }

  async save(dto: CreateTaskDTO) {
    const task = new TaskModel(dto);
    await task.save();
    return task.toObject() as unknown as ITask;
  }

  async update(id: string, dto: UpdateTaskDTO) {
    return TaskModel.findByIdAndUpdate(
      id,
      { ...dto, updatedAt: new Date() },
      { new: true }
    ).lean() as Promise<ITask | null>;
  }

  async delete(id: string) {
    const result = await TaskModel.findByIdAndDelete(id);
    return !!result;
  }

  async getStats(userId: string): Promise<TaskStats> {
    const [pending, inProgress, done, highPriority] = await Promise.all([
      TaskModel.countDocuments({ createdBy: userId, status: 'pending' }),
      TaskModel.countDocuments({ createdBy: userId, status: 'in-progress' }),
      TaskModel.countDocuments({ createdBy: userId, status: 'done' }),
      TaskModel.countDocuments({ createdBy: userId, priority: 'high' }),
    ]);
    return {
      pending,
      inProgress,
      done,
      highPriority,
      total: pending + inProgress + done
    };
  }
}

// ═══════════════════════════════════════════════════════════
// COMMENT REPOSITORY
// ═══════════════════════════════════════════════════════════
export interface ICommentRepository {
  findByTask(taskId: string): Promise<IComment[]>;
  findById(id: string): Promise<IComment | null>;
  save(dto: CreateCommentDTO): Promise<IComment>;
  update(id: string, dto: UpdateCommentDTO): Promise<IComment | null>;
  delete(id: string): Promise<boolean>;
}

export class MongoCommentRepository implements ICommentRepository {
  async findByTask(taskId: string) {
    return CommentModel.find({ task: taskId })
      .populate('author', 'name email')
      .sort({ createdAt: 1 })
      .lean() as Promise<IComment[]>;
  }

  async findById(id: string) {
    return CommentModel.findById(id).lean() as Promise<IComment | null>;
  }

  async save(dto: CreateCommentDTO) {
    const comment = new CommentModel({
      text:   dto.text,
      task:   new Types.ObjectId(dto.taskId),
      author: new Types.ObjectId(dto.author),
    });
    await comment.save();
    const populated = await comment.populate('author', 'name email');
    return populated.toObject() as unknown as IComment;
  }

  async update(id: string, dto: UpdateCommentDTO) {
    return CommentModel.findByIdAndUpdate(id, dto, { new: true })
      .populate('author', 'name email')
      .lean() as Promise<IComment | null>;
  }

  async delete(id: string) {
    const result = await CommentModel.findByIdAndDelete(id);
    return !!result;
  }
}
