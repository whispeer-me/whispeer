// SPDX-License-Identifier: AGPL-3.0-only

import type { OpenedPayload, StoredMessage } from "~/server/entities/message";
import type { EncryptedPayload } from "~/types/encrypted.message";

export interface IMessageRepository {
  save(payload: EncryptedPayload): Promise<{ id: string }>;
  findById(id: string): Promise<StoredMessage | null>;
  // Atomically deletes a live burn message and returns its payload (once).
  openBurnMessage(id: string): Promise<OpenedPayload | null>;
  // Normal live messages only; false when nothing was updated.
  increaseViewCount(id: string): Promise<boolean>;
  deleteExpiredMessages(): Promise<void>;
  getStats(): Promise<{
    created_count: number;
    view_count: number;
    expiring_soon_count: number;
  }>;
}
