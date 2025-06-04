// SPDX-License-Identifier: AGPL-3.0-only

/* eslint-disable no-console */

import type { Log } from "~/server/interfaces/utils/ILog";

export class AppLogger implements Log {
  info (message: string, ...args: unknown[]): void {
    console.log(this.formatMessage(message), ...args);
  }

  error (message: string | Error, ...args: unknown[]): void {
    if (message instanceof Error) {
      console.error(
        this.formatMessage(message.message),
        ...args,
        message.stack,
      );
    } else {
      console.error(this.formatMessage(message), ...args);
    }
  }

  warn (message: string, ...args: unknown[]): void {
    console.warn(this.formatMessage(message), ...args);
  }

  debug (message: string, ...args: unknown[]): void {
    console.debug(this.formatMessage(message), ...args);
  }

  private formatMessage (message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] ${message}`;
  }
}
