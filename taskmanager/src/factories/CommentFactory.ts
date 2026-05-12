// ============================================================
// PATTERN: Factory (Creational)
// Responsibility: Comment DTO construction.
// If comments gain attachments or moderation flags, only this file changes.
// ============================================================

import { CreateCommentDTO } from '../types';

export class CommentFactory {
  static create(dto: { text: string; taskId: string; author: string }): CreateCommentDTO {
    return {
      text:   dto.text.trim(),
      taskId: dto.taskId,
      author: dto.author,
    };
  }
}
