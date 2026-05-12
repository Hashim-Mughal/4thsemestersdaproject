import { Request, Response } from 'express';
import { UserService } from '../services/UserService';

// Centralised error → HTTP status mapping
function httpStatus(err: Error): number {
  const map: Record<string, number> = {
    'EMAIL_TAKEN':         409,
    'INVALID_CREDENTIALS': 401,
    'USER_NOT_FOUND':      404,
  };
  return map[err.message] ?? 500;
}

// ============================================================
// CONTROLLER: UserController
// Responsibility: HTTP adapter for user operations.
// Reads request → calls UserService → sends response. Nothing else.
// ============================================================
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
