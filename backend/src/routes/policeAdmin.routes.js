import express from 'express';
import {
  provisionPoliceStaff,
  getPoliceStaff,
  createPoliceStation,
  getPoliceStations,
  createPoliceUnit,
  getPoliceUnits
} from '../controllers/policeAdmin.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Police Staff Provisioning (Admin-Only, strictly no public signup)
router.post('/staff', authenticate, provisionPoliceStaff);
router.get('/staff', authenticate, getPoliceStaff);

// Police Stations
router.post('/stations', authenticate, createPoliceStation);
router.get('/stations', authenticate, getPoliceStations);

// Police Units & Patrol Squads
router.post('/units', authenticate, createPoliceUnit);
router.get('/units', authenticate, getPoliceUnits);

export default router;

