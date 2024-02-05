# Welcome to Whispeer!

Hey there! Welcome to [Whispeer](https://whispeer.me), where we're all about keeping your messages safe and private. We've mixed some cool tech like PostgreSQL, Node.js, and Vue.js 2 to make sure your chats are not just fun and easy to use, but also super secure.

## Contribute to the Project

Help us make Whispeer even better! We're always looking for new contributors to help us build, design, and test our code. If you're interested in helping out, check out our [Contributing Guide](CONTRIBUTING.md) for more information.

### Development
 - **Install the Packages"** Get all the dependencies:
   ```
   npm i
   ```

- **Making Changes?** Use this for a smooth coding ride:
  ```
  npm run serve
  ```
- **Going Live?** Get your code ready for showtime:
  ```
  npm run dev
  ```

### Testing and Keeping It Clean
- **Testing Made Easy:** Run your tests with:
  ```
  npm run test
  ```

# Environment Variables

Update `ANALYTICS_DOMAIN` in `.env` file accordingly.

## Client-Side Encryption

We use the `CryptoJS` library to perform all encryption on the client side. This means that sensitive data is encrypted before it's sent over the network, and only decrypted when it's needed for display. This strategy ensures that sensitive data is always secure, even if the network is compromised.

Here's a brief overview of how our encryption process works:

1. When a message is created, it's encrypted using a passphrase provided by the user. The encryption process also generates a random salt and initialization vector (randomIV) for added security.

   The encryption is done using the AES algorithm, in CBC mode with PKCS7 padding. The key for the encryption is derived from the passphrase and salt using the PBKDF2 key derivation function.

2. The encrypted message, along with the salt and IV, are then sent to the server and stored in the database. The server never has access to the unencrypted message or the passphrase.

3. When the message needs to be read, the client retrieves the encrypted message, salt, and IV from the server. The client then decrypts the message using the same passphrase.

   If the passphrase is incorrect, the decryption will fail and an error will be thrown.

By performing all encryption and decryption on the client side, we ensure that your message is always secure and private. Only you and the other party that you shared your passphrase with can decrypt the message.
