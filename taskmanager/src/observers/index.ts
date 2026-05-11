// ============================================================
// PATTERN: Observer (Behavioural)
//
// A typed event system. Services emit events. Observers react.
// The service never knows who is listening or what they do.
//
// WHY: Without this, any cross-cutting concern (logging, email,
// analytics, audit) must be hard-coded inside service methods —
// coupling concerns that have nothing to do with each other.
//
// SOLID:
//   S — Service: emits event. Observer: handles it. One job each.
//   O — Add EmailObserver, AnalyticsObserver = zero changes to services
//   D — Service depends on IAppObserver abstraction
// ============================================================

// ── Event Types ───────────────────────────────────────────────
export type AppEventType =
  | 'USER_REGISTERED'
  | 'USER_LOGGED_IN'
  | 'TASK_CREATED'
  | 'TASK_UPDATED'
  | 'TASK_STATUS_CHANGED'   // special — fires only when status changes
  | 'TASK_COMPLETED'        // special — fires only when status → 'done'
  | 'TASK_DELETED'
  | 'COMMENT_ADDED'
  | 'COMMENT_DELETED';

export interface AppEvent {
  type:      AppEventType;
  payload:   Record<string, unknown>;
  timestamp: Date;
  userId?:   string;         // who triggered it
}

// ── Observer Contract ─────────────────────────────────────────
export interface IAppObserver {
  onEvent(event: AppEvent): void | Promise<void>;
}

// ── EventBus (Subject) ───────────────────────────────────────
export class EventBus {
  private static observers: IAppObserver[] = [];

  // Singleton-style: one bus for the whole app
  // (Could be instance-based; static keeps server.ts wiring simple)
  static subscribe(observer: IAppObserver): void {
    EventBus.observers.push(observer);
  }

  static emit(type: AppEventType, payload: Record<string, unknown>, userId?: string): void {
    const event: AppEvent = { type, payload, timestamp: new Date(), userId };
    for (const observer of EventBus.observers) {
      // Fire-and-forget — sync observers run immediately
      void observer.onEvent(event);
    }
  }

  // Useful for testing — reset all subscribers
  static reset(): void {
    EventBus.observers = [];
  }
}

// ── Concrete Observer 1: Console Logger ──────────────────────
// Logs all events with timestamp, type, and payload.
export class ConsoleLoggerObserver implements IAppObserver {
  onEvent(event: AppEvent): void {
    const ts   = event.timestamp.toISOString();
    const user = event.userId ? ` [user:${event.userId}]` : '';
    console.log(`[${ts}]${user} [${event.type}]`, JSON.stringify(event.payload));
  }
}

// ── Concrete Observer 2: Task Completion Notifier ─────────────
// Reacts ONLY to TASK_COMPLETED events.
// Simulates sending a notification (would call an email service in production).
// Adding a real EmailService here = zero changes to TaskService.
export class TaskCompletionNotifier implements IAppObserver {
  onEvent(event: AppEvent): void {
    if (event.type !== 'TASK_COMPLETED') return;
    // In production: inject IEmailService and call it here
    console.log(
      `[NOTIFICATION] Task "${event.payload['title']}" completed by user ${event.userId}. ` +
      `Notification would be sent here.`
    );
  }
}
