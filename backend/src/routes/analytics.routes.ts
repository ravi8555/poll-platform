// backend/src/routes/analytics.routes.ts
import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
const analyticsController = new AnalyticsController();

// Public results (no auth required)
router.get('/public/:shareableLink', analyticsController.getPublicResults.bind(analyticsController));

// Protected analytics routes
router.use(authenticate);
router.get('/poll/:pollId', analyticsController.getPollAnalytics.bind(analyticsController));
router.get('/question/:questionId', analyticsController.getQuestionSummary.bind(analyticsController));
router.post('/poll/:pollId/publish', analyticsController.publishResults.bind(analyticsController));
router.get('/poll/:pollId/export', analyticsController.exportAnalyticsCSV.bind(analyticsController));

export default router;