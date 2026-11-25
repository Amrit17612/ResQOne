import express from 'express';
import {
  findSuitableUnits,
  assignUnitToIncident,
  updateUnitTelemetry,
  updateUnitStage,
  getIncidentTrackingFeed,
  getMyUnit
} from '../controllers/dispatch.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// 0. Get assigned unit for current authenticated staff member
router.get('/my-unit', authenticate, getMyUnit);

// 1. Search available operational response units
router.get('/suitable-units', authenticate, findSuitableUnits);

// 2. Dispatch assign unit
router.post('/assign-unit', authenticate, assignUnitToIncident);

// 3. Telemetry ingestion (Live GPS and Demo Simulation)
router.post('/telemetry', authenticate, updateUnitTelemetry);

// 4. Update stage transitions
router.post('/stage', authenticate, updateUnitStage);
router.post('/stage-transition', authenticate, updateUnitStage);

// 5. Citizen Live Tracking Feed
router.get('/tracking/:id', getIncidentTrackingFeed);

export default router;
