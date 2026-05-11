// ============================================================
// CONTROLLERS: UserController, TaskController, CommentController
// Responsibility: HTTP adapter — parse request, call service,
//                format response. NOTHING else.
//
// Controllers never touch: repositories, factories, observers,
// strategies, or Mongoose. They call service methods only.
//
// SOLID S: Only handles HTTP concerns.
// SOLID D: Depends on service abstractions injected via constructor.
// ============================================================

import { Request, Response } from 'express';
import { UserService }    from '../services/UserService';
import { TaskService }    from '../services/TaskService';
import { CommentService } from '../services/CommentService';
import { TaskFilter }     from '../types';

// ── Error → HTTP Status mapping ────────────────────────────────
// Centralised so controllers stay clean — no if-else chains
function httpStatus(err: Error): number {
  const map: Record<string, number> = {
    'EMAIL_TAKEN':          409,
    'INVALID_CREDENTIALS':  401,
    'USER_NOT_FOUND':       404,
    'TASK_NOT_FOUND':       404,
    'COMMENT_NOT_FOUND':    404,
    'FORBIDDEN':            403,
  };
  return map[err.message] ?? 500;
}

// ═══════════════════════════════════════════════════════════
// USER CONTROLLER
// ═══════════════════════════════════════════════════════════
export class UserController {
  constructor(private readonly service: UserService) {}

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.register(req.body);
      res.status(201).json(result);
    } catch (err) {
      res.status(httpStatus(err as Error)).json({ message: (err as Error).message });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.service.login(req.body);
      res.status(200).json(result);
    } catch (err) {
      res.status(httpStatus(err as Error)).json({ message: (err as Error).message });
    }
  };

  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await this.service.getProfile(req.user!.id);
      res.status(200).json(user);
    } catch (err) {
      res.status(httpStatus(err as Error)).json({ message: (err as Error).message });
    }
  };

  updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await this.service.updateProfile(req.user!.id, req.body);
      res.status(200).json(user);
    } catch (err) {
      res.status(httpStatus(err as Error)).json({ message: (err as Error).message });
    }
  };

  getAllUsers = async (_req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.service.getAllUsers();
      res.status(200).json(users);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  };

  deleteUser = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
      await this.service.deleteUser(req.params.id);
      res.status(200).json({ message: 'User deleted' });
    } catch (err) {
      res.status(httpStatus(err as Error)).json({ message: (err as Error).message });
    }
  };
}

// ═══════════════════════════════════════════════════════════
// TASK CONTROLLER
// ═══════════════════════════════════════════════════════════
export class TaskController {
  constructor(private readonly service: TaskService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.body.title) {
        res.status(400).json({ message: 'title is required' });
        return;
      }
      const task = await this.service.createTask(req.body, req.user!.id);
      res.status(201).json(task);
    } catch (err) {
      res.status(httpStatus(err as Error)).json({ message: (err as Error).message });
    }
  };

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

  update = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
      const task = await this.service.updateTask(req.params.id, req.body, req.user!.id);
      res.status(200).json(task);
    } catch (err) {
      res.status(httpStatus(err as Error)).json({ message: (err as Error).message });
    }
  };

  delete = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
      await this.service.deleteTask(req.params.id, req.user!.id);
      res.status(200).json({ message: 'Task deleted' });
    } catch (err) {
      res.status(httpStatus(err as Error)).json({ message: (err as Error).message });
    }
  };

  getStats = async (_req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.service.getTaskStats(_req.user!.id);
      res.status(200).json(stats);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  };
}

// ═══════════════════════════════════════════════════════════
// COMMENT CONTROLLER
// ═══════════════════════════════════════════════════════════
export class CommentController {
  constructor(private readonly service: CommentService) {}

  add = async (req: Request<{ taskId: string }>, res: Response): Promise<void> => {
    try {
      if (!req.body.text) {
        res.status(400).json({ message: 'text is required' });
        return;
      }
      const comment = await this.service.addComment(req.params.taskId, req.body.text, req.user!.id);
      res.status(201).json(comment);
    } catch (err) {
      res.status(httpStatus(err as Error)).json({ message: (err as Error).message });
    }
  };

  getAll = async (req: Request<{ taskId: string }>, res: Response): Promise<void> => {
    try {
      const comments = await this.service.getComments(req.params.taskId);
      res.status(200).json(comments);
    } catch (err) {
      res.status(httpStatus(err as Error)).json({ message: (err as Error).message });
    }
  };

  update = async (req: Request<{ taskId: string; commentId: string }>, res: Response): Promise<void> => {
    try {
      const comment = await this.service.updateComment(req.params.commentId, req.body.text, req.user!.id);
      res.status(200).json(comment);
    } catch (err) {
      res.status(httpStatus(err as Error)).json({ message: (err as Error).message });
    }
  };

  delete = async (req: Request<{ taskId: string; commentId: string }>, res: Response): Promise<void> => {
    try {
      await this.service.deleteComment(req.params.commentId, req.user!.id);
      res.status(200).json({ message: 'Comment deleted' });
    } catch (err) {
      res.status(httpStatus(err as Error)).json({ message: (err as Error).message });
    }
  };
}
