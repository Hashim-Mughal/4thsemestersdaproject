import { IComment, CreateCommentDTO, UpdateCommentDTO } from '../../types';

export interface ICommentRepository {
  findByTask(taskId: string): Promise<IComment[]>;
  findById(id: string): Promise<IComment | null>;
  save(dto: CreateCommentDTO): Promise<IComment>;
  update(id: string, dto: UpdateCommentDTO): Promise<IComment | null>;
  delete(id: string): Promise<boolean>;
}
