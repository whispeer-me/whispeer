export interface Log {
  info: (message: string, ...args: unknown[]) => void;
  error: (message: string | Error, ...args: unknown[]) => void;
  warn: (message: string, ...args: unknown[]) => void;
  debug: (message: string, ...args: unknown[]) => void;
}
