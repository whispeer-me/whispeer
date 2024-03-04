// SPDX-License-Identifier: AGPL-3.0-only

export default function useAnalytics () {
  const trackEvent = (event: string, data?: any, options?: any) => {
    useTrackEvent(event, { ...options, ...data });
  };

  const trackEventClean = (event: string, props?: any) => {
    const effectiveUrl = window.location.href;
    const sanitezedUrl = sanitizeUrl(effectiveUrl);
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
    const effectiveUrl = url || window.location.href;
    const sanitizedUrl = sanitizeUrl(effectiveUrl);

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
