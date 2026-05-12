// ============================================================
// PATTERN: Command (Behavioural)
// Contract that every concrete Command must implement.
// The Invoker calls execute() — it never knows what's inside.
// ============================================================

export interface ICommand<T = void> {
  execute(): Promise<T>;
}
