// backend/src/routes/poll.routes.ts
import { Router } from 'express';
import { PollController } from '../controllers/poll.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const pollController = new PollController();

// All poll routes require authentication (except public link)
router.use(authenticate);

// Poll CRUD routes
router.post('/', pollController.createPoll.bind(pollController));
router.get('/my-polls', pollController.getUserPolls.bind(pollController));
router.get('/:id', pollController.getPollById.bind(pollController));
router.put('/:id', pollController.updatePoll.bind(pollController));
router.delete('/:id', pollController.deletePoll.bind(pollController));
router.get('/:id/active', pollController.checkPollActive.bind(pollController));

// Public link route (no auth required - but we'll handle separately)
// This is handled in response routes

export default router;