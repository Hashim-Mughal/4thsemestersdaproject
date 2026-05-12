// PATTERN: Strategy (Behavioural) — Concrete Strategy
// Development channel: prints to stdout. No external service.

import { INotificationStrategy, NotificationPayload } from './interfaces/INotificationStrategy';

export class ConsoleNotificationStrategy implements INotificationStrategy {
  async send(payload: NotificationPayload): Promise<void> {
    console.log(
      `[CONSOLE NOTIFICATION]\n` +
      `  To:      ${payload.recipient}\n` +
      `  Subject: ${payload.subject}\n` +
      `  Message: ${payload.message}`
    );
  }
}
