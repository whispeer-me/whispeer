// SPDX-License-Identifier: AGPL-3.0-only

export interface Message {
  id: string | undefined;
  content: string;
  salt: string | undefined;
  iv: string | undefined;
  is_private: boolean;
  view_count: number | undefined;
  created_at: Date | undefined;
  expires_in: string | undefined;
}
