# Task Manager API

A RESTful Task Management API built with **TypeScript**, **Express**, and **MongoDB**, developed as a 4th Semester Software Design & Architecture (SDA) project. The codebase is a hands-on demonstration of **SOLID principles** and six classic **Gang of Four design patterns**.

---

## Features

- JWT-based authentication with role-based access control (user / admin)
- Full CRUD for tasks, users, and comments
- Task filtering by status (`pending`, `in-progress`, `done`) and priority (`low`, `medium`, `high`)
- Task assignment, due dates, and a stats summary endpoint
- Event-driven notifications via an internal event bus
- Clean, interface-driven architecture — swap MongoDB for PostgreSQL or console logging for email by changing **one line** in `server.ts`

---

## Design Patterns Implemented

| Pattern | Where | Purpose |
|---|---|---|
| **Factory** | `factories/` | Centralized object creation for Tasks, Users, and Comments |
| **Repository** | `repositories/` | Abstracts all database access behind interfaces |
| **Decorator** | `LoggingTaskRepositoryDecorator` | Wraps the task repo to add logging without modifying it |
| **Observer** | `observers/EventBus` | Publishes task events to `ConsoleLoggerObserver` and `TaskCompletionNotifier` |
| **Strategy** | `strategies/NotificationService` | Swappable notification backends (console / email) |
| **Command** | `commands/TaskCommandInvoker` | Encapsulates create/update/delete operations as command objects |

---

## Tech Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express 5
- **Database:** MongoDB via Mongoose
- **Auth:** JWT + bcryptjs
- **Dev tools:** ts-node, nodemon

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Installation

```bash
git clone https://github.com/Hashim-Mughal/4thsemestersdaproject.git
cd 4thsemestersdaproject/taskmanager
npm install
```

### Environment Variables

Create a `.env` file in the `taskmanager/` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=your_jwt_secret_here
```

### Running the App

```bash
npm run dev
npm run build
npm start
```

---

## API Endpoints

### Auth & Users — `/api/users`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | Public | Register a new user |
| POST | `/login` | Public | Login and receive JWT |
| GET | `/profile` | User | Get own profile |
| PUT | `/profile` | User | Update own profile |
| GET | `/` | Admin | List all users |
| DELETE | `/:id` | Admin | Delete a user |

### Tasks — `/api/tasks`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | User | Create a task |
| GET | `/` | User | Get all tasks |
| GET | `/stats/summary` | User | Get task statistics |
| GET | `/:id` | User | Get task by ID |
| PUT | `/:id` | User | Update a task |
| DELETE | `/:id` | User | Delete a task |

### Comments — `/api/tasks/:taskId/comments`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | User | Add a comment |
| GET | `/` | User | Get all comments for a task |

---

## Project Structure

```
taskmanager/src/
├── commands/       # Command pattern — task mutations
├── controllers/    # Request handlers (no business logic)
├── factories/      # Object creation
├── middleware/     # JWT auth guard
├── models/         # Mongoose schemas
├── observers/      # EventBus + observers
├── repositories/   # DB access + Decorator
├── routes/         # URL-to-controller wiring
├── services/       # Business logic
├── strategies/     # Notification strategies
├── types/          # Shared TypeScript interfaces & DTOs
└── server.ts       # Composition root — all wiring lives here
```
