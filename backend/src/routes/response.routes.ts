// backend/src/routes/response.routes.ts
import { Router } from 'express';
import { ResponseController } from '../controllers/response.controller.js';
import { authenticate } from '../middleware/auth.js';
import { optionalAuth } from '../middleware/optionalAuth.js';

const router = Router();
const responseController = new ResponseController();

// Public poll access (no auth needed)
router.get('/poll/:link', responseController.getPublicPoll.bind(responseController));

// Response submission - MUST use optionalAuth to allow both anonymous and authenticated
router.post('/submit', optionalAuth, responseController.submitResponse.bind(responseController));

// Protected routes for poll creators
router.get('/poll/:pollId/responses', authenticate, responseController.getPollResponses.bind(responseController));
router.get('/poll/:pollId/live-count', authenticate, responseController.getLiveResponseCount.bind(responseController));

export default router;