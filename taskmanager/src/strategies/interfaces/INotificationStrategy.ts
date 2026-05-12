// ============================================================
// PATTERN: Strategy (Behavioural)
// Contract for every notification delivery channel.
// ============================================================

export interface NotificationPayload {
  recipient: string;
  subject:   string;
  message:   string;
}

export interface INotificationStrategy {
  send(payload: NotificationPayload): Promise<void>;
}
