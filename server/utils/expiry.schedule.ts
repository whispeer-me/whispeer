// SPDX-License-Identifier: AGPL-3.0-only

export const EXPIRY_INTERVAL_MS = 60_000;

// Runs the job now and then every minute. unref(): the timer never keeps the
// process alive on shutdown.
export const scheduleExpiryJob = (job: () => unknown): NodeJS.Timeout => {
  job();
  const timer = setInterval(job, EXPIRY_INTERVAL_MS);
  timer.unref();
  return timer;
};
