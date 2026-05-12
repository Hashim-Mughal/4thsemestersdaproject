// ============================================================
// BARREL: repositories/index.ts
// Re-exports everything from the repositories module so that
// consumers (services, server.ts) use a single clean import:
//   import { ITaskRepository, MongoTaskRepository, ... } from '../repositories'
// ============================================================

export type { IUserRepository }    from './interfaces/IUserRepository';
export type { ITaskRepository }    from './interfaces/ITaskRepository';
export type { ICommentRepository } from './interfaces/ICommentRepository';

export { MongoUserRepository }    from './MongoUserRepository';
export { MongoTaskRepository }    from './MongoTaskRepository';
export { MongoCommentRepository } from './MongoCommentRepository';

export { LoggingTaskRepositoryDecorator } from './decorators/LoggingTaskRepositoryDecorator';
