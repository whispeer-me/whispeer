// SPDX-License-Identifier: AGPL-3.0-only

import { describe, it, expect, vi, afterEach } from "vitest";

import { EXPIRY_INTERVAL_MS, scheduleExpiryJob } from "~/server/utils/expiry.schedule";

describe("expiry job schedule", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("runs once at startup, then every minute, on an unref'd timer", () => {
    vi.useFakeTimers();
    const job = vi.fn();

    const timer = scheduleExpiryJob(job);

    expect(EXPIRY_INTERVAL_MS).toBe(60_000);
    expect(job).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(59_999);
    expect(job).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1);
    expect(job).toHaveBeenCalledTimes(2);
    vi.advanceTimersByTime(60_000 * 3);
    expect(job).toHaveBeenCalledTimes(5);
    expect(timer.hasRef()).toBe(false);
    clearInterval(timer);
  });
});
