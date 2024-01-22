export default function useAnalytics() {
  const { $initAnalytics } = useNuxtApp();

  onMounted(async () => {
    const doNotTrackIsEnabled = navigator.doNotTrack === "1";
    const consentGiven = await preferenceService.getAnalyticsConsent();

    if (!doNotTrackIsEnabled && consentGiven === "true") {
      $initAnalytics();
    }
  });
}
