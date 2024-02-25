// SPDX-License-Identifier: AGPL-3.0-only

export class TimeUtils {
  static createExpireTimeMessage = (createdAt: Date | undefined, now: Date) => {
    if (!createdAt) {
      return undefined;
    }

    const expireDate = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);

    const diff = expireDate.getTime() - now.getTime();

    const hoursLeft = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutesLeft = Math.floor((diff / (1000 * 60)) % 60);

    let expireMessage = "";

    if (hoursLeft > 0 && hoursLeft < 24) {
      expireMessage += `${hoursLeft} hour${hoursLeft > 1 ? "s" : ""}`;
    }

    if (minutesLeft > 0) {
      if (hoursLeft > 0) {
        expireMessage += " and ";
      }

      expireMessage += `${minutesLeft} minute${minutesLeft > 1 ? "s" : ""}`;
    }

    return expireMessage || "";
  };
}
