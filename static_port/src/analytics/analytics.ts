import { ANALYTICS_CONFIG } from './analyticsConfig';
import type { AnalyticsEventType } from './analyticsTypes';

// -- Visitor/Session ID management ---------------------------------

function generateId(prefix: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = prefix;
  for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

function getVisitorId(): string {
  let vid = localStorage.getItem('_pa_vid');
  if (!vid) {
    vid = generateId('V');
    localStorage.setItem('_pa_vid', vid);
  }
  return vid;
}

function getOrCreateSession(): { sessionId: string; isNew: boolean } {
  const SESSION_TIMEOUT = ANALYTICS_CONFIG.SESSION_TIMEOUT;
  const stored = sessionStorage.getItem('_pa_sid');
  const lastActivity = parseInt(sessionStorage.getItem('_pa_last') || '0');

  if (stored && Date.now() - lastActivity < SESSION_TIMEOUT) {
    sessionStorage.setItem('_pa_last', Date.now().toString());
    return { sessionId: stored, isNew: false };
  }

  const sid = generateId('S');
  sessionStorage.setItem('_pa_sid', sid);
  sessionStorage.setItem('_pa_last', Date.now().toString());
  return { sessionId: sid, isNew: true };
}

function getUTMParams(): { utmSource: string; utmMedium: string; utmCampaign: string } {
  const p = new URLSearchParams(window.location.search);
  return {
    utmSource: p.get('utm_source') || sessionStorage.getItem('_pa_utm_src') || '',
    utmMedium: p.get('utm_medium') || sessionStorage.getItem('_pa_utm_med') || '',
    utmCampaign: p.get('utm_campaign') || sessionStorage.getItem('_pa_utm_cmp') || '',
  };
}

// -- Fire-and-forget POST ------------------------------------------
async function sendBeacon(endpoint: string, data: object): Promise<void> {
  if (!ANALYTICS_CONFIG.ENABLED) return;
  if (localStorage.getItem('_pa_optout') === '1') return;

  try {
    const url = `${ANALYTICS_CONFIG.API_URL}/${endpoint}`;
    const payload = JSON.stringify(data);
    // Prefer sendBeacon for reliability on page unload
    if (endpoint === 'heartbeat' && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon(url, blob);
      return;
    }
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    });
  } catch {
    // Analytics failure must never break the portfolio
  }
}

// -- Analytics service ---------------------------------------------
class AnalyticsService {
  private visitorId: string;
  private sessionId: string;
  private pageStartTime: number = Date.now();
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private isInitialized = false;

  constructor() {
    this.visitorId = getVisitorId();
    const { sessionId } = getOrCreateSession();
    this.sessionId = sessionId;
  }

  async init(): Promise<void> {
    if (this.isInitialized) return;
    this.isInitialized = true;

    const { sessionId, isNew } = getOrCreateSession();
    this.sessionId = sessionId;

    if (isNew) {
      const utms = getUTMParams();
      // Persist UTM params in session
      if (utms.utmSource) sessionStorage.setItem('_pa_utm_src', utms.utmSource);
      if (utms.utmMedium) sessionStorage.setItem('_pa_utm_med', utms.utmMedium);
      if (utms.utmCampaign) sessionStorage.setItem('_pa_utm_cmp', utms.utmCampaign);

      await sendBeacon('session', {
        visitorId: this.visitorId,
        sessionId: this.sessionId,
        referrer: document.referrer || 'direct',
        language: navigator.language || '',
        entryPage: window.location.pathname,
        ...utms,
      });
    }

    this.startHeartbeat();
  }

  private startHeartbeat(): void {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = setInterval(() => {
      sessionStorage.setItem('_pa_last', Date.now().toString());
      sendBeacon('heartbeat', {
        sessionId: this.sessionId,
        path: window.location.pathname,
      });
    }, ANALYTICS_CONFIG.HEARTBEAT_INTERVAL);
  }

  trackPageView(path: string, title: string): void {
    const now = Date.now();
    const duration = now - this.pageStartTime;
    this.pageStartTime = now;

    sendBeacon('pageview', {
      visitorId: this.visitorId,
      sessionId: this.sessionId,
      path,
      title,
      referrer: document.referrer || '',
      duration: Math.round(duration / 1000),
    });
  }

  trackEvent(
    eventType: AnalyticsEventType,
    target: string = '',
    metadata: Record<string, unknown> = {}
  ): void {
    sendBeacon('event', {
      visitorId: this.visitorId,
      sessionId: this.sessionId,
      eventType,
      page: window.location.pathname,
      target,
      metadata,
    });
  }

  trackClick(target: string, eventType: AnalyticsEventType = 'EXTERNAL_LINK_CLICK'): void {
    this.trackEvent(eventType, target);
  }

  trackDownload(target: string): void {
    this.trackEvent('RESUME_DOWNLOAD', target);
  }

  trackResumeDownload(target: string = 'Resume'): void {
    this.trackEvent('RESUME_DOWNLOAD', target);
  }

  trackProjectView(projectTitle: string): void {
    this.trackEvent('PROJECT_VIEW', projectTitle);
  }

  trackProjectClick(projectTitle: string): void {
    this.trackEvent('PROJECT_CLICK', projectTitle);
  }

  trackGithubClick(target: string = 'github'): void {
    this.trackEvent('GITHUB_CLICK', target);
  }

  trackLinkedinClick(): void {
    this.trackEvent('LINKEDIN_CLICK', 'linkedin');
  }

  trackResearchClick(title: string): void {
    this.trackEvent('RESEARCH_CLICK', title);
  }

  trackCertificateClick(title: string): void {
    this.trackEvent('CERTIFICATE_CLICK', title);
  }

  trackLiveDemoClick(project: string): void {
    this.trackEvent('LIVE_DEMO_CLICK', project);
  }

  trackContactClick(method: string): void {
    this.trackEvent('CONTACT_CLICK', method);
  }

  trackEmailClick(): void {
    this.trackEvent('EMAIL_CLICK', 'email');
  }

  optOut(): void {
    localStorage.setItem('_pa_optout', '1');
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
  }

  optIn(): void {
    localStorage.removeItem('_pa_optout');
    this.startHeartbeat();
  }

  isOptedOut(): boolean {
    return localStorage.getItem('_pa_optout') === '1';
  }

  getVisitorId(): string { return this.visitorId; }
  getSessionId(): string { return this.sessionId; }
}

// Singleton
export const analytics = new AnalyticsService();
export default analytics;
