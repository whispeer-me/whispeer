// SPDX-License-Identifier: AGPL-3.0-only

import { POST_MESSAGE_LIMIT, OTHER_MESSAGE_LIMIT } from "~/security.config";

export interface Limit {
  tokensPerInterval: number;
  interval: number;
}

// Policy per route. Null: not limited.
export const limitFor = (method: string, path: string): { bucket: string; limit: Limit } | null => {
  const p = path.split("?")[0].replace(/\/+$/, "");
  if (p === "/api/message" && method === "POST") {
    return { bucket: "post", limit: POST_MESSAGE_LIMIT };
  }
  if (p === "/api/message" || p.startsWith("/api/message/")) {
    return { bucket: "other", limit: OTHER_MESSAGE_LIMIT };
  }
  return null;
};

// Fly's proxy sets fly-client-ip; fall back to the socket address.
export const clientIp = (
  headers: Record<string, string | string[] | undefined>,
  socketAddress: string | undefined,
): string => {
  const h = headers["fly-client-ip"];
  const v = Array.isArray(h) ? h[0] : h;
  return (v && v.trim()) || socketAddress || "unknown";
};

// ponytail: in-memory, per-process (single Fly machine); upgrade path: shared store.
// IPs live only in this Map for one interval, never logged or persisted.
export const createLimiter = (now: () => number = Date.now) => {
  const hits = new Map<string, { count: number; start: number }>();
  return (ip: string, bucket: string, limit: Limit): boolean => {
    const t = now();
    if (hits.size > 10_000) {
      for (const [k, v] of hits) {
        if (t - v.start >= limit.interval) { hits.delete(k); }
      }
    }
    const key = `${bucket}|${ip}`;
    const e = hits.get(key);
    if (!e || t - e.start >= limit.interval) {
      hits.set(key, { count: 1, start: t });
      return true;
    }
    e.count++;
    return e.count <= limit.tokensPerInterval;
  };
};
