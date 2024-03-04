// SPDX-License-Identifier: AGPL-3.0-only

export type EncryptedMessage = {
  ciphertext: string;
  salt: string;
  iv: string;
};
