import express from 'express';
import {
  createIncident,
  getIncidents,
  getIncidentById,
  getIncidentByReference,
  verifyIncident,
  updateIncidentStatus,
  closeIncident
} from '../controllers/incident.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.js';
import { incidentCreateSchema, incidentVerifySchema } from '../middleware/validator.js';
import { UserRole } from '../constants/enums.js';

const router = express.Router();

// Public / Citizen reporting with validation
router.post(
  '/',
  (req, res, next) => {
    // If client supplied auth token, hydrate req.user
    if (req.headers.authorization || (req.cookies && req.cookies.token)) {
      authenticate(req, res, next);
    } else {
      next();
    }
  },
  validateBody(incidentCreateSchema),
  createIncident
);

router.get('/track/:referenceId', getIncidentByReference);
router.get('/', authenticate, getIncidents);
router.get('/:id', getIncidentById);

// Verification and routing (Admin & Super Admin) with validation
router.patch(
  '/:id/verify',
  authenticate,
  authorize([UserRole.CENTRAL_ADMIN, UserRole.SUPER_ADMIN]),
  validateBody(incidentVerifySchema),
  verifyIncident
);

// Responder status updates (Police, Fire, Ambulance, Disaster)
router.patch('/:id/status', authenticate, updateIncidentStatus);

// Authorized Central Admin / Super Admin Final Incident Closure
router.post(
  '/:id/close',
  authenticate,
  authorize([UserRole.CENTRAL_ADMIN, UserRole.SUPER_ADMIN]),
  closeIncident
);

export default router;
