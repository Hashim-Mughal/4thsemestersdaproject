// ============================================================
// SERVICE: TaskService
// Responsibility: Orchestrate task business logic.
// Status change detection happens here — not in the route.
// ============================================================

import { ITaskRepository }    from '../repositories/interfaces/ITaskRepository';
import { IUserRepository }    from '../repositories/interfaces/IUserRepository';
import { TaskFactory }        from '../factories/TaskFactory';
import { EventBus }           from '../observers/EventBus';
import { NotificationService } from '../strategies/NotificationService';
import { CreateTaskDTO, UpdateTaskDTO, TaskFilter, TaskStatus } from '../types';

export class TaskService {
  constructor(
    private readonly taskRepo:  ITaskRepository,
    private readonly userRepo:  IUserRepository,
    private readonly notifier:  NotificationService
  ) {}

  async createTask(dto: Omit<CreateTaskDTO, 'createdBy'>, userId: string) {
    const taskDTO = TaskFactory.create({ ...dto, createdBy: userId });
    const task    = await this.taskRepo.save(taskDTO);
    EventBus.emit('TASK_CREATED', { id: String(task._id), title: task.title }, userId);
    return task;
  }

  async getAllTasks(filter: TaskFilter) {
    return this.taskRepo.findAll(filter);
  }

  async getTaskById(id: string, userId: string) {
    const task = await this.taskRepo.findById(id);
    if (!task) throw new Error('TASK_NOT_FOUND');
    if (String(task.createdBy) !== userId) throw new Error('FORBIDDEN');
    return task;
  }

  async updateTask(id: string, dto: UpdateTaskDTO, userId: string) {
    const existing = await this.taskRepo.findById(id);
    if (!existing) throw new Error('TASK_NOT_FOUND');
    if (String(existing.createdBy) !== userId) throw new Error('FORBIDDEN');

    const statusChanged = dto.status && dto.status !== existing.status;
    const isCompleted   = dto.status === ('done' as TaskStatus) && existing.status !== 'done';

    const updated = await this.taskRepo.update(id, dto);
    if (!updated) throw new Error('TASK_NOT_FOUND');

    EventBus.emit('TASK_UPDATED', { id, changes: dto }, userId);

    if (statusChanged) {
      EventBus.emit('TASK_STATUS_CHANGED', { id, from: existing.status, to: dto.status }, userId);
    }

    if (isCompleted) {
      EventBus.emit('TASK_COMPLETED', { id, title: updated.title }, userId);
      await this.notifier.notify({
        recipient: userId,
        subject:   'Task Completed!',
        message:   `Your task "${updated.title}" has been marked as done.`,
      });
    }

    return updated;
  }

  async deleteTask(id: string, userId: string) {
    const task = await this.taskRepo.findById(id);
    if (!task) throw new Error('TASK_NOT_FOUND');
    if (String(task.createdBy) !== userId) throw new Error('FORBIDDEN');
    await this.taskRepo.delete(id);
    EventBus.emit('TASK_DELETED', { id, title: task.title }, userId);
  }

  async getTaskStats(userId: string) {
    return this.taskRepo.getStats(userId);
  }
}
