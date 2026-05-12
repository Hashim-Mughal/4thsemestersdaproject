// ============================================================
// PATTERN: Decorator (Structural)
//
// Wraps any ITaskRepository and adds structured timing logs
// to every method call — without modifying MongoTaskRepository
// or TaskService.
//
// SOLID:
//   S — MongoTaskRepository stores. Decorator logs. One job each.
//   O — Want caching? Write CachingTaskRepositoryDecorator. Zero edits here.
//   L — Fully substitutable for ITaskRepository.
//   D — TaskService sees only ITaskRepository. Decorator is invisible to it.
// ============================================================

import { ITaskRepository }   from '../interfaces/ITaskRepository';
import { ITask, CreateTaskDTO, UpdateTaskDTO, TaskFilter, TaskStats } from '../../types';

export class LoggingTaskRepositoryDecorator implements ITaskRepository {
  constructor(private readonly wrapped: ITaskRepository) {}

  async findAll(filter: TaskFilter): Promise<ITask[]> {
    const start  = Date.now();
    const result = await this.wrapped.findAll(filter);
    console.log(`[REPO] findAll → ${result.length} task(s) (${Date.now() - start}ms)`);
    return result;
  }

  async findById(id: string): Promise<ITask | null> {
    const start  = Date.now();
    const result = await this.wrapped.findById(id);
    console.log(`[REPO] findById(${id}) → ${result ? 'found' : 'not found'} (${Date.now() - start}ms)`);
    return result;
  }

  async save(dto: CreateTaskDTO): Promise<ITask> {
    const start  = Date.now();
    const result = await this.wrapped.save(dto);
    console.log(`[REPO] save "${dto.title}" → id:${String(result._id)} (${Date.now() - start}ms)`);
    return result;
  }

  async update(id: string, dto: UpdateTaskDTO): Promise<ITask | null> {
    const start  = Date.now();
    const result = await this.wrapped.update(id, dto);
    console.log(`[REPO] update(${id}) → ${result ? 'updated' : 'not found'} (${Date.now() - start}ms)`);
    return result;
  }

  async delete(id: string): Promise<boolean> {
    const start  = Date.now();
    const result = await this.wrapped.delete(id);
    console.log(`[REPO] delete(${id}) → ${result} (${Date.now() - start}ms)`);
    return result;
  }

  async getStats(userId: string): Promise<TaskStats> {
    const start  = Date.now();
    const result = await this.wrapped.getStats(userId);
    console.log(`[REPO] getStats(${userId}) → total:${result.total} (${Date.now() - start}ms)`);
    return result;
  }
}
