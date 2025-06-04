// SPDX-License-Identifier: AGPL-3.0-only

import { describe, it, expect } from "vitest";
import sanitizeUrl from "~/utils/sanitize.url";

describe("sanitizeUrl", () => {
  it("should return the same URL if the path does not exist in the URL", () => {
    const url = "https://example.com/abc";
    const sanitizedUrl = sanitizeUrl(url);
    expect(sanitizedUrl).toBe(url);
  });

  it("should return the URL with the path if the path exists in the URL", () => {
    const url = "https://example.com/m/123abc";
    const sanitizedUrl = sanitizeUrl(url);
    expect(sanitizedUrl).toBe("https://example.com/m/");
  });
});
