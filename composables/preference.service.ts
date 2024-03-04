// SPDX-License-Identifier: AGPL-3.0-only

export default {
  /**
   * Checks if a feature with the given key should be shown, based on:
   * - maxCount: The maximum number of times to show it
   * - randomChance: Whether to show randomly before reaching maxCount
   * - viewCount: Fetched from localStorage for the key
   *
   * Increments the viewCount if it is shown.
   * Returns a boolean indicating if it should be shown.
   */
  shouldShow (key: string, maxCount: number, randomChance = true): boolean {
    const viewCount = this.getViewsCount(key);

    let shouldShow = false;

    // Show randomly if we haven't show them enough.
    if (viewCount < maxCount) {
      shouldShow = randomChance ? Math.random() < 0.5 : true;
      if (shouldShow) {
        this.incrementViewsCount(key);
      }
    }

    return shouldShow;
  },

  getViewsCount (key: string): number {
    try {
      return Number(localStorage.getItem(key)) || 0;
    } catch (error) {
      return 0;
    }
  },

  setViewsCount (key: string, value: number) {
    try {
      localStorage.setItem(key, value.toString());
    } catch (error) {
    }
  },

  incrementViewsCount (key: string) {
    let currentViewCount = this.getViewsCount(key);
    this.setViewsCount(key, ++currentViewCount);
  },
};
