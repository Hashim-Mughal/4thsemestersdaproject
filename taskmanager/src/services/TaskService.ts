// ============================================================
// SERVICE: TaskService
// Responsibility: Orchestrate task business logic.
//
// Key design: status change detection happens HERE in the
// service — not in the route. When status → 'done', the service
// emits TASK_COMPLETED. The TaskCompletionNotifier in observers
// reacts to that — zero coupling between the two.
// ============================================================

import { ITaskRepository, IUserRepository } from '../repositories';
import { TaskFactory }   from '../factories';
import { EventBus }      from '../observers';
import { NotificationService } from '../strategies';
import { CreateTaskDTO, UpdateTaskDTO, TaskFilter, TaskStatus } from '../types';

export class TaskService {
  constructor(
    private readonly taskRepo:   ITaskRepository,
    private readonly userRepo:   IUserRepository,
    private readonly notifier:   NotificationService
  ) {}

  async createTask(dto: Omit<CreateTaskDTO, 'createdBy'>, userId: string) {
    // Factory builds the DTO with proper defaults — service doesn't hardcode them
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

    // Detect status change BEFORE updating
    const statusChanged = dto.status && dto.status !== existing.status;
    const isCompleted   = dto.status === 'done' as TaskStatus && existing.status !== 'done';

    const updated = await this.taskRepo.update(id, dto);
    if (!updated) throw new Error('TASK_NOT_FOUND');

    // Emit granular events — observers decide what to do
    EventBus.emit('TASK_UPDATED', { id, changes: dto }, userId);

    if (statusChanged) {
      EventBus.emit('TASK_STATUS_CHANGED', {
        id,
        from: existing.status,
        to:   dto.status
      }, userId);
    }

    if (isCompleted) {
      // TASK_COMPLETED triggers TaskCompletionNotifier automatically
      EventBus.emit('TASK_COMPLETED', { id, title: updated.title }, userId);

      // Also send notification via Strategy
      await this.notifier.notify({
        recipient: userId,  // in real app: look up user email
        subject:   'Task Completed!',
        message:   `Your task "${updated.title}" has been marked as done.`
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
