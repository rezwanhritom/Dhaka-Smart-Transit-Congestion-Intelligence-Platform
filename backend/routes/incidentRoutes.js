import { Router } from 'express';
import { classifyIncident, estimateImpact } from '../controllers/incidentController.js';

const router = Router();

router.post('/classify', classifyIncident);
router.post('/impact', estimateImpact);

export default router;
