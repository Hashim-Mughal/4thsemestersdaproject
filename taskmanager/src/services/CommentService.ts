// ============================================================
// SERVICE: CommentService
// Responsibility: Orchestrate comment business logic.
// ============================================================

import { ICommentRepository } from '../repositories/interfaces/ICommentRepository';
import { ITaskRepository }    from '../repositories/interfaces/ITaskRepository';
import { CommentFactory }     from '../factories/CommentFactory';
import { EventBus }           from '../observers/EventBus';

export class CommentService {
  constructor(
    private readonly commentRepo: ICommentRepository,
    private readonly taskRepo:    ITaskRepository
  ) {}

  async addComment(taskId: string, text: string, userId: string) {
    const task = await this.taskRepo.findById(taskId);
    if (!task) throw new Error('TASK_NOT_FOUND');

    const dto     = CommentFactory.create({ text, taskId, author: userId });
    const comment = await this.commentRepo.save(dto);

    EventBus.emit('COMMENT_ADDED', { taskId, commentId: String(comment._id) }, userId);
    return comment;
  }

  async getComments(taskId: string) {
    const task = await this.taskRepo.findById(taskId);
    if (!task) throw new Error('TASK_NOT_FOUND');
    return this.commentRepo.findByTask(taskId);
  }

  async updateComment(commentId: string, text: string, userId: string) {
    const comment = await this.commentRepo.findById(commentId);
    if (!comment) throw new Error('COMMENT_NOT_FOUND');
    if (String(comment.author) !== userId) throw new Error('FORBIDDEN');
    return this.commentRepo.update(commentId, { text });
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await this.commentRepo.findById(commentId);
    if (!comment) throw new Error('COMMENT_NOT_FOUND');
    if (String(comment.author) !== userId) throw new Error('FORBIDDEN');
    await this.commentRepo.delete(commentId);
    EventBus.emit('COMMENT_DELETED', { commentId }, userId);
  }
}
