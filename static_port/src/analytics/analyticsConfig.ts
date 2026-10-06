const rawUrl = (import.meta.env.VITE_ANALYTICS_URL || 'http://localhost:5001').replace(/\/api\/?$/, '');

// Analytics configuration
export const ANALYTICS_CONFIG = {
  // Backend API URL
  API_URL: `${rawUrl}/api/analytics`,

  // How often to send heartbeat (ms)
  HEARTBEAT_INTERVAL: 30000,

  // How long to wait before tracking page duration (ms)
  PAGE_DURATION_DEBOUNCE: 500,

  // Enable/disable analytics (respects user opt-out)
  ENABLED: true,

  // Session timeout (ms) - 30 minutes
  SESSION_TIMEOUT: 30 * 60 * 1000,
} as const;
