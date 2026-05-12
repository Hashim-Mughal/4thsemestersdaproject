import { Request, Response } from 'express';
import { TaskService }       from '../services/TaskService';
import { TaskFilter }        from '../types';
import { TaskCommandInvoker, CreateTaskCommand, UpdateTaskCommand, DeleteTaskCommand } from '../commands';

function httpStatus(err: Error): number {
  const map: Record<string, number> = {
    'TASK_NOT_FOUND': 404,
    'FORBIDDEN':      403,
  };
  return map[err.message] ?? 500;
}

// ============================================================
// CONTROLLER: TaskController
// Responsibility: HTTP adapter for task operations.
//
// PATTERN: Command (Behavioural)
// Write operations (create, update, delete) are wrapped in Command
// objects and executed via TaskCommandInvoker — enabling timing,
// audit logging, and retry at the Invoker level with zero impact
// on TaskService or the concrete Command classes.
//
// Read operations call the service directly (no side effects).
// ============================================================
export class TaskController {
  constructor(
    private readonly service: TaskService,
    private readonly invoker: TaskCommandInvoker
  ) {}

  // ── Writes — routed through Command + Invoker ─────────────

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.body.title) {
        res.status(400).json({ message: 'title is required' });
        return;
      }
      const task = await this.invoker.run(
        new CreateTaskCommand(this.service, req.body, req.user!.id)
      );
      res.status(201).json(task);
    } catch (err) {
      res.status(httpStatus(err as Error)).json({ message: (err as Error).message });
    }
  };

  update = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
      const task = await this.invoker.run(
        new UpdateTaskCommand(this.service, req.params.id, req.body, req.user!.id)
      );
      res.status(200).json(task);
    } catch (err) {
      res.status(httpStatus(err as Error)).json({ message: (err as Error).message });
    }
  };

  delete = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
      await this.invoker.run(
        new DeleteTaskCommand(this.service, req.params.id, req.user!.id)
      );
      res.status(200).json({ message: 'Task deleted' });
    } catch (err) {
      res.status(httpStatus(err as Error)).json({ message: (err as Error).message });
    }
  };

  // ── Reads — direct service calls ──────────────────────────

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const filter: TaskFilter = {
        createdBy:  req.user!.id,
        status:     req.query['status']     as TaskFilter['status'],
        priority:   req.query['priority']   as TaskFilter['priority'],
        assignedTo: req.query['assignedTo'] as string,
      };
      const tasks = await this.service.getAllTasks(filter);
      res.status(200).json(tasks);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  };

  getById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
      const task = await this.service.getTaskById(req.params.id, req.user!.id);
      res.status(200).json(task);
    } catch (err) {
      res.status(httpStatus(err as Error)).json({ message: (err as Error).message });
    }
  };

  getStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.service.getTaskStats(req.user!.id);
      res.status(200).json(stats);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  };
}
