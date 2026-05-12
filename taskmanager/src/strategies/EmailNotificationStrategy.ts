// PATTERN: Strategy (Behavioural) — Concrete Strategy
// Production channel stub. Swap ConsoleNotificationStrategy for
// this in server.ts when going live — zero service changes.

import { INotificationStrategy, NotificationPayload } from './interfaces/INotificationStrategy';

export class EmailNotificationStrategy implements INotificationStrategy {
  async send(payload: NotificationPayload): Promise<void> {
    // Real implementation: await transporter.sendMail({ ...payload })
    console.log(`[EMAIL STUB] Would send email to ${payload.recipient}: "${payload.subject}"`);
  }
}
