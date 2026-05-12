// PATTERN: Command (Behavioural) — Concrete Command
// Encapsulates a createTask call with all its parameters.

import { ICommand }    from './interfaces/ICommand';
import { TaskService } from '../services/TaskService';
import { ITask, CreateTaskDTO } from '../types';

export class CreateTaskCommand implements ICommand<ITask> {
  constructor(
    private readonly service: TaskService,
    private readonly dto:     Omit<CreateTaskDTO, 'createdBy'>,
    private readonly userId:  string
  ) {}

  execute(): Promise<ITask> {
    return this.service.createTask(this.dto, this.userId);
  }
}
