import { Request, Response } from 'express';
import { CommentService }    from '../services/CommentService';

function httpStatus(err: Error): number {
  const map: Record<string, number> = {
    'TASK_NOT_FOUND':    404,
    'COMMENT_NOT_FOUND': 404,
    'FORBIDDEN':         403,
  };
  return map[err.message] ?? 500;
}

// ============================================================
// CONTROLLER: CommentController
// Responsibility: HTTP adapter for comment operations.
// ============================================================
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
