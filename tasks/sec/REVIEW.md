# Fable review

> **Lead verification (on the running Docker build):**
> - MUST confirmed: after load the address bar is clean but `history.state` still contains the full link key.
> - 4 KB limit confirmed dead: a 20 KB body reaches the route; only the 2 MB module default returns 413.
> - Scope for task 05: fix the MUST, every SHOULD, and every NIT **except "Stale shipped docs"** (README/privacy page are the lead's).
> - The real-DB test: write it so it runs only when `TEST_DATABASE_URL` is set (skipped otherwise); the lead runs it against the local compose Postgres.


## MUST (exploitable or breaks the goal)

**Fragment strip is undone by vue-router; the link key returns to history on the next in-app navigation** — pages/m/[id].vue ~L128-139 (`takeKeyFromUrl`)
- **What is wrong:** `replaceState(window.history.state, "", path)` passes vue-router's own state back unchanged, and that state still has `current: "/m/<id>#<key>"`. On the next `router.push`, vue-router (from its v4 source, not run here) calls `changeLocation(history.state.current, …, replace=true)`, rewriting the entry URL back to `/m/<id>#<key>`. Until then the key also sits in `history.state.current` and in the reactive `route.hash` / `route.fullPath`, contradicting the "only in this closure" comment.
- **Failure scenario:** the recipient reads a normal message on a shared machine, clicks "Home" or "Privacy Policy", and leaves. The next person presses Back, the page remounts with the key in `location.hash`, and the message decrypts again (any time within 24 h). The design's "refresh → open the original link again" guarantee never holds in this flow.
- **Why the test misses it:** `view.spec.ts` mocks `useRoute` and runs no real router.
- **Fix:** strip through the router, `await useRouter().replace({ path: route.path, query: route.query, hash: "" })`, or at minimum write `{ ...history.state, current: pathname + search }`. Add a test with a real router that asserts `JSON.stringify(history.state)` and `router.currentRoute.value.fullPath` do not contain the key after mount, and that `location.hash` is still empty after `router.push("/")`.

## SHOULD (real weakness, fix now)

**4 KB body limit is not applied** — security.config.ts ~L52-58, nuxt.config.ts L29
- **What is wrong:** nuxt-security reads per-route options from `routeRules[route].security.requestSizeLimiter`. Here `requestSizeLimiter` sits at the top level of the rule, so it is ignored and the module default (2 MB, 8 MB for multipart) applies. As far as I recall from the module source, the limiter also only compares the `Content-Length` header, so chunked bodies pass regardless.
- **Failure scenario:** `POST /api/message` with `Transfer-Encoding: chunked` and a multi-hundred-MB body is buffered by `readBody` before validation rejects it. Ten per minute per IP (unlimited with the IPv6 issue below) is enough to exhaust memory on a small Fly machine.
- **Why the test misses it:** `rate.limit.spec.ts` "4 KB body limit" only asserts the shape of the exported object.
- **Fix:** move the option under `security: { requestSizeLimiter: … }`. Also enforce in `index.post.ts`: reject `Content-Length > 4096` and read the stream with a hard 4 KB cap, aborting with 413. Test through a real request.

**Rate limit is bypassed with IPv6 rotation, and the limiter becomes a CPU/memory amplifier** — server/utils/rate.limit.ts ~L23-52
- **What is wrong:** the bucket key is the full address from `fly-client-ip`. Any client with a routed /64 has 2^64 distinct keys, so both the 10/min and 60/min limits are void.
- **Failure scenario:** unlimited creates flood `messages` and the never-pruned `archived_ids`. Once `hits.size > 10_000`, every request scans the whole Map, and entries younger than one interval are never evicted, so the Map and the per-request scan grow with the attack rate.
- **Fix:** key IPv6 on the /64 prefix (normalise `::ffff:` v4-mapped addresses). Sweep on a timer or at most once per interval rather than per request. Hard-cap the Map and fail closed for new keys when full. Consider a coarse global cap on creates.

**A burn message is destroyed before the client knows whether its key is usable** — pages/m/[id].vue ~L117-123 and ~L172-188
- **What is wrong:** the only check before showing **Open** is "hash non-empty".
- **Failure scenario:** a truncated or mangled fragment (messenger line-wrap, a markdown renderer eating `_`, partial copy) still shows Open. The click runs `DELETE … RETURNING`, then `decodeExact(linkKey, 32)` fails, and the message is gone for everyone.
- **Fix:** validate the key shape (`/^[A-Za-z0-9_-]{43}$/`, decodes to 32 bytes) in `onMounted`. If it fails, show the "link incomplete/damaged" error and do not offer Open (ideally do not fetch either).

**Re-opening the original link in the same tab does nothing and leaves the key in the address bar** — pages/m/[id].vue ~L115-126
- **What is wrong:** the key is read only in `onMounted`, and the old `route` watcher was removed. Once the URL is `/m/<id>`, entering `/m/<id>#<key>` is a same-document fragment navigation, so there is no reload and no remount.
- **Failure scenario:** the user refreshes, sees "open the original link again", and pastes the link into the same tab. The error stays, and the key now sits unstripped in the URL, in history and in `route.hash`.
- **Fix:** watch `route.hash` (or listen for `hashchange`) and rerun take-key, strip and fetch. Folding this into the `router.replace` fix above covers both.

**Tests that do not test what they claim** — tests/
- `crypto.service.spec.ts` ~L63-73, "normalizes the passphrase to NFC": as rendered, the two `"café-passphrase"` literals are identical. If the bytes really are identical, the test passes with `.normalize("NFC")` deleted. Use explicit escapes (`"cafe\u0301…"` to encrypt, `"caf\u00e9…"` to decrypt).
- `message.repository.spec.ts`: "deletes atomically" and "skips burn and expired" only regex-match SQL strings against a mock pool. Nothing executes the CTEs. `docker-compose.yml` already has a Postgres; add one integration test where two concurrent `/open` calls give exactly one payload.
- `tests/setup.ts` mocks `useAnalytics` wholesale, so nothing asserts that the URL sent to Plausible lacks the ID and fragment. Add a test on the real composable with `useTrackEvent` / `useTrackPageview` spied.

## NIT (optional)

- **"Enter passphrase" button appears on messages without a passphrase** — pages/m/[id].vue ~L26-33. The condition `payload && content === null && !isModalVisible` is true after a failed decrypt of a non-passphrase message, and briefly during every decrypt. Gate it on `payload?.has_passphrase`.
- **Stale shipped docs** — pages/privacy-policy.vue, README.md. Both describe v1 (plaintext by default, crypto-js, PBKDF2 1,000, hourly job, outbound-click tracking, the `is_private` prop). They are the lead's to fix, but the privacy page is a live route and must not ship as is.
- **Migration failure is ignored** — entrypoint.sh L3. There is no `set -e`, so a failed `node-pg-migrate up` still starts the app. Reads fail closed with 500s, but legacy plaintext rows stay until the expiry job removes them. Add `set -e` and `exec node …`.
- **Dependency audit** — package.json.
  - `sharp` / `ipx` (high) arrive via `@nuxt/image`. The public `/_ipx/**` transform endpoint only processes local `public/` files, so the parser CVEs look unreachable, but it is unthrottled. Move to `@nuxt/image@2.2.1`, or drop the module (it serves one logo and a few SVG icons).
  - `picomatch`: run `npm audit fix`.
  - `uuid` (via `node-cron` / `nuxt-scheduler`): the vulnerable `buf` path is not used; accept or replace the scheduler with `setInterval`.
  - `pg` is imported by `server/lib/pg.pool.ts` but not declared; it resolves only as a peer of the dev-only `node-pg-migrate`. Declare it.
- **CI skips the build gate** — .github/workflows/ci.yml. It runs eslint and vitest but not `npx nuxi build`, which the design's gate requires.
- **`encrypt` silently drops an empty passphrase** — composables/crypto.service.ts ~L118. `passphrase: ""` produces an unprotected message. The UI's 8-character check hides this, but throwing is safer for other callers.
- **Viewer passphrase field has no `autocomplete`** — components/message/PassphraseInput.vue L8. Browsers may offer to save it; add `autocomplete="off"` (or `one-time-code`).

## Verdict

The crypto core, burn-after-read atomicity, API validation and analytics hygiene match the design. I found no path for plaintext, key or passphrase to reach the server, and no flaw in the v2 construction.
The blocker is client-side: the key is not actually removed from history or router state, which defeats an explicit design control in a common flow.
Before merge, fix that plus the dead 4 KB limit, the IPv6 rate-limit bypass and the burn key pre-check, then replace the vacuous tests with ones that exercise a real router, real requests and a real database.
