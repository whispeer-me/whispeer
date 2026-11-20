// SPDX-License-Identifier: AGPL-3.0-only

import type { EncryptedPayload } from "~/types/encrypted.message";

// A row of `messages` (explicit columns only).
export type StoredMessage = EncryptedPayload & {
  id: string;
  view_count: number;
  created_at: Date;
};

// Payload returned by POST /api/message/:id/open (burn messages only).
export type OpenedPayload = Omit<EncryptedPayload, "burn_after_read">;

// GET /api/message/:id
export type PublicMessage = (EncryptedPayload & {
  id: string;
  burn_after_read: false;
  view_count: number;
  expires_in: string | undefined;
}) | {
  id: string;
  version: number;
  has_passphrase: boolean;
  burn_after_read: true;
  expires_in: string | undefined;
};
