# Whispeer security hardening — shared design (read fully before your task)

Decisions are final. Don't redesign; if something is impossible, do the closest thing and say so in your summary.

## Goal
Nobody but the holder of the link (and the passphrase, if one is set) can read a message. Not the server, not the database, not analytics, not someone who tampers with stored data.

## Worker rules
- Do ONLY your task from `tasks/sec/TASKS.md`. Earlier tasks are committed; later ones are someone else's.
- The working tree may hold partial work from an interrupted run of this same task: check `git status` / `git diff` first and continue from it.
- TDD: write the failing tests listed for your task first, then implement.
- Gate (must be green before you finish): `npx vitest run && npx eslint --ext .ts,.js,.cjs,.vue . && npx nuxi build`.
- Do NOT commit, switch branches, or edit `tasks/sec/*`, `README.md`, `pages/privacy-policy.vue` (docs are done by the lead at the end).
- No new dependencies except those named here. Prefer platform APIs (WebCrypto, `crypto` in Node).
- Keep the existing code style (eslint config: double quotes, semicolons, trailing commas, SPDX header on new files).
- Mark deliberate shortcuts with a `ponytail:` comment naming the ceiling and upgrade path.
- End with a 5-line summary: done, deferred, anything the next task must know.

## Decisions (from the owner)
1. Every message is encrypted in the browser. No plaintext ever reaches the server.
2. A random link key always lives in the URL fragment (`/m/<id>#<key>`); browsers never send the fragment to servers. A passphrase is optional extra protection.
3. Existing messages (old crypto-js format and stored plaintext) are **deleted** by migration on deploy. No legacy reader. crypto-js is removed.
4. Expiry job runs **every minute** (was hourly).
5. Optional **burn after read** toggle (default off).
6. In-memory per-IP rate limiting; IPs are never stored or logged.

## Crypto format v2 (`composables/crypto.service.ts`, WebCrypto only)
All binary values are encoded base64url without padding.

- `linkKey` K: 32 random bytes (`crypto.getRandomValues`). Encoded K is the fragment.
- `salt`: 16 random bytes. `iv`: 12 random bytes. New per message.
- If a passphrase is set: `P = PBKDF2-SHA256(utf8(passphrase.normalize("NFC")), salt, 600_000 iterations, 256 bits)`.
- `ikm = K` (no passphrase) or `K || P` (with passphrase).
- `key = HKDF-SHA256(ikm, salt, info = utf8("whispeer:v2"), 256 bits)` → non-extractable AES-GCM key.
- `aad = utf8("whispeer:v2:p" + (hasPassphrase?1:0) + ":b" + (burnAfterRead?1:0))`.
- `ciphertext = AES-256-GCM(key, iv, aad, utf8(plaintext))` (includes the 16-byte tag).
- Constants exported: `CRYPTO_VERSION = 2`, `PBKDF2_ITERATIONS = 600_000`.
- API (async):
  - `encrypt(plaintext, { passphrase?, burnAfterRead }) → { linkKey, payload: { version, content, salt, iv, has_passphrase, burn_after_read } }`
  - `decrypt(payload, linkKey, passphrase?) → plaintext`; any failure (bad key, bad passphrase, tampered content/flags/iv/salt, wrong version) throws one generic `Error("Decryption failed")`.
- Plaintext limit: 256 JS characters (`MESSAGE_MAX_CHARS_ALLOWED`), enforced in the UI and in `encrypt` (throws).

## Database (new migration in `migrations/`, node-pg-migrate `.cjs` like the others)
- `DELETE FROM messages;` first (wipes old-format and plaintext rows).
- Drop `is_private`. Add `version smallint not null`, `has_passphrase boolean not null default false`, `burn_after_read boolean not null default false`. Index on `created_at`.
- `archived_ids` and `message_stats` unchanged.

## API
IDs: `^[A-Za-z0-9]{10}$`; anything else → 404 without touching the DB.

- `POST /api/message` — body exactly `{ version, content, salt, iv, has_passphrase, burn_after_read }`; unknown or missing keys → 400. `version === 2`; `content` base64url, 22–1048 chars (256 chars UTF-8 ≤ 768 bytes + 16 tag); `salt` exactly 22 chars (16 bytes); `iv` exactly 16 chars (12 bytes); booleans strictly boolean. Returns `201 { id }` only.
- `GET /api/message/:id` — only rows younger than 24 h.
  - Normal message: `{ id, version, content, salt, iv, has_passphrase, burn_after_read: false, view_count, expires_in }`.
  - Burn message: `{ id, version, has_passphrase, burn_after_read: true, expires_in }` — **no** content/salt/iv (link previews and scanners must not get or burn it).
- `POST /api/message/:id/open` — burn messages only: one statement `DELETE ... WHERE id = $1 AND burn_after_read AND created_at > NOW() - INTERVAL '24 hours' RETURNING version, content, salt, iv, has_passphrase`, plus global `message_stats.view_count + 1`, in one transaction. 200 with the payload, or 404. Second call → 404.
- `PATCH /api/message/:id` — view count, normal messages only (no-op/404 for burn).
- `GET /api/message/stats` — `expiring_soon_count` counts only rows younger than 24 h.
- Responses never echo DB internals (`SELECT *` → explicit columns). Errors: generic message, no stack.

## Expiry
`server/plugins/delete.expired.messages.job.ts`: run every minute (nuxt-scheduler `everyMinute()` or cron `* * * * *` — check the installed version's API in `node_modules/nuxt-scheduler`).

## UI
- `/m/new`: always encrypt. Toggles: "Add passphrase" (optional, min 8 chars when on) and "Delete after first view". Link shown = `${origin}/m/${id}#${linkKey}`. Warn that anyone with the link (and passphrase, if set) can read it.
- `/m/[id]`: read key from `location.hash`, then immediately `history.replaceState` to drop the fragment from the address bar/history (keep the key in memory only). No key → clear error ("link incomplete"). Burn message → show "This message will be deleted after you open it" + **Open** button → `POST .../open` → decrypt; keep the payload in memory so a wrong passphrase can be retried without the server. Passphrase prompt only when `has_passphrase`. Refresh after the fragment was stripped → "open the original link again".
- Analytics must never receive the fragment or the message ID: keep `sanitizeUrl` page views, set `autoOutboundTracking: false` in `nuxt.config.ts` (Plausible's outbound tracker sends `location.href`).
- Rendering: plain text interpolation only, never `v-html`.

## Hardening (task 04) — dependency: `nuxt-security`
- Headers: CSP with nonces (`script-src 'self' 'nonce-…' 'strict-dynamic' https://plausible.io`, `connect-src 'self' https://plausible.io`, `object-src 'none'`, `base-uri 'none'`, `frame-ancestors 'none'`, `form-action 'self'`, `img-src 'self' data:`), `Referrer-Policy: no-referrer`, HSTS (1 year, includeSubDomains), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, restrictive `Permissions-Policy`. `Cache-Control: no-store` on `/api/**` and `/m/**`.
- Rate limits (in memory): `POST /api/message` 10/min/IP, other `/api/message/**` 60/min/IP. Client IP from `fly-client-ip` header (set by Fly's proxy), falling back to the socket address. Never log or persist IPs.
- Request body limit 4 KB on `/api/**`.
- Disable nuxt-security features that would break things or add no value here (e.g. XSS validator on base64 bodies) and say why in a comment.

## Out of scope
Accounts, WebSockets/chat (dead code, deleted in task 03), changing hosting.
