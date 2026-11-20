// SPDX-License-Identifier: AGPL-3.0-only

import { describe, it, expect, vi } from "vitest";
import { limitFor, clientIp, createLimiter, rateKey } from "~/server/utils/rate.limit";
import {
  GLOBAL_POST_MESSAGE_LIMIT,
  MAX_BODY_BYTES,
  securityRouteRules,
  securityHeaders,
} from "~/security.config";

describe("limitFor", () => {
  it("POST /api/message 10/min", () => {
    expect(limitFor("POST", "/api/message")?.limit).toEqual({ tokensPerInterval: 10, interval: 60_000 });
  });
  it("other message routes 60/min", () => {
    const routes = [
      ["GET", "/api/message/abcdefghij"],
      ["POST", "/api/message/abcdefghij/open"],
      ["PATCH", "/api/message/abcdefghij"],
      ["GET", "/api/message/stats"],
    ];
    for (const [m, p] of routes) {
      expect(limitFor(m, p)?.limit.tokensPerInterval).toBe(60);
    }
  });
  it("non-api not limited", () => {
    expect(limitFor("GET", "/m/new")).toBeNull();
  });
});

describe("clientIp", () => {
  it("prefers fly-client-ip", () => {
    expect(clientIp({ "fly-client-ip": "1.2.3.4" }, "10.0.0.1")).toBe("1.2.3.4");
  });
  it("falls back to socket", () => {
    expect(clientIp({}, "10.0.0.1")).toBe("10.0.0.1");
  });
});

describe("rateKey", () => {
  it("keeps IPv4 as is", () => {
    expect(rateKey("1.2.3.4")).toBe("1.2.3.4");
  });
  it("unwraps v4-mapped IPv6", () => {
    expect(rateKey("::ffff:1.2.3.4")).toBe("1.2.3.4");
    expect(rateKey("::FFFF:1.2.3.4")).toBe("1.2.3.4");
  });
  it("keys IPv6 on the /64 prefix", () => {
    const a = rateKey("2001:db8:1:2:aaaa:bbbb:cccc:dddd");
    expect(a).toBe(rateKey("2001:db8:1:2::1"));
    expect(a).toBe(rateKey("2001:0DB8:0001:0002:ffff::"));
    expect(a).not.toBe(rateKey("2001:db8:1:3::1"));
  });
  it("handles :: compression in the prefix", () => {
    expect(rateKey("2001:db8::1")).toBe(rateKey("2001:db8:0:0:ffff::2"));
    expect(rateKey("::1")).toBe(rateKey("::2"));
  });
  it("strips zone ids", () => {
    expect(rateKey("fe80::1%eth0")).toBe(rateKey("fe80::2"));
  });
});

describe("createLimiter IPv6 rotation", () => {
  it("addresses in one /64 share a bucket", () => {
    const allow = createLimiter(() => 0);
    const limit = { tokensPerInterval: 2, interval: 1000 };
    expect(allow("2001:db8:1:2::1", "b", limit)).toBe(true);
    expect(allow("2001:db8:1:2::2", "b", limit)).toBe(true);
    expect(allow("2001:db8:1:2::3", "b", limit)).toBe(false);
  });
});

describe("createLimiter memory bounds", () => {
  it("when full, evicts the oldest client: newcomers are tracked and limited, never locked out", () => {
    const allow = createLimiter(() => 0, { maxKeys: 3 });
    const limit = { tokensPerInterval: 1, interval: 1000 };
    expect(allow("1.1.1.1", "b", limit)).toBe(true);
    expect(allow("1.1.1.2", "b", limit)).toBe(true);
    expect(allow("1.1.1.3", "b", limit)).toBe(true);
    // Table full: a newcomer gets in (evicting 1.1.1.1) and is limited like anyone.
    expect(allow("2.2.2.2", "b", limit)).toBe(true);
    expect(allow("2.2.2.2", "b", limit)).toBe(false);
    // Clients still in the table keep their limit.
    expect(allow("1.1.1.3", "b", limit)).toBe(false);
    // Many newcomers: each still gets exactly its own one request.
    for (let i = 0; i < 50; i++) {
      expect(allow(`3.3.3.${i}`, "b", limit)).toBe(true);
      expect(allow(`3.3.3.${i}`, "b", limit)).toBe(false);
    }
  });

  it("eviction never resets the global cap", () => {
    const allow = createLimiter(() => 0, { maxKeys: 2 });
    const limit = { tokensPerInterval: 10, interval: 1000 };
    const global = { tokensPerInterval: 3, interval: 1000 };
    expect(allow("1.1.1.1", "post", limit, global)).toBe(true);
    expect(allow("1.1.1.2", "post", limit, global)).toBe(true);
    expect(allow("9.9.9.9", "post", limit, global)).toBe(true);
    for (let i = 0; i < 20; i++) {
      expect(allow(`8.8.8.${i}`, "post", limit, global)).toBe(false);
    }
  });

  it("sweeps at most once per interval, not per request", () => {
    let t = 0;
    const allow = createLimiter(() => t, { maxKeys: 1000 });
    const limit = { tokensPerInterval: 5, interval: 1000 };
    for (let i = 0; i < 100; i++) {
      allow(`10.0.0.${i}`, "b", limit);
    }
    const iterSpy = vi.spyOn(Map.prototype, "entries");
    const forOfSpy = vi.spyOn(Map.prototype, Symbol.iterator);
    for (let i = 0; i < 100; i++) {
      t = i; // all within one interval
      allow("10.0.0.1", "b", limit);
    }
    expect(iterSpy.mock.calls.length + forOfSpy.mock.calls.length).toBe(0);
    t = 2000;
    allow("10.0.0.1", "b", limit);
    expect(iterSpy.mock.calls.length + forOfSpy.mock.calls.length).toBe(1);
    iterSpy.mockRestore();
    forOfSpy.mockRestore();
  });

  it("global cap on creates across all IPs", () => {
    const allow = createLimiter(() => 0);
    const limit = { tokensPerInterval: 10, interval: 1000 };
    const global = { tokensPerInterval: 3, interval: 1000 };
    expect(allow("1.1.1.1", "post", limit, global)).toBe(true);
    expect(allow("1.1.1.2", "post", limit, global)).toBe(true);
    expect(allow("1.1.1.3", "post", limit, global)).toBe(true);
    expect(allow("1.1.1.4", "post", limit, global)).toBe(false);
  });
});

describe("limitFor global cap", () => {
  it("POST /api/message has a global cap, others do not", () => {
    expect(limitFor("POST", "/api/message")?.global).toEqual(GLOBAL_POST_MESSAGE_LIMIT);
    expect(limitFor("GET", "/api/message/abcdefghij")?.global).toBeUndefined();
  });
});

describe("createLimiter", () => {
  it("blocks after limit, per ip, resets after interval", () => {
    let t = 0;
    const allow = createLimiter(() => t);
    const limit = { tokensPerInterval: 2, interval: 1000 };
    expect(allow("a", "b", limit)).toBe(true);
    expect(allow("a", "b", limit)).toBe(true);
    expect(allow("a", "b", limit)).toBe(false);
    expect(allow("c", "b", limit)).toBe(true);
    t = 1000;
    expect(allow("a", "b", limit)).toBe(true);
  });
});

describe("security config", () => {
  it("4 KB body limit on /api/**", () => {
    expect(MAX_BODY_BYTES).toBe(4096);
    // nuxt-security reads per-route options only under `security`.
    expect(securityRouteRules["/api/**"].security.requestSizeLimiter.maxRequestSizeInBytes).toBe(4096);
    expect(securityRouteRules["/api/**"]).not.toHaveProperty("requestSizeLimiter");
  });
  it("no-store on api and m", () => {
    expect(securityRouteRules["/api/**"].headers["cache-control"]).toBe("no-store");
    expect(securityRouteRules["/m/**"].headers["cache-control"]).toBe("no-store");
  });
  it("CSP allows plausible, forbids framing", () => {
    expect(securityHeaders.contentSecurityPolicy["script-src"]).toContain("https://plausible.io");
    expect(securityHeaders.contentSecurityPolicy["frame-ancestors"]).toEqual(["'none'"]);
  });
});
