import express from 'express';
import {
  getAmbulances,
  updateAmbulanceStatus,
  updateAmbulanceLocation
} from '../controllers/ambulance.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.js';
import { ambulanceStatusSchema, ambulanceLocationSchema } from '../middleware/validator.js';
import { UserRole } from '../constants/enums.js';

const router = express.Router();

router.get('/', authenticate, getAmbulances);

router.patch(
  '/:id/status',
  authenticate,
  authorize([UserRole.AMBULANCE_PARAMEDIC, UserRole.CENTRAL_ADMIN, UserRole.SUPER_ADMIN]),
  validateBody(ambulanceStatusSchema),
  updateAmbulanceStatus
);

router.patch(
  '/:id/location',
  authenticate,
  authorize([UserRole.AMBULANCE_PARAMEDIC, UserRole.SUPER_ADMIN]),
  validateBody(ambulanceLocationSchema),
  updateAmbulanceLocation
);

export default router;
