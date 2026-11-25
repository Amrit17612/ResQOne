import express from 'express';
import {
  getEligibleOrganizations,
  submitStaffApplication,
  requestStaffTrackingOTP,
  verifyStaffTrackingOTP,
  getOrganizationStaffApplications,
  approveStaffApplication,
  rejectStaffApplication,
  activateStaffAccount
} from '../controllers/staffApplication.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// 1. Discover approved eligible organizations for dropdown
router.get('/eligible-organizations', getEligibleOrganizations);

// 2. Public Hospital Staff / Volunteer Application submission
router.post('/apply', submitStaffApplication);

// 3. Tracking with Email OTP
router.post('/track/request-otp', requestStaffTrackingOTP);
router.post('/track/verify-otp', verifyStaffTrackingOTP);

// 4. Secure Account Activation (Single-use token verification & master password set)
router.post('/activate', activateStaffAccount);

// 5. Hospital Admin review endpoints (Strict organization isolation)
router.get('/organization/:organizationId', authenticate, getOrganizationStaffApplications);
router.patch('/:applicationId/approve', authenticate, approveStaffApplication);
router.patch('/:applicationId/reject', authenticate, rejectStaffApplication);

export default router;

