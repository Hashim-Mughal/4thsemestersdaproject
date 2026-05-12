// ============================================================
// PATTERN: Observer (Behavioural)
// Contract that every concrete observer must implement.
// ============================================================

export type AppEventType =
  | 'USER_REGISTERED'
  | 'USER_LOGGED_IN'
  | 'TASK_CREATED'
  | 'TASK_UPDATED'
  | 'TASK_STATUS_CHANGED'
  | 'TASK_COMPLETED'
  | 'TASK_DELETED'
  | 'COMMENT_ADDED'
  | 'COMMENT_DELETED';

export interface AppEvent {
  type:      AppEventType;
  payload:   Record<string, unknown>;
  timestamp: Date;
  userId?:   string;
}

export interface IAppObserver {
  onEvent(event: AppEvent): void | Promise<void>;
}
