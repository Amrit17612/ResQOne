import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import {
  provisionNgoVolunteer,
  getNgoVolunteers,
  createVolunteerTask,
  getNgoTasks,
  assignVolunteerTask
} from '../controllers/ngoAdmin.controller.js';

const router = express.Router();

router.use(authenticate);

router.post(
  '/volunteers',
  authorize(['NGO_ADMIN', 'DISASTER_ADMIN', 'SUPER_ADMIN']),
  provisionNgoVolunteer
);

router.get(
  '/volunteers',
  authorize(['NGO_ADMIN', 'VOLUNTEER', 'DISASTER_ADMIN', 'SUPER_ADMIN']),
  getNgoVolunteers
);

router.post(
  '/tasks',
  authorize(['NGO_ADMIN', 'DISASTER_ADMIN', 'SUPER_ADMIN']),
  createVolunteerTask
);

router.get(
  '/tasks',
  authorize(['NGO_ADMIN', 'VOLUNTEER', 'DISASTER_ADMIN', 'SUPER_ADMIN']),
  getNgoTasks
);

router.put(
  '/tasks/:id/assign',
  authorize(['NGO_ADMIN', 'SUPER_ADMIN']),
  assignVolunteerTask
);

export default router;

