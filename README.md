# Whispeer

> **The hosted version is offline.** The domain it ran on has lapsed. You can still run Whispeer yourself; see [Running locally](#running-locally).

Whispeer is a web app for sending short messages (up to 256 characters) through a link. Every message is encrypted in the browser before it is sent. A message expires 24 hours after it is created, or right after it is first opened if you choose "Delete after first view".

<img src="public/resources/CreatingMessage.gif" alt="Creating a Message" width="320"/>
<img src="public/resources/ViewingMessage.gif" alt="Viewing a Message" width="320"/>

## How it works

All encryption and decryption happen in the browser, using the Web Crypto API.

**Creating a message:**

1. The browser generates a random 32-byte **link key**, a random 16-byte salt and a random 12-byte IV.
2. If you add a passphrase (optional, at least 8 characters), the browser derives 256 bits from it with PBKDF2-HMAC-SHA256 (600,000 iterations, the salt above).
3. The encryption key is derived with HKDF-SHA256 from the link key, plus the passphrase bits if there is a passphrase.
4. The message is encrypted with AES-256-GCM. The "has passphrase" and "delete after first view" settings are bound to the ciphertext as additional authenticated data, so changing them makes decryption fail.
5. The browser sends the ciphertext, salt, IV and the two settings to the server, and gets back a random 10-character ID.
6. The link is `/m/<id>#<link key>`. The part after `#` (the URL fragment) is never sent to the server by browsers. If you set a passphrase, share it separately from the link.

**Opening a message:** the page reads the link key from the fragment, removes it from the address bar and browser history, fetches the ciphertext, asks for the passphrase if the message has one, and decrypts locally. Any failure (wrong key, wrong passphrase, tampered data) shows the same "decryption failed" error. Because the fragment is removed after loading, refreshing the page asks you to open the original link again.

**Delete after first view:** the page first shows an **Open** button; the server does not return the ciphertext until it is pressed. The server then returns it and deletes the message in one database statement, so it can be opened only once. If you mistype the passphrase you can retry, as long as the page stays open.

## What the server can and cannot see

The database stores, per message: `id`, `content` (ciphertext), `salt`, `iv`, `version`, `has_passphrase`, `burn_after_read`, `view_count`, `created_at`.

The server **never receives** the plaintext, the link key or the passphrase. Anyone who obtains the database alone cannot read messages, because the link key is not in it.

The server rejects anything that is not a well-formed encrypted message (wrong format, wrong field lengths, extra fields, bodies over 4 KB).

The application does not store IP addresses, user agents or any user identifier.

## Data retention

- Messages can be read only within 24 hours of creation.
- A job inside the server process runs once at startup and then every minute, deleting messages older than 24 hours. If the server is not running, deletion happens when it starts again.
- "Delete after first view" messages are deleted when they are opened.
- Every message ID ever issued is kept in the `archived_ids` table (the ID only, no timestamp or content) so IDs are never reused.
- Database backups, if any, depend on how you host it and are outside this repository.

## Accounts, logging and analytics

**Accounts:** none. There is no sign-up, login, session or user identifier.

**Logging:** the application does not log requests, IP addresses or message content. It logs the expiry job (two lines a minute) and its errors. What your hosting platform, proxy or database provider logs is outside this repository.

**Rate limiting:** creates are limited to 10 per minute per client (300 per minute in total), other message requests to 60 per minute per client (6,000 per minute in total). Client addresses are kept only in server memory for the current minute, never logged or stored; IPv6 addresses are grouped by /64, and when the in-memory table is full the oldest entry is evicted. The client address is taken from the `fly-client-ip` header (set by Fly.io's proxy) or the connection address.

**Analytics:** the app includes [Plausible](https://plausible.io) via `@nuxtjs/plausible` (disabled on localhost). It records page views and these events: `message-created` and `message-viewed` (each with only the `has_passphrase` and `burn_after_read` settings) and `create-message`. On message pages the URL is cut to `/m/` and no referrer is sent, so the message ID and key never reach Plausible. Outbound link tracking is off. What Plausible itself collects is governed by Plausible.

**Public counters:** the home page shows the total messages created, total messages opened, and messages currently live. These are global totals; nothing per user is stored.

**Browser storage:** `localStorage` holds two counters that limit how often a tooltip and a disclaimer are shown.

**Security headers** (via `nuxt-security`): Content-Security-Policy with per-request nonces, `Referrer-Policy: no-referrer`, HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, a restrictive `Permissions-Policy`, and `Cache-Control: no-store` on API and message pages.

## Security notes and limitations

- **Not audited.** The design and code have not been reviewed by an independent security firm.
- **The link is the key.** Anyone who gets the full link can read a message without a passphrase. Links can leak through chat backups, screenshots, link-preview services that keep URLs, or browser sync of open tabs. Use a passphrase for anything sensitive, and share it through a different channel.
- **You trust the served code.** Encryption runs in JavaScript delivered by the same server that stores the ciphertext. A compromised or malicious server could serve code that captures the key or passphrase.
- **Passphrase strength matters.** 600,000 PBKDF2 iterations slow down guessing, but a weak passphrase can still be guessed by someone who also has the link key and the ciphertext.
- **Metadata is visible to the server:** when a message was created and opened, its approximate length, whether it has a passphrase or is delete-after-first-view, and the client network address while a request is handled.
- **Expiry is not instant:** deletion runs every minute, and only while the server is running.
- **Known residual issue:** on Nuxt 3, route rules are not applied to case-variant page paths (for example `/M/...`), so those pages miss the `no-store` header. API routes are not affected. It is fixed in Nuxt 4.
- **Secure context required:** the Web Crypto API only works over HTTPS or on `localhost`.
- **Infrastructure is out of scope:** hosting, proxy, CDN and database logs or backups are not visible in this repository.

## Tech stack

- [Nuxt 3](https://nuxt.com) (Vue 3, server-side rendering, Nitro server API)
- Web Crypto API (AES-256-GCM, HKDF, PBKDF2) in the browser
- PostgreSQL via `pg`; migrations with `node-pg-migrate`
- `nuxt-security` for headers, CSP and request limits
- `@nuxtjs/plausible` for analytics, `@nuxt/image` for images
- Vitest for tests
- Docker (Node 24) for builds

## Running locally

**With Docker** (app and Postgres):

```sh
docker compose up --build    # http://localhost:3100
docker compose down -v       # stop and delete the local database
```

**Without Docker** (Node.js 24+, a PostgreSQL database):

```sh
npm ci
export DATABASE_URL=postgres://user:password@localhost:5432/whispeer
npm run migrate      # create the tables
npm run dev          # development server
npm run build && npm start   # production build (start runs migrations first)
```

**Tests:**

```sh
npx vitest run
# Database integration tests (skipped unless set), e.g. against the Docker Postgres:
TEST_DATABASE_URL=postgres://whispeer:whispeer@127.0.0.1:5433/whispeer npx vitest run
```

**Environment variables:**
- `DATABASE_URL`: PostgreSQL connection string (required).
- `NUXT_PUBLIC_DOMAIN`: domain used to build the Open Graph image URL on message pages.

## Contributing

See the [Contributing Guide](CONTRIBUTING.md). Report security issues privately through [GitHub private vulnerability reporting](https://github.com/whispeer-me/whispeer/security/advisories/new).

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
