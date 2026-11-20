// SPDX-License-Identifier: AGPL-3.0-only

// GET /api/message/:id. Burn messages omit content/salt/iv/view_count
// (those come once from POST /api/message/:id/open).
export interface Message {
  id: string;
  version: number;
  content?: string;
  salt?: string;
  iv?: string;
  has_passphrase: boolean;
  burn_after_read: boolean;
  view_count?: number;
  expires_in: string;
}
