// ============================================================
// ENTRY POINT: server.ts — The Composition Root
//
// The ONLY file that instantiates concrete classes.
// Every other file depends on interfaces — never on concretes.
//
// Dependency graph (wired top-down):
//
//   Infrastructure:
//     MongoUserRepository
//     LoggingTaskRepositoryDecorator ← MongoTaskRepository  [PATTERN: Decorator]
//     MongoCommentRepository
//
//   Cross-cutting:
//     EventBus ← ConsoleLoggerObserver, TaskCompletionNotifier [PATTERN: Observer]
//     NotificationService ← ConsoleNotificationStrategy        [PATTERN: Strategy]
//     AuthService
//
//   Services (inject repos + cross-cutting):
//     UserService, TaskService, CommentService
//
//   Commands + Invoker:
//     TaskCommandInvoker                                        [PATTERN: Command]
//
//   Controllers (inject services + invoker):
//     UserController, TaskController, CommentController
//
//   Routes (inject controllers):
//     createUserRouter, createTaskRouter, createCommentRouter
//
// To swap MongoDB → PostgreSQL : replace Mongo* repos here only.
// To swap Console → Email notif: replace strategy here only.
// Nothing else changes.
// ============================================================

import express  from 'express';
import mongoose from 'mongoose';
import cors     from 'cors';
import dotenv   from 'dotenv';
dotenv.config();

// ── Repositories ──────────────────────────────────────────────
import { MongoUserRepository }            from './repositories/MongoUserRepository';
import { MongoTaskRepository }            from './repositories/MongoTaskRepository';
import { MongoCommentRepository }         from './repositories/MongoCommentRepository';
import { LoggingTaskRepositoryDecorator } from './repositories/decorators/LoggingTaskRepositoryDecorator';

// ── Observers ─────────────────────────────────────────────────
import { EventBus }               from './observers/EventBus';
import { ConsoleLoggerObserver }  from './observers/ConsoleLoggerObserver';
import { TaskCompletionNotifier } from './observers/TaskCompletionNotifier';

// ── Strategies ────────────────────────────────────────────────
import { ConsoleNotificationStrategy } from './strategies/ConsoleNotificationStrategy';
import { NotificationService }         from './strategies/NotificationService';

// ── Services ──────────────────────────────────────────────────
import { AuthService }    from './services/AuthService';
import { UserService }    from './services/UserService';
import { TaskService }    from './services/TaskService';
import { CommentService } from './services/CommentService';

// ── Commands ──────────────────────────────────────────────────
import { TaskCommandInvoker } from './commands/TaskCommandInvoker';

// ── Controllers ───────────────────────────────────────────────
import { UserController }    from './controllers/UserController';
import { TaskController }    from './controllers/TaskController';
import { CommentController } from './controllers/CommentController';

// ── Routes ────────────────────────────────────────────────────
import { createUserRouter }    from './routes/userRoutes';
import { createTaskRouter }    from './routes/taskRoutes';
import { createCommentRouter } from './routes/commentRoutes';

// ── Bootstrap ─────────────────────────────────────────────────
const app       = express();
const PORT      = process.env.PORT      || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/taskmanager';

app.use(cors());
app.use(express.json());

// ── Wire Observers ────────────────────────────────────────────
EventBus.subscribe(new ConsoleLoggerObserver());
EventBus.subscribe(new TaskCompletionNotifier());

// ── Wire Strategy ─────────────────────────────────────────────
const notificationService = new NotificationService(new ConsoleNotificationStrategy());

// ── Wire Auth ─────────────────────────────────────────────────
const authService = new AuthService();

// ── Wire Repositories ─────────────────────────────────────────
const userRepo    = new MongoUserRepository();
// PATTERN: Decorator — wraps MongoTaskRepository with logging.
// TaskService sees ITaskRepository only — never knows it's decorated.
const taskRepo    = new LoggingTaskRepositoryDecorator(new MongoTaskRepository());
const commentRepo = new MongoCommentRepository();

// ── Wire Services ─────────────────────────────────────────────
const userService    = new UserService(userRepo, authService, notificationService);
const taskService    = new TaskService(taskRepo, userRepo, notificationService);
const commentService = new CommentService(commentRepo, taskRepo);

// ── Wire Command Invoker ──────────────────────────────────────
// PATTERN: Command — all task mutations flow through this Invoker.
const taskCommandInvoker = new TaskCommandInvoker();

// ── Wire Controllers ──────────────────────────────────────────
const userController    = new UserController(userService);
const taskController    = new TaskController(taskService, taskCommandInvoker);
const commentController = new CommentController(commentService);

// ── Mount Routes ──────────────────────────────────────────────
app.use('/api/users',                  createUserRouter(userController));
app.use('/api/tasks',                  createTaskRouter(taskController));
app.use('/api/tasks/:taskId/comments', createCommentRouter(commentController));

app.get('/', (_req, res) => {
  res.json({
    message:  'Task Manager API — Refactored with SOLID + Design Patterns',
    version:  '2.0.0',
    patterns: ['Factory', 'Repository', 'Decorator', 'Observer', 'Strategy', 'Command'],
  });
});

// ── Connect DB + Start ────────────────────────────────────────
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

export default app;
