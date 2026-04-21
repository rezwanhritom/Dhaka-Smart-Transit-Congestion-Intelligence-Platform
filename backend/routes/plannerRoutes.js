import { Router } from 'express';
import {
  getSimulationBus,
  getSimulationFleet,
  getSimulationHistory,
  getStops,
  postCommute,
} from '../controllers/plannerController.js';

const router = Router();

router.post('/commute', postCommute);
router.get('/stops', getStops);
router.get('/sim/fleet', getSimulationFleet);
router.get('/sim/buses/:bus_id', getSimulationBus);
router.get('/sim/history', getSimulationHistory);

export default router;
