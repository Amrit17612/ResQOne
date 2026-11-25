import { z } from 'zod';
import { IncidentCategory, IncidentPriority, BedCategory, AmbulanceStatus } from '../constants/enums.js';

const NAME_REGEX = /^[a-zA-Z\s'.]+$/;

// Citizen Public Registration Schema (Strictly role: CITIZEN, no client override)
export const citizenRegisterSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100)
    .regex(NAME_REGEX, 'Full name must contain only alphabets and spaces'),
  email: z.string().email('Please enter a valid email address'),
  phone: z
    .string()
    .transform((val) => val.replace(/\D/g, ''))
    .refine((val) => val.length === 10, {
      message: 'Mobile number must be exactly 10 digits'
    }),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  confirmPassword: z.string().min(6, 'Confirm password is required'),
  address: z.string().optional(),
  emergencyContact: z
    .object({
      name: z.string().regex(NAME_REGEX, 'Contact name must contain letters only').optional(),
      relationship: z.string().optional(),
      phone: z
        .string()
        .transform((val) => val.replace(/\D/g, ''))
        .refine((val) => val.length === 10, { message: 'Must be 10 digits' })
        .optional()
    })
    .optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

// General Login Schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(1, 'Password is required')
});

// Organization Onboarding Registration Schema
export const organizationApplicationSchema = z.object({
  organizationName: z.string().min(3, 'Organization name must be at least 3 characters'),
  organizationType: z.enum([
    'HOSPITAL',
    'POLICE',
    'FIRE_RESCUE',
    'AMBULANCE_PROVIDER',
    'DISASTER_MANAGEMENT',
    'DISASTER_RELIEF_NGO',
    'NGO',
    'SHELTER_PROVIDER',
    'SHELTER'
  ]),
  officialEmail: z.string().email('Valid official organization email required'),
  contactNumber: z
    .string()
    .transform((val) => val.replace(/\D/g, ''))
    .refine((val) => val.length === 10, {
      message: 'Contact number must be exactly 10 digits'
    }),
  address: z.string().min(5, 'Full official address is required'),
  registrationNumber: z.string().min(3, 'Government registration / License number is required'),
  authorizedPersonName: z
    .string()
    .min(2)
    .regex(NAME_REGEX, 'Authorized person name must contain letters only'),
  authorizedPersonDesignation: z.string().min(2, 'Official designation is required'),
  supportingDocumentUrl: z.string().optional()
});

// Activation Password Setup Schema
export const activateAccountSchema = z.object({
  token: z.string().min(10, 'Valid activation token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters with high security'),
  confirmPassword: z.string().min(8)
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

// Hospital Staff Account Creation (Created by Hospital Admin)
export const hospitalStaffCreateSchema = z.object({
  name: z.string().min(2).regex(NAME_REGEX, 'Name must contain letters only'),
  email: z.string().email('Valid staff email required'),
  phone: z
    .string()
    .transform((val) => val.replace(/\D/g, ''))
    .refine((val) => val.length === 10, { message: 'Phone must be 10 digits' }),
  staffRole: z.enum(['DOCTOR', 'BED_MANAGER', 'EMERGENCY_COORDINATOR', 'NURSE_IN_CHARGE'])
});

// Incident schemas
export const incidentCreateSchema = z.object({
  title: z.string().min(3, 'Incident title must be at least 3 characters long').max(200),
  description: z.string().min(5, 'Description must be at least 5 characters long'),
  category: z.nativeEnum(IncidentCategory).optional(),
  subcategory: z.string().optional().nullable(),
  priority: z.nativeEnum(IncidentPriority).optional(),
  latitude: z.number().min(-90).max(90, 'Invalid latitude'),
  longitude: z.number().min(-180).max(180, 'Invalid longitude'),
  address: z.string().min(3, 'Address is required'),
  landmark: z.string().optional(),
  reporterName: z
    .string()
    .trim()
    .refine((val) => !val || val === 'Anonymous Citizen' || NAME_REGEX.test(val), {
      message: 'Reporter name must contain only alphabets and spaces'
    })
    .optional(),
  reporterPhone: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val === 'Not provided') return true;
      const digits = val.replace(/\D/g, '');
      return digits.length === 10 || digits.length === 12;
    }, {
      message: 'Reporter contact number must be a valid 10-digit number'
    }),
  mediaUrls: z.array(z.string().url()).optional()
});

export const incidentVerifySchema = z.object({
  status: z.enum(['VERIFIED', 'REJECTED', 'CLOSED']).optional(),
  priority: z.nativeEnum(IncidentPriority).optional(),
  departments: z.array(z.string()).optional(),
  rejectionReason: z.string().optional()
});

export const bedUpdateSchema = z.object({
  bedCategory: z.nativeEnum(BedCategory, { errorMap: () => ({ message: 'Invalid bed category' }) }),
  total: z.number().int().min(0).optional(),
  occupied: z.number().int().min(0).optional(),
  reserved: z.number().int().min(0).optional()
});

export const allocationRequestSchema = z.object({
  incidentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Incident ID'),
  hospitalId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Hospital ID'),
  bedCategory: z.nativeEnum(BedCategory).optional(),
  requestedCount: z.number().int().min(1).max(50),
  ambulanceId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional()
});

export const ambulanceStatusSchema = z.object({
  status: z.nativeEnum(AmbulanceStatus).optional(),
  activeIncidentId: z.string().regex(/^[0-9a-fA-F]{24}$/).nullable().optional(),
  assignedHospitalId: z.string().regex(/^[0-9a-fA-F]{24}$/).nullable().optional(),
  patientHandoverNotes: z.string().optional()
});

export const ambulanceLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180)
});
