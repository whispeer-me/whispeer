export default function useAnalytics() {
  const trackEvent = (event: string, data?: any, options?: any) => {
    useTrackEvent(event, { ...options, ...data });
  };

  const trackEventClean = (event: string, url: string, props?: any) => {
    let sanitezedUrl = sanitizeUrl(url);
    useTrackEvent(
      event,
      {
        url: sanitezedUrl,
        referrer: null,
        ...props,
      },
      {
        url: sanitezedUrl,
        referrer: null,
      },
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
    let sanitizedUrl = sanitizeUrl(effectiveUrl);

    let effectiveReferrer = useRef ? referrer || document.referrer : referrer;
    if (effectiveReferrer) {
      effectiveReferrer = sanitizeUrl(effectiveReferrer);
    }

    useTrackPageview({ url: sanitizedUrl, referrer: effectiveUrl });
  };

  return {
    trackEvent,
    trackEventClean,
    trackPageView,
  };
}
