// SPDX-License-Identifier: AGPL-3.0-only

export default function useAnalytics() {
  const trackEvent = (event: string, data?: any, options?: any) => {
    useTrackEvent(event, { ...options, ...data });
  };

  const trackEventClean = (event: string, props?: any) => {
    let effectiveUrl = window.location.href;
    let sanitezedUrl = sanitizeUrl(effectiveUrl);
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
    let sanitizedUrl = sanitizeUrl(effectiveUrl);

    let effectiveReferrer = useRef ? referrer || document.referrer : referrer;
    if (effectiveReferrer) {
      effectiveReferrer = sanitizeUrl(effectiveReferrer);
    }

    useTrackPageview({ url: sanitizedUrl, referrer: effectiveReferrer });
  };

  return {
    trackEvent,
    trackEventClean,
    trackPageView,
  };
}
