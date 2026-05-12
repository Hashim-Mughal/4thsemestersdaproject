// ============================================================
// PATTERN: Observer (Behavioural) — Concrete Observer
// Logs ALL events with timestamp, type, and payload.
// ============================================================

import { IAppObserver, AppEvent } from './interfaces/IAppObserver';

export class ConsoleLoggerObserver implements IAppObserver {
  onEvent(event: AppEvent): void {
    const ts   = event.timestamp.toISOString();
    const user = event.userId ? ` [user:${event.userId}]` : '';
    console.log(`[${ts}]${user} [${event.type}]`, JSON.stringify(event.payload));
  }
}
