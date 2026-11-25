import express from 'express';
import {
  getShelters,
  updateShelterOccupancy,
  getVolunteerTasks,
  createVolunteerTask,
  assignVolunteerTask,
  updateVolunteerTaskStatus,
  getAuditLogs,
  getAllUsers
} from '../controllers/admin.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { UserRole } from '../constants/enums.js';

const router = express.Router();

// Shelters
router.get('/shelters', getShelters);
router.patch(
  '/shelters/:id',
  authenticate,
  authorize([UserRole.SHELTER_MANAGER, UserRole.DISASTER_OFFICER, UserRole.SUPER_ADMIN]),
  updateShelterOccupancy
);

// Volunteer tasks
router.get('/volunteers/tasks', authenticate, getVolunteerTasks);
router.post(
  '/volunteers/tasks',
  authenticate,
  authorize([UserRole.DISASTER_OFFICER, UserRole.SHELTER_MANAGER, UserRole.SUPER_ADMIN]),
  createVolunteerTask
);
router.patch('/volunteers/tasks/:id/assign', authenticate, assignVolunteerTask);
router.patch('/volunteers/tasks/:id/status', authenticate, updateVolunteerTaskStatus);

// Audit logs & User listing
router.get(
  '/audit-logs',
  authenticate,
  authorize([UserRole.SUPER_ADMIN, UserRole.CENTRAL_ADMIN]),
  getAuditLogs
);

router.get('/users', authenticate, authorize([UserRole.SUPER_ADMIN]), getAllUsers);

export default router;

