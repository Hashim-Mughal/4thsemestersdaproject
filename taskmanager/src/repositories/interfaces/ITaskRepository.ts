import { ITask, CreateTaskDTO, UpdateTaskDTO, TaskFilter, TaskStats } from '../../types';

export interface ITaskRepository {
  findAll(filter: TaskFilter): Promise<ITask[]>;
  findById(id: string): Promise<ITask | null>;
  save(dto: CreateTaskDTO): Promise<ITask>;
  update(id: string, dto: UpdateTaskDTO): Promise<ITask | null>;
  delete(id: string): Promise<boolean>;
  getStats(userId: string): Promise<TaskStats>;
}
