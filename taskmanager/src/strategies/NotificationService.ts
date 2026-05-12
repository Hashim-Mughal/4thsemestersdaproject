// ============================================================
// PATTERN: Strategy (Behavioural) — Context
//
// Holds the current notification strategy and delegates to it.
// Switch strategy at runtime: notificationService.setStrategy(new EmailStrategy())
// ============================================================

import { INotificationStrategy, NotificationPayload } from './interfaces/INotificationStrategy';

export class NotificationService {
  constructor(private strategy: INotificationStrategy) {}

  setStrategy(strategy: INotificationStrategy): void {
    this.strategy = strategy;
  }

  async notify(payload: NotificationPayload): Promise<void> {
    await this.strategy.send(payload);
  }
}
