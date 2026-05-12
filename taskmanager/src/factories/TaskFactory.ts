// ============================================================
// PATTERN: Factory (Creational)
// Responsibility: Task construction with canonical defaults.
// One place for all creation rules — not spread across handlers.
// ============================================================

import { CreateTaskDTO, TaskStatus, TaskPriority } from '../types';

export class TaskFactory {
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
      status:      dto.status   ?? 'pending',
      priority:    dto.priority ?? 'medium',
      dueDate:     dto.dueDate,
      assignedTo:  dto.assignedTo,
      createdBy:   dto.createdBy,
    };
  }
}
