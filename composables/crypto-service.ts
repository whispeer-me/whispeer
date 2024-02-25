// SPDX-License-Identifier: AGPL-3.0-only

import CryptoJS from "crypto-js";
import type EncryptedMessage from "~/types/encrypted.message";

export default class CryptoService {
  static encrypt(message: string, passphrase: string): EncryptedMessage {
    try {
      const salt = CryptoJS.lib.WordArray.random(128 / 8);
      const iv = CryptoJS.lib.WordArray.random(128 / 8);
      const key = CryptoJS.PBKDF2(passphrase, salt, {
        keySize: 256 / 32,
        iterations: 1000,
      });

      const encrypted = CryptoJS.AES.encrypt(message, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      return {
        ciphertext: encrypted.toString(),
        salt: salt.toString(),
        iv: iv.toString(),
      };
    } catch (error) {
      throw new Error("Error occurred during message encryption.");
    }
  }

  static decrypt(
    ciphertext: string,
    salt: string,
    iv: string,
    passphrase: string
  ): string {
    const defaultException = new Error("Incorrect passphrase");
    try {
      const key = CryptoJS.PBKDF2(passphrase, CryptoJS.enc.Hex.parse(salt), {
        keySize: 256 / 32,
        iterations: 1000,
      });

      const decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
        iv: CryptoJS.enc.Hex.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      if (!decrypted) {
        throw defaultException;
      }

      const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);

      if (
        decryptedText === null ||
        decryptedText === undefined ||
        decryptedText === ""
      ) {
        throw new Error();
      }

      return decryptedText;
    } catch (error) {
      throw defaultException;
    }
  }
}
