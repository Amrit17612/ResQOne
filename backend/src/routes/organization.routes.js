import express from 'express';
import {
  submitOrganizationApplication,
  requestTrackingOTP,
  verifyTrackingOTP,
  getOrganizationApplications,
  updateApplicationStatus,
  generateOrganizationCredentials,
  activateAccountWithToken
} from '../controllers/organization.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.js';
import {
  organizationApplicationSchema,
  activateAccountSchema
} from '../middleware/validator.js';
import { UserRole } from '../constants/enums.js';

const router = express.Router();

// 1. Public Organization Onboarding & 2FA Tracking
router.post(
  '/apply',
  validateBody(organizationApplicationSchema),
  submitOrganizationApplication
);
router.post(
  '/register',
  validateBody(organizationApplicationSchema),
  submitOrganizationApplication
);

// Secure OTP-gated application tracking
router.post('/track/request-otp', requestTrackingOTP);
router.post('/track/verify-otp', verifyTrackingOTP);
router.post('/request-tracking-otp', requestTrackingOTP);
router.post('/verify-tracking-otp', verifyTrackingOTP);

// Single-use, hashed 30-min activation endpoint
router.post('/activate', validateBody(activateAccountSchema), activateAccountWithToken);

// 2. Super Admin Organization Management
router.get(
  '/applications',
  authenticate,
  authorize([UserRole.SUPER_ADMIN]),
  getOrganizationApplications
);

router.patch(
  '/applications/:id/status',
  authenticate,
  authorize([UserRole.SUPER_ADMIN]),
  updateApplicationStatus
);

router.post(
  '/applications/:id/generate-credentials',
  authenticate,
  authorize([UserRole.SUPER_ADMIN]),
  generateOrganizationCredentials
);

export default router;
