// ============================================================
// PATTERN: Repository (Structural)
// Concrete MongoDB implementation of ICommentRepository.
// ============================================================

import { Types }         from 'mongoose';
import { CommentModel }  from '../models/Comment';
import { ICommentRepository } from './interfaces/ICommentRepository';
import { IComment, CreateCommentDTO, UpdateCommentDTO } from '../types';

export class MongoCommentRepository implements ICommentRepository {
  async findByTask(taskId: string): Promise<IComment[]> {
    return CommentModel.find({ task: taskId })
      .populate('author', 'name email')
      .sort({ createdAt: 1 })
      .lean() as Promise<IComment[]>;
  }

  async findById(id: string): Promise<IComment | null> {
    return CommentModel.findById(id).lean() as Promise<IComment | null>;
  }

  async save(dto: CreateCommentDTO): Promise<IComment> {
    const comment = new CommentModel({
      text:   dto.text,
      task:   new Types.ObjectId(dto.taskId),
      author: new Types.ObjectId(dto.author),
    });
    await comment.save();
    const populated = await comment.populate('author', 'name email');
    return populated.toObject() as unknown as IComment;
  }

  async update(id: string, dto: UpdateCommentDTO): Promise<IComment | null> {
    return CommentModel.findByIdAndUpdate(id, dto, { new: true })
      .populate('author', 'name email')
      .lean() as Promise<IComment | null>;
  }

  async delete(id: string): Promise<boolean> {
    const result = await CommentModel.findByIdAndDelete(id);
    return !!result;
  }
}
