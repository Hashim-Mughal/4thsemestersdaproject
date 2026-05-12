// ============================================================
// PATTERN: Observer (Behavioural) — Concrete Observer
// Reacts ONLY to TASK_COMPLETED events.
// Adding a real EmailService here = zero changes to TaskService.
// ============================================================

import { IAppObserver, AppEvent } from './interfaces/IAppObserver';

export class TaskCompletionNotifier implements IAppObserver {
  onEvent(event: AppEvent): void {
    if (event.type !== 'TASK_COMPLETED') return;
    console.log(
      `[NOTIFICATION] Task "${event.payload['title']}" completed by user ${event.userId}. ` +
      `Notification would be sent here.`
    );
  }
}
