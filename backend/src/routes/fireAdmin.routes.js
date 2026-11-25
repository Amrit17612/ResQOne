import express from 'express';
import {
  provisionFireStaff,
  getFireStaff,
  createFireStation,
  getFireStations,
  createFireUnit,
  getFireUnits
} from '../controllers/fireAdmin.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Fire Staff Provisioning (Admin-Only, strictly no public signup)
router.post('/staff', authenticate, provisionFireStaff);
router.get('/staff', authenticate, getFireStaff);

// Fire Stations
router.post('/stations', authenticate, createFireStation);
router.get('/stations', authenticate, getFireStations);

// Fire Units & Tactical Rescue Teams
router.post('/units', authenticate, createFireUnit);
router.get('/units', authenticate, getFireUnits);

export default router;

