// SPDX-License-Identifier: AGPL-3.0-only

// v2 payload: exactly what the browser sends to and gets back from the API.
// Binary values are base64url without padding.
export type EncryptedPayload = {
  version: number;
  content: string;
  salt: string;
  iv: string;
  has_passphrase: boolean;
  burn_after_read: boolean;
};

export type EncryptOptions = {
  passphrase?: string;
  burnAfterRead: boolean;
};

export type EncryptResult = {
  linkKey: string;
  payload: EncryptedPayload;
};

// ponytail: alias only for the dead chat code (composables/chat), which is
// deleted in task 03 together with this alias.
export type EncryptedMessage = EncryptedPayload;
