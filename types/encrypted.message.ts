export default interface EncryptedMessage {
  ciphertext: string;
  salt: string;
  iv: string;
}
