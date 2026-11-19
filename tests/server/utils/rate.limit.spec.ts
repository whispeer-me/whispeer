// SPDX-License-Identifier: AGPL-3.0-only

import { describe, it, expect } from "vitest";
import { limitFor, clientIp, createLimiter } from "~/server/utils/rate.limit";
import { MAX_BODY_BYTES, securityRouteRules, securityHeaders } from "~/security.config";

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
    expect(securityRouteRules["/api/**"].requestSizeLimiter.maxRequestSizeInBytes).toBe(4096);
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
