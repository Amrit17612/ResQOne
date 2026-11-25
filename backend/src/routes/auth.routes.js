import express from 'express';
import {
  registerCitizen,
  loginCitizen,
  loginCitizenFirebase,
  loginOfficialInitiate,
  loginOfficialVerifyOTP,
  loginStaff,
  logout,
  getMe
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.js';
import { citizenRegisterSchema, loginSchema } from '../middleware/validator.js';

const router = express.Router();

// 1. Citizen Portal Authentication (Local + Firebase Google Sign-In)
router.post('/citizen/register', validateBody(citizenRegisterSchema), registerCitizen);
router.post('/citizen/login', validateBody(loginSchema), loginCitizen);
router.post('/citizen/firebase', loginCitizenFirebase);

// 2. Official Restricted Authentication (2FA Email OTP Pipeline)
router.post('/official/login-initiate', validateBody(loginSchema), loginOfficialInitiate);
router.post('/official/verify-otp', loginOfficialVerifyOTP);

// 3. Shared Staff Login Portal (DRV, DOC, NUR, BED, POL, FIRE, VOL)
router.post('/staff/login', loginStaff);

// 3. Session Utilities
router.post('/logout', logout);
router.get('/me', authenticate, getMe);

export default router;
