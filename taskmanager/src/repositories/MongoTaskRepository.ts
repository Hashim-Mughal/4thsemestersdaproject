// ============================================================
// PATTERN: Repository (Structural)
// Concrete MongoDB implementation of ITaskRepository.
// ============================================================

import { TaskModel } from '../models/Task';
import { ITaskRepository } from './interfaces/ITaskRepository';
import { ITask, CreateTaskDTO, UpdateTaskDTO, TaskFilter, TaskStats } from '../types';

export class MongoTaskRepository implements ITaskRepository {
  async findAll(filter: TaskFilter): Promise<ITask[]> {
    const query: Record<string, unknown> = { createdBy: filter.createdBy };
    if (filter.status)     query['status']     = filter.status;
    if (filter.priority)   query['priority']   = filter.priority;
    if (filter.assignedTo) query['assignedTo'] = filter.assignedTo;

    return TaskModel.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy',  'name email')
      .sort({ createdAt: -1 })
      .lean() as Promise<ITask[]>;
  }

  async findById(id: string): Promise<ITask | null> {
    return TaskModel.findById(id)
      .populate('assignedTo', 'name email')
      .populate('createdBy',  'name email')
      .lean() as Promise<ITask | null>;
  }

  async save(dto: CreateTaskDTO): Promise<ITask> {
    const task = new TaskModel(dto);
    await task.save();
    return task.toObject() as unknown as ITask;
  }

  async update(id: string, dto: UpdateTaskDTO): Promise<ITask | null> {
    return TaskModel.findByIdAndUpdate(
      id,
      { ...dto, updatedAt: new Date() },
      { new: true }
    ).lean() as Promise<ITask | null>;
  }

  async delete(id: string): Promise<boolean> {
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
      total: pending + inProgress + done,
    };
  }
}
