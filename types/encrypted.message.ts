// SPDX-License-Identifier: AGPL-3.0-only

export default interface EncryptedMessage {
  ciphertext: string;
  salt: string;
  iv: string;
}
