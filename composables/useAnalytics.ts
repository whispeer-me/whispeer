export default function useAnalytics() {
  const trackEvent = (event: string, data?: any, options?: any) => {
    useTrackEvent(event, options, data);
  };

  const trackPageView = ({
    url,
    referrer,
    useRef = true,
  }: {
    url?: string;
    referrer?: string;
    useRef?: boolean;
  } = {}) => {
    let effectiveUrl = url || window.location.href;
    let effectiveReferrer = useRef ? referrer || document.referrer : referrer;

    useTrackPageview({ url: effectiveUrl, referrer: effectiveReferrer });
  };

  return {
    trackEvent,
    trackPageView,
  };
}
