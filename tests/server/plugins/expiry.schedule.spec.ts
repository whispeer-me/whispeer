// SPDX-License-Identifier: AGPL-3.0-only

import { describe, it, expect, vi } from "vitest";

import { scheduleExpiryJob } from "~/server/utils/expiry.schedule";

describe("expiry job schedule", () => {
  it("runs every minute", () => {
    const everyMinute = vi.fn();
    const hourly = vi.fn();
    const run = vi.fn().mockReturnValue({ everyMinute, hourly });
    const job = vi.fn();

    scheduleExpiryJob({ run }, job);

    expect(run).toHaveBeenCalledWith(job);
    expect(everyMinute).toHaveBeenCalledTimes(1);
    expect(hourly).not.toHaveBeenCalled();
  });
});
