import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import {
  createShelter,
  getShelters,
  updateShelterCapacity
} from '../controllers/shelterAdmin.controller.js';

const router = express.Router();

router.use(authenticate);

router.post(
  '/',
  authorize(['SHELTER_ADMIN', 'DISASTER_ADMIN', 'SUPER_ADMIN']),
  createShelter
);

router.get(
  '/',
  authorize(['SHELTER_ADMIN', 'DISASTER_ADMIN', 'NGO_ADMIN', 'CENTRAL_ADMIN', 'SUPER_ADMIN']),
  getShelters
);

router.patch(
  '/:id/capacity',
  authorize(['SHELTER_ADMIN', 'DISASTER_ADMIN', 'SUPER_ADMIN']),
  updateShelterCapacity
);

export default router;

