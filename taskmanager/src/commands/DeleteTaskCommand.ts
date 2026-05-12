// PATTERN: Command (Behavioural) — Concrete Command
// Encapsulates a deleteTask call with all its parameters.

import { ICommand }    from './interfaces/ICommand';
import { TaskService } from '../services/TaskService';

export class DeleteTaskCommand implements ICommand<void> {
  constructor(
    private readonly service: TaskService,
    private readonly id:      string,
    private readonly userId:  string
  ) {}

  execute(): Promise<void> {
    return this.service.deleteTask(this.id, this.userId);
  }
}
