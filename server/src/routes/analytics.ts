import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { createSession, trackPageView, trackEvent, heartbeat } from '../controllers/analyticsController';

const router = Router();

const analyticsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { message: 'Too many analytics requests' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(analyticsLimiter);
router.post('/session', createSession);
router.post('/pageview', trackPageView);
router.post('/event', trackEvent);
router.post('/heartbeat', heartbeat);

export default router;
