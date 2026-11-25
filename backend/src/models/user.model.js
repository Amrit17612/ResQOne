import mongoose from 'mongoose';
import { UserRole } from '../constants/enums.js';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.CITIZEN
    },
    staffId: { type: String, sparse: true, index: true }, // e.g. DRV-001, DOC-001, POL-001, FIRE-001, VOL-001
    rankOrDesignation: { type: String },
    stationId: { type: mongoose.Schema.Types.ObjectId },
    unitId: { type: mongoose.Schema.Types.ObjectId },
    specialty: { type: String }, // For Doctors
    licenseNumber: { type: String }, // For Drivers
    departmentType: { type: String },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'OrganizationApplication' },
    isVerified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['PENDING_ACTIVATION', 'ACTIVE', 'SUSPENDED'],
      default: 'ACTIVE'
    },
    authProvider: {
      type: String,
      enum: ['LOCAL', 'FIREBASE_GOOGLE'],
      default: 'LOCAL'
    },
    firebaseUid: { type: String, sparse: true },
    
    // 2FA Security fields
    twoFactorSecret: { type: String },
    twoFactorEnabled: { type: Boolean, default: false },
    currentEmailOtpHash: { type: String },
    otpExpiresAt: { type: Date },
    otpAttempts: { type: Number, default: 0 },

    // Tokenized Activation link hash
    activationTokenHash: { type: String },
    activationExpires: { type: Date },

    emergencyContact: {
      name: { type: String },
      relationship: { type: String },
      phone: { type: String }
    }
  },
  { timestamps: true }
);

export const User = mongoose.model('User', UserSchema);
