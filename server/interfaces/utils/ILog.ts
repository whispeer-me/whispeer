// SPDX-License-Identifier: AGPL-3.0-only

export interface Log {
  info: (message: string, ...args: unknown[]) => void;
  error: (message: string | Error, ...args: unknown[]) => void;
  warn: (message: string, ...args: unknown[]) => void;
  debug: (message: string, ...args: unknown[]) => void;
}
