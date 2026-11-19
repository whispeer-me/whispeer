// SPDX-License-Identifier: AGPL-3.0-only

type Scheduler = {
  run: (callback: () => unknown) => { everyMinute: () => void };
};

export const scheduleExpiryJob = (scheduler: Scheduler, job: () => unknown) => {
  scheduler.run(job).everyMinute();
};
