import express from 'express';
import {
  getDepartmentEmergencyRequests,
  acceptEmergencyRequest,
  declineEmergencyRequest
} from '../controllers/departmentEmergencyRequest.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authenticate, getDepartmentEmergencyRequests);
router.patch('/:requestId/accept', authenticate, acceptEmergencyRequest);
router.put('/:requestId/accept', authenticate, acceptEmergencyRequest);
router.patch('/:requestId/decline', authenticate, declineEmergencyRequest);
router.put('/:requestId/decline', authenticate, declineEmergencyRequest);

export default router;
