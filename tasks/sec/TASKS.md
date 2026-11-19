# Security hardening tasks

Read `tasks/sec/DESIGN.md` first. One task per run. "Tests first" = write them, see them fail, then implement.

## 01 — Crypto v2
- Rewrite `composables/crypto.service.ts` to the v2 format in DESIGN (WebCrypto only, async). Update `types/encrypted.message.ts` to the v2 payload shape.
- `npm uninstall crypto-js @types/crypto-js`. No remaining import of crypto-js anywhere (callers in pages are updated in task 03; until then make `pages/m/*.vue` compile against the new async API with the smallest change, or leave a `ponytail:` note if the call site is rewritten in 03).
- Tests first (`tests/composables/crypto.service.spec.ts`, replace the old ones): round trip without passphrase; round trip with passphrase; wrong link key fails; wrong passphrase fails; missing passphrase when `has_passphrase` fails; flipping a ciphertext byte fails; flipping `has_passphrase`/`burn_after_read` in the payload fails (AAD); changed iv/salt fails; `version !== 2` fails; > 256 chars throws; two encryptions of the same text give different linkKey/salt/iv/content; encoded lengths match DESIGN (linkKey 43, salt 22, iv 16).
- Accept: gate green; `grep -r crypto-js` only matches `package-lock.json` history if anything.

## 02 — Server v2
- Migration per DESIGN (wipe, schema). Update `server/entities/message.ts`, repository, use cases, interfaces.
- Validation per DESIGN in a small pure function (`server/utils/validate.message.ts`) used by `index.post.ts`; return 400 with a generic message.
- `GET` shapes per DESIGN (burn hides content). New `server/api/message/[id]/open.post.ts` (or the route file name Nuxt needs next to the existing `[id].index.*` files — check routing works with both) with atomic delete-returning.
- ID format check on every `:id` route.
- Expiry job every minute. `getStats` counts only live rows.
- Explicit column lists, no `SELECT *` / `RETURNING *`. `POST` returns `{ id }` only.
- Tests first (`tests/server/...`, mock pool or use cases like the existing spec): validator accepts a real payload from `CryptoService.encrypt` and rejects each bad field / extra key / missing key / wrong types / plaintext-looking content; burn GET has no content; open returns payload once then 404; bad ID → 404 without DB call; stats query filters by age; job schedule is every minute.
- Accept: gate green.

## 03 — UI
- `pages/m/new.vue` and `pages/m/[id].vue` per DESIGN UI section (always encrypt, passphrase toggle min 8, burn toggle, fragment key, replaceState, burn Open flow, retry passphrase locally, clear errors). Reuse existing components (`CommonSwitch`, `MessagePassphraseInput`, `CommonModal`, `CommonError`).
- `nuxt.config.ts`: `autoOutboundTracking: false`. Analytics events keep only `has_passphrase`/`burn_after_read` booleans; never the URL hash or ID.
- Delete dead chat code: `pages/chat/`, `composables/chat/`, `components/chat/`, `types/chat.message.ts`, `tests/pages/chat/`, the `.nuxtignore` line. Delete `composables/cipher/*` only if nothing uses it.
- Update on-page copy that mentions "Secure Message"/plain messages so it matches the new behaviour (not README/privacy page).
- Tests first (`tests/pages/m/`): new page builds a link with `#` + 43-char key and posts no plaintext (spy on `messageService.createMessage`, assert body has no original text); passphrase < 8 blocked; burn toggle sets flag; view page with valid hash decrypts and calls `history.replaceState` without the hash; missing hash shows error and makes no decrypt; burn message shows Open button and only calls `/open` on click; wrong passphrase can be retried without a second fetch.
- Accept: gate green; no `v-html`; manual check notes in summary.

## 04 — Platform hardening
- `npm i nuxt-security` and configure per DESIGN "Hardening" (headers, CSP nonces, rate limits with `fly-client-ip`, body limit, no-store). Check the config against the module's docs/source in `node_modules/nuxt-security`, and make sure Plausible's script still gets a nonce and is allowed by the CSP. The lead verifies headers on a running server afterwards.
- `package.json`: `prestart` → `node-pg-migrate up` (db-migrate isn't installed); `engines.node` `>=22`. Dockerfile both stages `node:22-alpine`; `.github/workflows/ci.yml` node 22 and run lint too.
- `npm audit fix` (no `--force`); list remaining advisories in your summary.
- Tests first where feasible: rate limiter config unit (limits per route), `fly-client-ip` preferred over socket address, body > 4 KB rejected.
- Accept: gate green.

## 05 — Fable review fixes
- Read `tasks/sec/REVIEW.md` (written by the lead from a Claude Fable 5.2 review of the whole branch). Fix every finding marked MUST and SHOULD; for anything you disagree with, explain in your summary instead of changing it.
- Tests first for each behavioural fix.
- Accept: gate green.
