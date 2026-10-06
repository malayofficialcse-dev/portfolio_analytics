import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics } from '../analytics/analytics';

/**
 * Hook that auto-tracks page views on route change.
 * Place this once inside a layout component.
 */
export function useAnalyticsTracker(): void {
  const location = useLocation();
  const initializedRef = useRef(false);

  useEffect(() => {
    // Initialize analytics session once
    if (!initializedRef.current) {
      initializedRef.current = true;
      analytics.init();
    }
  }, []);

  useEffect(() => {
    // Track every page view
    const title = document.title || location.pathname;
    analytics.trackPageView(location.pathname, title);
  }, [location.pathname]);
}
