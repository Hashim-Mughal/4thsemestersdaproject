// ============================================================
// ENTRY POINT: server.ts — The Composition Root
//
// This is the ONLY file that instantiates concrete classes.
// Everything else in the codebase sees only interfaces.
//
// Dependency graph (built manually top-down):
//
//   Infrastructure:
//     MongoUserRepository, MongoTaskRepository, MongoCommentRepository
//
//   Cross-cutting:
//     EventBus  ← ConsoleLoggerObserver, TaskCompletionNotifier
//     NotificationService ← ConsoleNotificationStrategy
//     AuthService
//
//   Services (inject repos + cross-cutting):
//     UserService, TaskService, CommentService
//
//   Controllers (inject services):
//     UserController, TaskController, CommentController
//
//   Routes (inject controllers):
//     createUserRouter, createTaskRouter, createCommentRouter
//
// To switch MongoDB → PostgreSQL: replace Mongo* repos here.
// To switch Console → Email notifications: swap strategy here.
// Nothing else changes.
// ============================================================

import express   from 'express';
import mongoose  from 'mongoose';
import cors      from 'cors';
import dotenv    from 'dotenv';
dotenv.config();

// Infrastructure
import { MongoUserRepository, MongoTaskRepository, MongoCommentRepository } from './repositories';

// Cross-cutting
import { EventBus, ConsoleLoggerObserver, TaskCompletionNotifier } from './observers';
import { ConsoleNotificationStrategy, NotificationService }        from './strategies';
import { AuthService }                                              from './services/AuthService';

// Services
import { UserService }    from './services/UserService';
import { TaskService }    from './services/TaskService';
import { CommentService } from './services/CommentService';

// Controllers
import { UserController, TaskController, CommentController } from './controllers';

// Routes
import { createUserRouter, createTaskRouter, createCommentRouter } from './routes';

// ── Bootstrap ─────────────────────────────────────────────────
const app      = express();
const PORT     = process.env.PORT     || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/taskmanager';

app.use(cors());          // allow all origins — needed for file:// frontend
app.use(express.json());

// ── Wire Observers ────────────────────────────────────────────
EventBus.subscribe(new ConsoleLoggerObserver());
EventBus.subscribe(new TaskCompletionNotifier());

// ── Wire Notification Strategy ────────────────────────────────
const notificationService = new NotificationService(new ConsoleNotificationStrategy());

// ── Wire Auth Service ─────────────────────────────────────────
const authService = new AuthService();

// ── Wire Repositories ─────────────────────────────────────────
const userRepo    = new MongoUserRepository();
const taskRepo    = new MongoTaskRepository();
const commentRepo = new MongoCommentRepository();

// ── Wire Services ─────────────────────────────────────────────
const userService    = new UserService(userRepo, authService, notificationService);
const taskService    = new TaskService(taskRepo, userRepo, notificationService);
const commentService = new CommentService(commentRepo, taskRepo);

// ── Wire Controllers ──────────────────────────────────────────
const userController    = new UserController(userService);
const taskController    = new TaskController(taskService);
const commentController = new CommentController(commentService);

// ── Mount Routes ──────────────────────────────────────────────
app.use('/api/users',                   createUserRouter(userController));
app.use('/api/tasks',                   createTaskRouter(taskController));
app.use('/api/tasks/:taskId/comments',  createCommentRouter(commentController));

app.get('/', (_req, res) => {
  res.json({
    message: 'Task Manager API — Refactored with SOLID + Design Patterns',
    version: '2.0.0',
    patterns: ['Factory', 'Repository', 'Observer', 'Strategy', 'Layered Architecture']
  });
});

// ── Connect DB + Start Server ─────────────────────────────────
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
