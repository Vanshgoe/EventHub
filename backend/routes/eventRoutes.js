import express from 'express';
import {
  createEvent,
  deleteEvent,
  getEventById,
  listEvents,
  registerForEvent,
  updateEvent,
} from '../controllers/eventController.js';
import { authorizeEventOwner, protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', listEvents);
router.get('/search', listEvents);
router.get('/:id', getEventById);
router.post('/', protect, createEvent);
router.put('/:id', protect, authorizeEventOwner, updateEvent);
router.delete('/:id', protect, authorizeEventOwner, deleteEvent);
router.post('/:id/register', protect, registerForEvent);

export default router;
