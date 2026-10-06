import { Request, Response, NextFunction } from 'express';
import { UAParser } from 'ua-parser-js';
import { v4 as uuidv4 } from 'uuid';
import { Visitor } from '../models/Visitor';
import { Session } from '../models/Session';
import { PageView } from '../models/PageView';
import { AnalyticsEvent } from '../models/AnalyticsEvent';
import { getGeoInfo, getClientIp } from '../services/geoService';
import { logger } from '../utils/logger';

function parseDevice(ua: string): { deviceType: string; browser: string; browserVersion: string; os: string } {
  const parser = new UAParser(ua);
  const result = parser.getResult();
  let deviceType = 'desktop';
  if (result.device.type === 'mobile') deviceType = 'mobile';
  else if (result.device.type === 'tablet') deviceType = 'tablet';
  return {
    deviceType,
    browser: result.browser.name || 'Unknown',
    browserVersion: result.browser.version || '',
    os: result.os.name || 'Unknown',
  };
}

// POST /api/analytics/session
export const createSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { visitorId, sessionId, referrer, utmSource, utmMedium, utmCampaign, language, entryPage } = req.body;
    const ua = req.headers['user-agent'] || '';
    const ip = getClientIp(req as any);
    const geo = getGeoInfo(ip);
    const device = parseDevice(ua);

    // Upsert visitor
    const existingVisitor = await Visitor.findOne({ visitorId });
    const isReturning = !!existingVisitor;

    await Visitor.findOneAndUpdate(
      { visitorId },
      {
        $set: {
          lastSeen: new Date(),
          country: geo.country,
          region: geo.region,
          city: geo.city,
          deviceType: device.deviceType,
          browser: device.browser,
          browserVersion: device.browserVersion,
          operatingSystem: device.os,
          language: language || '',
          referrer: referrer || 'direct',
          isReturning,
        },
        $setOnInsert: { firstSeen: new Date(), visitorId, totalPageViews: 0 },
        $inc: { totalSessions: 1 },
      },
      { upsert: true, new: true }
    );

    // Create session
    await Session.create({
      sessionId: sessionId || uuidv4(),
      visitorId,
      startedAt: new Date(),
      lastActivityAt: new Date(),
      entryPage: entryPage || '/',
      exitPage: entryPage || '/',
      pageViews: 0,
      deviceType: device.deviceType,
      browser: device.browser,
      operatingSystem: device.os,
      referrer: referrer || 'direct',
      utmSource: utmSource || '',
      utmMedium: utmMedium || '',
      utmCampaign: utmCampaign || '',
      isActive: true,
    });

    res.status(201).json({ success: true, isReturning });
  } catch (err) {
    logger.error('createSession error:', err);
    next(err);
  }
};

// POST /api/analytics/pageview
export const trackPageView = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { visitorId, sessionId, path, title, referrer, duration } = req.body;
    const pagePath = path || req.body.page || '/';

    await PageView.create({
      visitorId,
      sessionId,
      path: pagePath,
      title: title || pagePath,
      timestamp: new Date(),
      duration: duration || 0,
      referrer: referrer || '',
    });

    // Update session
    await Session.findOneAndUpdate(
      { sessionId },
      { $inc: { pageViews: 1 }, $set: { lastActivityAt: new Date(), exitPage: path, isActive: true } }
    );

    // Update visitor total page views
    await Visitor.findOneAndUpdate({ visitorId }, { $inc: { totalPageViews: 1 }, $set: { lastSeen: new Date() } });

    res.status(201).json({ success: true });
  } catch (err) {
    logger.error('trackPageView error:', err);
    next(err);
  }
};

// POST /api/analytics/event
export const trackEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { visitorId, sessionId, eventType, page, target, metadata } = req.body;

    await AnalyticsEvent.create({
      visitorId,
      sessionId,
      eventType,
      page: page || '',
      target: target || '',
      metadata: metadata || {},
      timestamp: new Date(),
    });

    // Keep session alive
    await Session.findOneAndUpdate({ sessionId }, { $set: { lastActivityAt: new Date() } });

    res.status(201).json({ success: true });
  } catch (err) {
    logger.error('trackEvent error:', err);
    next(err);
  }
};

// POST /api/analytics/heartbeat
export const heartbeat = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { sessionId, path } = req.body;
    await Session.findOneAndUpdate(
      { sessionId },
      { $set: { lastActivityAt: new Date(), exitPage: path, isActive: true } }
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
