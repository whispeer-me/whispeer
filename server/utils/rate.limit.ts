// SPDX-License-Identifier: AGPL-3.0-only

import {
  GLOBAL_POST_MESSAGE_LIMIT,
  OTHER_MESSAGE_LIMIT,
  POST_MESSAGE_LIMIT,
} from "~/security.config";

export interface Limit {
  tokensPerInterval: number;
  interval: number;
}

export interface Rule {
  bucket: string;
  limit: Limit;
  // Shared by all clients (caps total creates, whatever the source).
  global?: Limit;
}

// Policy per route. Null: not limited.
export const limitFor = (method: string, path: string): Rule | null => {
  const p = path.split("?")[0].replace(/\/+$/, "");
  if (p === "/api/message" && method === "POST") {
    return { bucket: "post", limit: POST_MESSAGE_LIMIT, global: GLOBAL_POST_MESSAGE_LIMIT };
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

// Bucket key for an address: IPv4 as is (v4-mapped IPv6 unwrapped), IPv6 by
// its /64 prefix, since one client usually controls a whole /64.
export const rateKey = (ip: string): string => {
  const addr = ip.trim().toLowerCase().split("%")[0];
  const mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/.exec(addr);
  if (mapped) { return mapped[1]; }
  if (!addr.includes(":")) { return addr; }

  const [head, tail] = addr.split("::");
  const headParts = head ? head.split(":") : [];
  const tailParts = tail === undefined ? [] : (tail ? tail.split(":") : []);
  // An embedded IPv4 tail takes two groups; it never reaches the /64 prefix.
  const tailGroups = tailParts.reduce((n, g) => n + (g.includes(".") ? 2 : 1), 0);
  const zeros = tail === undefined ? 0 : Math.max(0, 8 - headParts.length - tailGroups);
  const groups = [...headParts, ...Array(zeros).fill("0"), ...tailParts];
  const prefix = groups
    .slice(0, 4)
    .map(g => (parseInt(g, 16) || 0).toString(16));
  while (prefix.length < 4) { prefix.push("0"); }
  return `${prefix.join(":")}::/64`;
};

const DEFAULT_MAX_KEYS = 100_000;

// ponytail: in-memory, per-process (single Fly machine); upgrade path: shared store.
// IPs live only in this Map for one interval, never logged or persisted.
export const createLimiter = (
  now: () => number = Date.now,
  { maxKeys = DEFAULT_MAX_KEYS }: { maxKeys?: number } = {},
) => {
  const hits = new Map<string, { count: number; start: number; interval: number }>();
  let lastSweep = now();
  let sweepEvery = Infinity;

  // At most once per interval (or when forced): drop windows that have ended.
  const sweep = (t: number, force = false) => {
    if (!force && t - lastSweep < sweepEvery) { return; }
    lastSweep = t;
    for (const [k, v] of hits) {
      if (t - v.start >= v.interval) { hits.delete(k); }
    }
  };

  const take = (key: string, limit: Limit, t: number, capped: boolean): boolean => {
    const e = hits.get(key);
    if (!e || t - e.start >= limit.interval) {
      if (!e && capped && hits.size >= maxKeys) {
        sweep(t, true);
        // ponytail: still full → let new clients through untracked (memory stays
        // bounded; known clients stay limited; the global create cap still holds).
        // Failing closed here would lock out every new visitor under a flood.
        // Upgrade path: LRU eviction or coarser IPv6 prefixes when a /48 floods.
        if (hits.size >= maxKeys) { return true; }
      }
      hits.set(key, { count: 1, start: t, interval: limit.interval });
      return true;
    }
    e.count++;
    return e.count <= limit.tokensPerInterval;
  };

  return (ip: string, bucket: string, limit: Limit, global?: Limit): boolean => {
    const t = now();
    sweepEvery = Math.min(sweepEvery, limit.interval);
    sweep(t);
    if (!take(`${bucket}|${rateKey(ip)}`, limit, t, true)) { return false; }
    return !global || take(`${bucket}|*`, global, t, false);
  };
};
