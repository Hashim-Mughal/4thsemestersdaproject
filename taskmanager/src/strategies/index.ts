// BARREL: strategies/index.ts
export type { NotificationPayload, INotificationStrategy } from './interfaces/INotificationStrategy';
export { ConsoleNotificationStrategy } from './ConsoleNotificationStrategy';
export { EmailNotificationStrategy }   from './EmailNotificationStrategy';
export { NotificationService }         from './NotificationService';
