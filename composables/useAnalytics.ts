export default function useAnalytics() {
  const trackEvent = (event: string, data?: any, options?: any) => {
    useTrackEvent(event, { ...options, ...data });
  };

  const trackEventClean = (event: string, url: string, props?: any) => {
    useTrackEvent(
      event,
      {
        url,
        referrer: null,
        ...props,
      },
      {
        url,
        referrer: null,
      }
    );
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
    trackEventClean,
    trackPageView,
  };
}
