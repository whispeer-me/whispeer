// SPDX-License-Identifier: AGPL-3.0-only

import { createError, defineEventHandler, getRequestURL } from "h3";
import { clientIp, createLimiter, limitFor } from "~/server/utils/rate.limit";

// Custom instead of nuxt-security's rateLimiter: that one has no socket-address
// fallback when the IP header is absent (all clients would share one bucket).
const allow = createLimiter();

export default defineEventHandler((event) => {
  const rule = limitFor(event.method, getRequestURL(event).pathname);
  if (!rule) { return; }
  const ip = clientIp(event.node.req.headers, event.node.req.socket?.remoteAddress);
  if (!allow(ip, rule.bucket, rule.limit, rule.global)) {
    throw createError({ statusCode: 429, statusMessage: "Too Many Requests" });
  }
});
