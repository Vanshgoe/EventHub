import express from 'express';
import { getProfile, getMyEvents, getMyRegistrations } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', protect, getProfile);
router.get('/me/events', protect, getMyEvents);
router.get('/me/registrations', protect, getMyRegistrations);

export default router;
