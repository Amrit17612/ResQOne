import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import {
  provisionDisasterStaff,
  getDisasterStaff,
  createDisasterUnit,
  getDisasterUnits
} from '../controllers/disasterAdmin.controller.js';

const router = express.Router();

router.use(authenticate);

router.post(
  '/provision-staff',
  authorize(['DISASTER_ADMIN', 'SUPER_ADMIN']),
  provisionDisasterStaff
);

router.get(
  '/staff',
  authorize(['DISASTER_ADMIN', 'DISASTER_OFFICER', 'SUPER_ADMIN']),
  getDisasterStaff
);

router.post(
  '/units',
  authorize(['DISASTER_ADMIN', 'SUPER_ADMIN']),
  createDisasterUnit
);

router.get(
  '/units',
  authorize(['DISASTER_ADMIN', 'DISASTER_OFFICER', 'SUPER_ADMIN']),
  getDisasterUnits
);

export default router;

