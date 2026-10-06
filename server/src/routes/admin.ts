import { Router } from 'express';
import { authenticateAdmin } from '../middleware/auth';
import {
  getOverview,
  getTrafficChart,
  getTopPages,
  getPageDetail,
  getTopEvents,
  getProjectAnalytics,
  getTrafficSources,
  getDeviceStats,
  getGeography,
  getRealtime,
  getVisitors,
  getVisitorDetail,
  getResumeAnalytics,
  getRecentActivity,
} from '../controllers/adminAnalyticsController';

const router = Router();
router.use(authenticateAdmin);

router.get('/analytics/overview', getOverview);
router.get('/analytics/traffic', getTrafficChart);
router.get('/analytics/pages', getTopPages);
router.get('/analytics/page-detail', getPageDetail);
router.get('/analytics/events', getTopEvents);
router.get('/analytics/projects', getProjectAnalytics);
router.get('/analytics/sources', getTrafficSources);
router.get('/analytics/devices', getDeviceStats);
router.get('/analytics/geography', getGeography);
router.get('/analytics/realtime', getRealtime);
router.get('/analytics/visitors', getVisitors);
router.get('/analytics/visitors/:visitorId', getVisitorDetail);
router.get('/analytics/resume', getResumeAnalytics);
router.get('/analytics/recent-activity', getRecentActivity);

export default router;
