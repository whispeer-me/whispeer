import CryptoJS from "crypto-js";

export default class CryptoService {
  static encrypt(message, passphrase) {
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
      throw { message: "Error occured during message encryption." };
    }
  }

  static decrypt(ciphertext, passphrase, salt, iv) {
    const key = CryptoJS.PBKDF2(passphrase, CryptoJS.enc.Hex.parse(salt), {
      keySize: 256 / 32,
      iterations: 1000,
    });

    const decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    const originalText = decrypted.toString(CryptoJS.enc.Utf8);
    if (!originalText) throw new Error("Incorrect passphrase");
    return originalText;
  }
}
