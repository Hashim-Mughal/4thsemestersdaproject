// ============================================================
// PATTERN: Strategy (Behavioural)
//
// Defines a family of notification algorithms (Console, Email,
// SMS — future), encapsulates each one, and makes them
// interchangeable at runtime.
//
// WHY: Without Strategy, the notification logic is an if-else chain
// inside the service. Adding SMS means editing the service.
// With Strategy, you inject a different INotificationStrategy.
//
// SOLID:
//   O — New notification channel = new class, zero changes to callers
//   D — Services depend on INotificationStrategy, not ConcreteNotifier
//   S — Each strategy class has one job: its channel's delivery logic
// ============================================================

export interface NotificationPayload {
  recipient: string;   // email address or phone number
  subject:   string;
  message:   string;
}

// ── Contract ─────────────────────────────────────────────────
export interface INotificationStrategy {
  send(payload: NotificationPayload): Promise<void>;
}

// ── Concrete Strategy 1: Console (Development) ───────────────
// Used in dev — prints to stdout. No external service needed.
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

// ── Concrete Strategy 2: Email (Stub — Production ready) ─────
// In production: inject nodemailer or SendGrid here.
// The service never changes — only this class does.
export class EmailNotificationStrategy implements INotificationStrategy {
  async send(payload: NotificationPayload): Promise<void> {
    // Real implementation: await transporter.sendMail({ ... payload })
    console.log(`[EMAIL STUB] Would send email to ${payload.recipient}: "${payload.subject}"`);
  }
}

// ── Notification Service (Context) ───────────────────────────
// Holds the current strategy and delegates to it.
// Switch strategy at runtime: notificationService.setStrategy(new EmailStrategy())
export class NotificationService {
  constructor(private strategy: INotificationStrategy) {}

  setStrategy(strategy: INotificationStrategy): void {
    this.strategy = strategy;
  }

  async notify(payload: NotificationPayload): Promise<void> {
    await this.strategy.send(payload);
  }
}
