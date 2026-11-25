import mongoose from 'mongoose';

export const StaffApplicationStatus = {
  APPLICATION_SUBMITTED: 'APPLICATION_SUBMITTED',
  EMAIL_VERIFICATION_PENDING: 'EMAIL_VERIFICATION_PENDING',
  UNDER_REVIEW: 'UNDER_REVIEW',
  DOCUMENT_VERIFICATION_PENDING: 'DOCUMENT_VERIFICATION_PENDING',
  ADDITIONAL_INFORMATION_REQUIRED: 'ADDITIONAL_INFORMATION_REQUIRED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  ACTIVATION_LINK_SENT: 'ACTIVATION_LINK_SENT',
  PASSWORD_SETUP_PENDING: 'PASSWORD_SETUP_PENDING',
  ACCOUNT_ACTIVE: 'ACCOUNT_ACTIVE',
  SUSPENDED: 'SUSPENDED',
  WITHDRAWN: 'WITHDRAWN',
  EXPIRED: 'EXPIRED'
};

const StaffApplicationSchema = new mongoose.Schema(
  {
    applicationId: { type: String, required: true, unique: true, index: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date },
    address: { type: String, required: true },

    // Role requested (Must be a Hospital role or Volunteer)
    requestedRole: {
      type: String,
      required: true,
      enum: [
        'AMBULANCE_DRIVER',
        'DOCTOR',
        'NURSE',
        'BED_MANAGER',
        'HOSPITAL_EMERGENCY_COORDINATOR',
        'OTHER_HOSPITAL_STAFF',
        'VOLUNTEER'
      ]
    },

    // Strict Organization Isolation Link
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OrganizationApplication',
      required: true,
      index: true
    },
    organizationName: { type: String, required: true },

    // Specific professional fields
    qualifications: { type: String },
    relevantExperience: { type: String },
    professionalRegistrationNumber: { type: String }, // e.g. Medical Reg No / Driving License
    specialty: { type: String }, // For Doctors
    drivingLicenseNumber: { type: String }, // For Drivers
    licenseValidity: { type: Date },
    vehicleCategory: { type: String }, // e.g. LMV, HMV, Commercial Ambulance

    supportingDocumentUrl: { type: String },

    // Status & lifecycle tracking
    status: {
      type: String,
      enum: Object.values(StaffApplicationStatus),
      default: StaffApplicationStatus.APPLICATION_SUBMITTED,
      index: true
    },
    adminRemarks: { type: String },
    statusHistory: [
      {
        status: { type: String, required: true },
        note: { type: String },
        updatedBy: { type: String },
        updatedAt: { type: Date, default: Date.now }
      }
    ],

    // Verification OTP for tracking without login
    trackingOtpHash: { type: String },
    trackingOtpExpires: { type: Date },
    trackingOtpAttempts: { type: Number, default: 0 },

    // Secure Single-Use Activation Token (Stored as HMAC Hash)
    activationTokenHash: { type: String },
    activationExpires: { type: Date },
    activationUsed: { type: Boolean, default: false },

    // Generated unique Staff ID upon approval (e.g. DRV-001, DOC-001)
    assignedStaffId: { type: String, sparse: true, index: true },
    createdUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export const StaffApplication = mongoose.model('StaffApplication', StaffApplicationSchema);

