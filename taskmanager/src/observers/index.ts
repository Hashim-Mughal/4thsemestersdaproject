// BARREL: observers/index.ts
export type { AppEventType, AppEvent, IAppObserver } from './interfaces/IAppObserver';
export { EventBus }                from './EventBus';
export { ConsoleLoggerObserver }   from './ConsoleLoggerObserver';
export { TaskCompletionNotifier }  from './TaskCompletionNotifier';
