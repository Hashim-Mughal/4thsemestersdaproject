// ============================================================
// PATTERN: Command (Behavioural) — Invoker
//
// Executes any ICommand<T>. This is the single place to add
// cross-cutting behaviour (timing, retry, audit logging) around
// command execution — without touching any Command or Service.
// ============================================================

import { ICommand } from './interfaces/ICommand';

export class TaskCommandInvoker {
  async run<T>(command: ICommand<T>): Promise<T> {
    const label = command.constructor.name;
    const start = Date.now();
    try {
      const result = await command.execute();
      console.log(`[INVOKER] ${label} succeeded in ${Date.now() - start}ms`);
      return result;
    } catch (err) {
      console.error(`[INVOKER] ${label} failed after ${Date.now() - start}ms:`, (err as Error).message);
      throw err;
    }
  }
}
