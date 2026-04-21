import { Router } from 'express';
import {
  getCurrent,
  getForecast,
  getMap,
  streamMap,
  postPredict,
} from '../controllers/congestionController.js';

const router = Router();

router.get('/current', getCurrent);
router.get('/forecast', getForecast);
router.get('/map', getMap);
router.get('/map/stream', streamMap);
router.post('/predict', postPredict);

export default router;
