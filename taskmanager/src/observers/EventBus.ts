// ============================================================
// PATTERN: Observer (Behavioural) — Subject / Event Bus
//
// Static bus: one instance for the whole app.
// Services emit events here. Observers react — services never
// know who is listening or what they do.
// ============================================================

import { IAppObserver, AppEvent, AppEventType } from './interfaces/IAppObserver';

export class EventBus {
  private static observers: IAppObserver[] = [];

  static subscribe(observer: IAppObserver): void {
    EventBus.observers.push(observer);
  }

  static emit(type: AppEventType, payload: Record<string, unknown>, userId?: string): void {
    const event: AppEvent = { type, payload, timestamp: new Date(), userId };
    for (const observer of EventBus.observers) {
      void observer.onEvent(event);
    }
  }

  /** Reset all subscribers — useful in tests. */
  static reset(): void {
    EventBus.observers = [];
  }
}
