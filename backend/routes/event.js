import { Router } from 'express';
import { addEvent, getEvents } from '../controllers/event.js';

const router = Router();

/**
 * POST /events
 * Add a new event
 */
router.post('/', addEvent);

/**
 * GET /events/:date
 * Get events for a specific date
 */
router.get('/', getEvents);

export default router;
