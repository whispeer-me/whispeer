import PreferenceService from "../../../src/services/PreferenceService";

describe("shouldShow", () => {
  it("returns false if viewCount equals maxCount", () => {
    const key = "testKey";
    const maxCount = 5;
    const viewCount = 5;

    jest.spyOn(PreferenceService, "getViewsCount").mockReturnValue(viewCount);

    expect(PreferenceService.shouldShow(key, maxCount)).toBe(false);
  });

  it("returns true if viewCount is less than maxCount and randomChance is true", () => {
    const key = "testKey";
    const maxCount = 5;
    const viewCount = 3;

    jest.spyOn(PreferenceService, "getViewsCount").mockReturnValue(viewCount);
    jest.spyOn(Math, "random").mockReturnValue(0.4);

    expect(PreferenceService.shouldShow(key, maxCount)).toBe(true);
  });

  it("returns true if viewCount is less than maxCount but randomChance is false", () => {
    const key = "testKey";
    const maxCount = 5;
    const viewCount = 3;

    jest.spyOn(PreferenceService, "getViewsCount").mockReturnValue(viewCount);

    expect(PreferenceService.shouldShow(key, maxCount, false)).toBe(true);
  });

  it("increments viewCount if shown", () => {
    const key = "testKey";
    const maxCount = 5;
    const viewCount = 3;

    jest.spyOn(PreferenceService, "getViewsCount").mockReturnValue(viewCount);
    jest.spyOn(Math, "random").mockReturnValue(0.4);
    const incrementSpy = jest.spyOn(PreferenceService, "incrementViewsCount");

    PreferenceService.shouldShow(key, maxCount);

    expect(incrementSpy).toHaveBeenCalledWith(key);
  });
});
