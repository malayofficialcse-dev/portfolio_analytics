import { Request, Response, NextFunction } from 'express';
import { Visitor } from '../models/Visitor';
import { Session } from '../models/Session';
import { PageView } from '../models/PageView';
import { AnalyticsEvent } from '../models/AnalyticsEvent';
import { logger } from '../utils/logger';

const ACTIVE_THRESHOLD_MINUTES = 5;

function getDateRange(range: string): Date {
  const now = new Date();
  const map: Record<string, number> = { '1d': 1, '7d': 7, '30d': 30, '90d': 90 };
  const days = map[range] || 7;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

// GET /api/admin/analytics/overview
export const getOverview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { range = '30d' } = req.query;
    const since = getDateRange(range as string);
    const activeThreshold = new Date(Date.now() - ACTIVE_THRESHOLD_MINUTES * 60 * 1000);

    const [
      totalVisitors,
      uniqueVisitors,
      totalSessions,
      totalPageViews,
      activeNow,
      resumeDownloads,
      projectViews,
    ] = await Promise.all([
      Visitor.countDocuments({ firstSeen: { $gte: since } }),
      Visitor.countDocuments({ lastSeen: { $gte: since } }),
      Session.countDocuments({ startedAt: { $gte: since } }),
      PageView.countDocuments({ timestamp: { $gte: since } }),
      Session.countDocuments({ lastActivityAt: { $gte: activeThreshold }, isActive: true }),
      AnalyticsEvent.countDocuments({ eventType: 'RESUME_DOWNLOAD', timestamp: { $gte: since } }),
      AnalyticsEvent.countDocuments({ eventType: 'PROJECT_VIEW', timestamp: { $gte: since } }),
    ]);

    res.json({
      totalVisitors,
      uniqueVisitors,
      totalSessions,
      totalPageViews,
      activeNow,
      resumeDownloads,
      projectViews,
    });
  } catch (err) {
    logger.error('getOverview error:', err);
    next(err);
  }
};

// GET /api/admin/analytics/traffic
export const getTrafficChart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { range = '7d' } = req.query;
    const since = getDateRange(range as string);

    const [visitors, pageViews, sessions] = await Promise.all([
      Visitor.aggregate([
        { $match: { firstSeen: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$firstSeen' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      PageView.aggregate([
        { $match: { timestamp: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Session.aggregate([
        { $match: { startedAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$startedAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Merge by date
    const dateMap: Record<string, { date: string; visitors: number; pageViews: number; sessions: number }> = {};
    const addToMap = (arr: Array<{ _id: string; count: number }>, key: string) => {
      arr.forEach(({ _id, count }) => {
        if (!dateMap[_id]) dateMap[_id] = { date: _id, visitors: 0, pageViews: 0, sessions: 0 };
        (dateMap[_id] as any)[key] = count;
      });
    };
    addToMap(visitors, 'visitors');
    addToMap(pageViews, 'pageViews');
    addToMap(sessions, 'sessions');

    const data = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/analytics/pages
export const getTopPages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { range = '30d' } = req.query;
    const since = getDateRange(range as string);

    const pages = await PageView.aggregate([
      { $match: { timestamp: { $gte: since } } },
      {
        $group: {
          _id: '$path',
          views: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$visitorId' },
          avgDuration: { $avg: '$duration' },
        },
      },
      {
        $project: {
          path: '$_id',
          views: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' },
          avgDuration: { $round: ['$avgDuration', 0] },
          _id: 0,
        },
      },
      { $sort: { views: -1 } },
      { $limit: 20 },
    ]);

    res.json(pages);
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/analytics/page-detail
export const getPageDetail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { path = '/', range = '30d' } = req.query;
    const pagePath = (path as string).trim();
    const since = getDateRange(range as string);

    const [pageStats, trafficTrend, referrers, eventsOnPage, sessionStats] = await Promise.all([
      PageView.aggregate([
        { $match: { path: pagePath, timestamp: { $gte: since } } },
        {
          $group: {
            _id: null,
            views: { $sum: 1 },
            uniqueVisitors: { $addToSet: '$visitorId' },
            avgDuration: { $avg: '$duration' },
          },
        },
      ]),
      PageView.aggregate([
        { $match: { path: pagePath, timestamp: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            views: { $sum: 1 },
            uniqueVisitors: { $addToSet: '$visitorId' },
          },
        },
        { $project: { date: '$_id', views: 1, uniqueVisitors: { $size: '$uniqueVisitors' }, _id: 0 } },
        { $sort: { date: 1 } },
      ]),
      PageView.aggregate([
        { $match: { path: pagePath, timestamp: { $gte: since }, referrer: { $ne: '' } } },
        { $group: { _id: '$referrer', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),
      AnalyticsEvent.aggregate([
        { $match: { page: pagePath, timestamp: { $gte: since } } },
        {
          $group: {
            _id: { eventType: '$eventType', target: '$target' },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Session.aggregate([
        { $match: { startedAt: { $gte: since } } },
        {
          $group: {
            _id: null,
            totalSessions: { $sum: 1 },
            entrySessions: { $sum: { $cond: [{ $eq: ['$entryPage', pagePath] }, 1, 0] } },
            exitSessions: { $sum: { $cond: [{ $eq: ['$exitPage', pagePath] }, 1, 0] } },
            bounces: {
              $sum: {
                $cond: [
                  { $and: [{ $eq: ['$entryPage', pagePath] }, { $eq: ['$pageViews', 1] }] },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),
    ]);

    const stat = pageStats[0] || { views: 0, uniqueVisitors: [], avgDuration: 0 };
    const sess = sessionStats[0] || { totalSessions: 0, entrySessions: 0, exitSessions: 0, bounces: 0 };

    const views = stat.views || 0;
    const uniqueCount = Array.isArray(stat.uniqueVisitors) ? stat.uniqueVisitors.length : 0;
    const avgDuration = Math.round(stat.avgDuration || 0);
    const bounceRate = sess.entrySessions > 0 ? Math.round((sess.bounces / sess.entrySessions) * 100) : 0;
    const exitRate = views > 0 ? Math.round((sess.exitSessions / views) * 100) : 0;

    res.json({
      path: pagePath,
      views,
      uniqueVisitors: uniqueCount,
      avgDuration,
      bounceRate,
      exitRate,
      entrySessions: sess.entrySessions,
      exitSessions: sess.exitSessions,
      trafficTrend,
      referrers,
      events: eventsOnPage.map((e: any) => ({
        eventType: e._id.eventType,
        target: e._id.target,
        count: e.count,
      })),
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/analytics/events
export const getTopEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { range = '30d' } = req.query;
    const since = getDateRange(range as string);

    const events = await AnalyticsEvent.aggregate([
      { $match: { timestamp: { $gte: since } } },
      {
        $group: {
          _id: { eventType: '$eventType', target: '$target' },
          count: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$visitorId' },
        },
      },
      {
        $project: {
          eventType: '$_id.eventType',
          target: '$_id.target',
          count: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' },
          _id: 0,
        },
      },
      { $sort: { count: -1 } },
      { $limit: 30 },
    ]);

    res.json(events);
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/analytics/projects
export const getProjectAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { range = '30d' } = req.query;
    const since = getDateRange(range as string);

    const projects = await AnalyticsEvent.aggregate([
      { $match: { eventType: { $in: ['PROJECT_VIEW', 'GITHUB_CLICK', 'LIVE_DEMO_CLICK'] }, timestamp: { $gte: since } } },
      {
        $group: {
          _id: { project: '$target', eventType: '$eventType' },
          count: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$visitorId' },
        },
      },
      {
        $group: {
          _id: '$_id.project',
          events: {
            $push: {
              type: '$_id.eventType',
              count: '$count',
              unique: { $size: '$uniqueVisitors' },
            },
          },
          totalEvents: { $sum: '$count' },
        },
      },
      { $sort: { totalEvents: -1 } },
      { $limit: 20 },
    ]);

    const formatted = projects.map((p) => {
      const result: Record<string, number | string> = { project: p._id };
      p.events.forEach((e: any) => {
        if (e.type === 'PROJECT_VIEW') { result.views = e.count; result.uniqueViewers = e.unique; }
        if (e.type === 'GITHUB_CLICK') result.githubClicks = e.count;
        if (e.type === 'LIVE_DEMO_CLICK') result.demoClicks = e.count;
      });
      return result;
    });

    res.json(formatted);
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/analytics/sources
export const getTrafficSources = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { range = '30d' } = req.query;
    const since = getDateRange(range as string);

    const [referrers, utmSources] = await Promise.all([
      Session.aggregate([
        { $match: { startedAt: { $gte: since } } },
        { $group: { _id: '$referrer', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Session.aggregate([
        { $match: { startedAt: { $gte: since }, utmSource: { $ne: '' } } },
        {
          $group: {
            _id: '$utmSource',
            count: { $sum: 1 },
            medium: { $first: '$utmMedium' },
            campaign: { $first: '$utmCampaign' },
          },
        },
        { $sort: { count: -1 } },
      ]),
    ]);

    res.json({ referrers, utmSources });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/analytics/devices
export const getDeviceStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { range = '30d' } = req.query;
    const since = getDateRange(range as string);

    const [devices, browsers, os] = await Promise.all([
      Session.aggregate([
        { $match: { startedAt: { $gte: since } } },
        { $group: { _id: '$deviceType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Session.aggregate([
        { $match: { startedAt: { $gte: since } } },
        { $group: { _id: '$browser', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Session.aggregate([
        { $match: { startedAt: { $gte: since } } },
        { $group: { _id: '$operatingSystem', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    res.json({ devices, browsers, operatingSystems: os });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/analytics/geography
export const getGeography = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { range = '30d' } = req.query;
    const since = getDateRange(range as string);

    const geo = await Visitor.aggregate([
      { $match: { lastSeen: { $gte: since } } },
      {
        $group: {
          _id: { country: '$country', region: '$region', city: '$city' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          country: '$_id.country',
          region: '$_id.region',
          city: '$_id.city',
          count: 1,
          _id: 0,
        },
      },
      { $sort: { count: -1 } },
      { $limit: 50 },
    ]);

    // Group by country
    const countries: Record<string, { country: string; count: number; regions: Array<{ region: string; count: number }> }> = {};
    geo.forEach((g) => {
      if (!countries[g.country]) countries[g.country] = { country: g.country, count: 0, regions: [] };
      countries[g.country].count += g.count;
      if (g.region) countries[g.country].regions.push({ region: g.region, count: g.count });
    });

    res.json(Object.values(countries).sort((a, b) => b.count - a.count));
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/analytics/realtime
export const getRealtime = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const activeThreshold = new Date(Date.now() - ACTIVE_THRESHOLD_MINUTES * 60 * 1000);

    const activeSessions = await Session.find({
      lastActivityAt: { $gte: activeThreshold },
      isActive: true,
    })
      .select('sessionId visitorId exitPage lastActivityAt deviceType browser')
      .lean();

    res.json({
      activeCount: activeSessions.length,
      activeSessions: activeSessions.map((s) => ({
        sessionId: s.sessionId,
        visitorId: s.visitorId,
        currentPage: s.exitPage,
        lastSeen: s.lastActivityAt,
        device: s.deviceType,
        browser: s.browser,
      })),
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/analytics/visitors
export const getVisitors = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const activeThreshold = new Date(Date.now() - ACTIVE_THRESHOLD_MINUTES * 60 * 1000);

    const [visitors, total] = await Promise.all([
      Visitor.find().sort({ lastSeen: -1 }).skip(skip).limit(limit).lean(),
      Visitor.countDocuments(),
    ]);

    const visitorIds = visitors.map((v) => v.visitorId);
    const activeSessions = await Session.find({
      visitorId: { $in: visitorIds },
      lastActivityAt: { $gte: activeThreshold },
    }).select('visitorId');

    const activeSet = new Set(activeSessions.map((s) => s.visitorId));

    const result = visitors.map((v) => ({
      ...v,
      isActive: activeSet.has(v.visitorId),
    }));

    res.json({ visitors: result, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/analytics/visitors/:visitorId
export const getVisitorDetail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { visitorId } = req.params;
    const [visitor, sessions, events] = await Promise.all([
      Visitor.findOne({ visitorId }).lean(),
      Session.find({ visitorId }).sort({ startedAt: -1 }).limit(10).lean(),
      AnalyticsEvent.find({ visitorId }).sort({ timestamp: -1 }).limit(50).lean(),
    ]);

    if (!visitor) { res.status(404).json({ message: 'Visitor not found' }); return; }

    res.json({ visitor, sessions, events });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/analytics/resume
export const getResumeAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { range = '30d' } = req.query;
    const since = getDateRange(range as string);

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, today, thisWeek, thisMonth, chart, byPage] = await Promise.all([
      AnalyticsEvent.countDocuments({ eventType: 'RESUME_DOWNLOAD' }),
      AnalyticsEvent.countDocuments({ eventType: 'RESUME_DOWNLOAD', timestamp: { $gte: startOfToday } }),
      AnalyticsEvent.countDocuments({ eventType: 'RESUME_DOWNLOAD', timestamp: { $gte: startOfWeek } }),
      AnalyticsEvent.countDocuments({ eventType: 'RESUME_DOWNLOAD', timestamp: { $gte: startOfMonth } }),
      AnalyticsEvent.aggregate([
        { $match: { eventType: 'RESUME_DOWNLOAD', timestamp: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      AnalyticsEvent.aggregate([
        { $match: { eventType: 'RESUME_DOWNLOAD', timestamp: { $gte: since } } },
        { $group: { _id: '$page', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    res.json({ total, today, thisWeek, thisMonth, chart, byPage });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/analytics/recent-activity
export const getRecentActivity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;

    const events = await AnalyticsEvent.find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    res.json(events);
  } catch (err) {
    next(err);
  }
};
