import express from 'express';
import {
  getHospitals,
  getHospitalById,
  updateBeds,
  requestBedAllocation,
  getAllocationRequests,
  respondToAllocation
} from '../controllers/hospital.controller.js';
import { createHospitalStaff, getHospitalStaff } from '../controllers/staff.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.js';
import { bedUpdateSchema, allocationRequestSchema, hospitalStaffCreateSchema } from '../middleware/validator.js';
import { UserRole } from '../constants/enums.js';

const router = express.Router();

router.get('/', getHospitals);
router.get('/:id', getHospitalById);

// Bed management
router.patch(
  '/:id/beds',
  authenticate,
  authorize([UserRole.HOSPITAL_COORDINATOR, UserRole.SUPER_ADMIN]),
  validateBody(bedUpdateSchema),
  updateBeds
);

// Staff management (Hospital Data Isolation Guarantee)
router.post(
  '/staff',
  authenticate,
  authorize([UserRole.HOSPITAL_COORDINATOR, UserRole.SUPER_ADMIN]),
  validateBody(hospitalStaffCreateSchema),
  createHospitalStaff
);

router.get(
  '/staff/members',
  authenticate,
  authorize([UserRole.HOSPITAL_COORDINATOR, UserRole.SUPER_ADMIN]),
  getHospitalStaff
);

// Allocations
router.post(
  '/allocations',
  authenticate,
  authorize([
    UserRole.CENTRAL_ADMIN,
    UserRole.AMBULANCE_PARAMEDIC,
    UserRole.HOSPITAL_COORDINATOR,
    UserRole.SUPER_ADMIN
  ]),
  validateBody(allocationRequestSchema),
  requestBedAllocation
);

router.get('/allocations/requests', authenticate, getAllocationRequests);

router.patch(
  '/allocations/requests/:requestId',
  authenticate,
  authorize([UserRole.HOSPITAL_COORDINATOR, UserRole.SUPER_ADMIN]),
  respondToAllocation
);

export default router;
