// PATTERN: Command (Behavioural) — Concrete Command
// Encapsulates an updateTask call with all its parameters.

import { ICommand }    from './interfaces/ICommand';
import { TaskService } from '../services/TaskService';
import { ITask, UpdateTaskDTO } from '../types';

export class UpdateTaskCommand implements ICommand<ITask> {
  constructor(
    private readonly service: TaskService,
    private readonly id:      string,
    private readonly dto:     UpdateTaskDTO,
    private readonly userId:  string
  ) {}

  execute(): Promise<ITask> {
    return this.service.updateTask(this.id, this.dto, this.userId);
  }
}
