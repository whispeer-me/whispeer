# Whispeer

Whispeer ([whispeer.me](https://whispeer.me)) is a web app for sending short messages (up to 256 characters) through a link. A message can be sent as plain text, or encrypted in the browser with a passphrase you choose ("Secure Message"). Every message expires 24 hours after it is created.

<img src="public/resources/CreatingMessage.gif" alt="Creating a Message" width="320"/>
<img src="public/resources/ViewingMessage.gif" alt="Viewing a Message" width="320"/>

## How it works

Encryption is **optional**. It only happens when the "Secure Message" toggle is turned on; it is off by default.

**Creating a Secure Message (in the browser):**

1. You type the message and a passphrase.
2. The browser generates a random 128-bit salt and a random 128-bit IV.
3. A 256-bit key is derived from the passphrase and salt with PBKDF2 (1,000 iterations, HMAC-SHA256 — the crypto-js 4.2.0 default; the code does not set the hash explicitly).
4. The message is encrypted with AES-256 in CBC mode with PKCS#7 padding, using the [crypto-js](https://github.com/brix/crypto-js) library.
5. The browser sends the ciphertext, salt and IV to the server. The passphrase is never sent.
6. The server returns a random 10-character ID, and the browser shows the link `/m/<id>`. The passphrase is not part of the link; you must share it separately.

**Reading a Secure Message:** the browser fetches the ciphertext, salt and IV, asks for the passphrase, derives the key the same way, and decrypts locally. A wrong passphrase produces an "incorrect passphrase" error (detected when the decrypted output is empty or not valid UTF-8; there is no integrity check).

**Plain messages** (toggle off) are sent to the server and stored as plain text, and anyone with the link can read them.

A message can be opened any number of times until it expires.

## What the server can and cannot see

Per message, the database (`messages` table) stores:

| Column | Secure Message | Plain message |
| --- | --- | --- |
| `id` | random 10-char ID | same |
| `content` | ciphertext (Base64) | **plaintext** |
| `salt`, `iv` | hex strings | empty |
| `is_private` | `true` | `false` |
| `view_count` | number of times opened | same |
| `created_at` | timestamp | same |

The server **never receives** the passphrase, and for Secure Messages it never receives the plaintext.

The server **does receive and store** the plaintext of plain messages.

The application does not store IP addresses, user agents or any user identifier in the database.

Note: the server does not validate what it is sent. The 256-character limit and the encryption step are enforced by the browser code only; a client that calls the API directly can store anything in `content` and set `is_private` to any value.

## Data retention

- Message lookups only return messages created less than 24 hours ago.
- A scheduled job inside the server process runs **hourly** and deletes rows from `messages` where `created_at` is older than 24 hours. An expired message can therefore remain in the database for up to about one more hour, longer if the server process is not running when the job is due.
- Every message ID ever issued is kept permanently in the `archived_ids` table (ID only, no timestamp or content) so that IDs are never reused.
- Database backups, if any, depend on the hosting setup and are not controlled by this repository.

## Accounts, logging and analytics

**Accounts:** none. There is no sign-up, login, session or user identifier.

**Server logging:** the application has no request logging. It logs only:
- the expiry job's start, success, and errors (`server/plugins/delete.expired.messages.job.ts`);
- unhandled errors from the stats endpoint, which are passed to Nuxt/Nitro's default error handler.
Other API errors are caught and not logged.

What the hosting platform, reverse proxy or database provider logs (for example IP addresses or request URLs) is outside this repository and cannot be verified from the code.

**Analytics:**
- **Plausible** (`@nuxtjs/plausible`) records page views on all pages, outbound link clicks, and these events: `message-created`, `create-message`, `message-viewed`, each with an `is_private` or `source` property. For message pages the URL is trimmed to `/m/`, so the message ID is not sent; on message pages the referrer is not sent. The script is loaded from the module's default host (plausible.io); what Plausible itself collects (e.g. derived from IP and user agent) is governed by Plausible, not this code. Tracking is disabled on localhost.
- **Public counters:** the home page shows three numbers from `GET /api/message/stats`: total messages ever created, total message opens, and the current number of rows in `messages` (shown as "expiring soon"). These are global counters in a single `message_stats` row; nothing per user is stored.
- **Browser storage:** `localStorage` holds two counters used to limit how often a tooltip and a disclaimer are shown. Nothing is sent to the server.

## Security notes and limitations

- **Encryption is opt-in.** Plain messages are stored and readable as plain text by the server and by anyone with the link.
- **No authentication of ciphertext.** AES-CBC is used without a MAC or AEAD mode. Modified ciphertext is not reliably detected; it may decrypt to altered text or fail with a generic error.
- **Weak key derivation.** PBKDF2 with 1,000 iterations is low by current standards, which makes offline guessing of weak passphrases relatively cheap for anyone who obtains the ciphertext, salt and IV (e.g. the server operator or anyone with database access).
- **Security depends on the passphrase.** Its strength, and sharing it through a different channel than the link, are up to the user. Anyone with the link can download the ciphertext.
- **You trust the served code.** Encryption runs in JavaScript delivered by the same server that stores the ciphertext. A compromised or malicious server could serve code that captures passphrases.
- **Link = access.** IDs are 10 characters from a 62-character alphabet, generated with Node's `crypto.randomInt`. There is no rate limiting in the app.
- **No server-side validation** of message length, content or the `is_private` flag (see above).
- **Expiry is not instant**: deletion runs hourly, and only while the server is running.
- **Infrastructure is out of scope**: hosting, proxy, CDN and database logs or backups are not visible in this repository.

## Tech stack

- [Nuxt 3](https://nuxt.com) (Vue 3, server-side rendering, Nitro server API)
- PostgreSQL via `pg`; migrations with `node-pg-migrate`
- `crypto-js` 4.2.0 for client-side encryption
- `nuxt-scheduler` for the hourly expiry job
- `@nuxtjs/plausible` for analytics
- Vitest for tests
- Dockerfile (Node 18) for deployment

## Running locally

Requirements: Node.js 18+, a PostgreSQL database.

```sh
npm i

# Create the tables
export DATABASE_URL=postgres://user:password@localhost:5432/whispeer
npm run migrate

# Development server (Nuxt also reads DATABASE_URL from a .env file)
npm run dev

# Tests
npm test

# Production build
npm run build
node .output/server/index.mjs
```

Environment variables:
- `DATABASE_URL` — PostgreSQL connection string (required).
- `NUXT_PUBLIC_DOMAIN` — domain used to build the Open Graph image URL on message pages.

Note: `npm start` runs a `prestart` script that calls `db-migrate`, which is not a dependency of this project; use `npm run migrate` and start the built server directly as shown above. The Docker image runs migrations and starts the server via `entrypoint.sh`.

## Contributing

See the [Contributing Guide](CONTRIBUTING.md).

## License

Whispeer: Secure Messaging Application

Copyright (C) 2024 Nesim Tunc

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.
