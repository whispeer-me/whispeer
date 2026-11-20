// SPDX-License-Identifier: AGPL-3.0-only

// Shared hardening config, imported by nuxt.config.ts and unit tests.

export const POST_MESSAGE_LIMIT = { tokensPerInterval: 10, interval: 60_000 };
export const OTHER_MESSAGE_LIMIT = { tokensPerInterval: 60, interval: 60_000 };
// ponytail: coarse global cap on creates (all clients together) as a backstop
// against botnets; upgrade path: tune from real traffic or add a proof of work.
export const GLOBAL_POST_MESSAGE_LIMIT = { tokensPerInterval: 300, interval: 60_000 };
// Same backstop for reads/opens/view counts, so total traffic stays bounded
// even when the per-client table churns.
export const GLOBAL_OTHER_MESSAGE_LIMIT = { tokensPerInterval: 6000, interval: 60_000 };
export const MAX_BODY_BYTES = 4096;

export const securityHeaders = {
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      "'nonce-{{nonce}}'",
      "'strict-dynamic'",
      "https://plausible.io",
    ],
    // ponytail: 'unsafe-inline' styles (Vue SSR style attrs); upgrade path: nonce + drop inline styles.
    "style-src": ["'self'", "'unsafe-inline'"],
    "connect-src": ["'self'", "https://plausible.io"],
    "img-src": ["'self'", "data:"],
    "font-src": ["'self'"],
    "object-src": ["'none'"],
    "base-uri": ["'none'"],
    "frame-ancestors": ["'none'"],
    "form-action": ["'self'"],
    "upgrade-insecure-requests": true,
  },
  referrerPolicy: "no-referrer",
  strictTransportSecurity: {
    maxAge: 31536000,
    includeSubdomains: true,
    preload: false,
  },
  xContentTypeOptions: "nosniff",
  xFrameOptions: "DENY",
  permissionsPolicy: {
    camera: [],
    microphone: [],
    geolocation: [],
    payment: [],
    usb: [],
    "interest-cohort": [],
  },
} as const;

const NO_STORE = { headers: { "cache-control": "no-store" } };

export const securityRouteRules = {
  "/api/**": {
    ...NO_STORE,
    // nuxt-security reads route options only under `security`. It checks the
    // Content-Length header only; index.post.ts also caps the streamed body.
    security: {
      requestSizeLimiter: {
        maxRequestSizeInBytes: MAX_BODY_BYTES,
        maxUploadFileRequestInBytes: MAX_BODY_BYTES,
      },
    },
  },
  "/m/**": NO_STORE,
};
