import { Router } from 'express';
import { getStops, postCommute } from '../controllers/plannerController.js';

const router = Router();

router.post('/commute', postCommute);
router.get('/stops', getStops);

export default router;
