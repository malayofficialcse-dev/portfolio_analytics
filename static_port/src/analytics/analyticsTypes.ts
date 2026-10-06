// Analytics Event Types
export type AnalyticsEventType =
  | 'PAGE_VIEW'
  | 'PROJECT_VIEW'
  | 'PROJECT_CLICK'
  | 'RESUME_DOWNLOAD'
  | 'GITHUB_CLICK'
  | 'LINKEDIN_CLICK'
  | 'LIVE_DEMO_CLICK'
  | 'RESEARCH_CLICK'
  | 'CERTIFICATE_CLICK'
  | 'CONTACT_CLICK'
  | 'EXTERNAL_LINK_CLICK'
  | 'EMAIL_CLICK'
  | 'PHONE_CLICK'
  | 'SOCIAL_CLICK'
  | 'NAV_CLICK'
  | 'BOOK_CLICK'
  | 'EVENT_CLICK';

export interface VisitorInfo {
  visitorId: string;
  sessionId: string;
  isReturning: boolean;
}

export interface TrackEventPayload {
  visitorId: string;
  sessionId: string;
  eventType: AnalyticsEventType;
  page: string;
  target?: string;
  metadata?: Record<string, unknown>;
}

export interface TrackPageViewPayload {
  visitorId: string;
  sessionId: string;
  path: string;
  title: string;
  referrer?: string;
  duration?: number;
}
