import Plausible from "plausible-tracker";

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();

  const mockAnalytics = {
    trackEvent: () => {},
    trackPageView: () => {},
  };

  let mAnalytics = mockAnalytics;

  nuxtApp.provide("analytics", mAnalytics);
  nuxtApp.provide("initAnalytics", () => {
    const options = {
      domain: config.app.analyticsDomain,
      trackLocalhost: false,
    };
    let analytics = Plausible(options);
    nuxtApp.provide("analytics", analytics);
  });

  nuxtApp.provide("stopAnalytics", () => {
    nuxtApp.provide("analytics", mockAnalytics);
  });
});
