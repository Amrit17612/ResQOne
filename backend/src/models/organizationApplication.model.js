import mongoose from 'mongoose';

export const OrganizationApplicationStatus = {
  APPLICATION_SUBMITTED: 'APPLICATION_SUBMITTED',
  UNDER_INITIAL_REVIEW: 'UNDER_INITIAL_REVIEW',
  DOCUMENT_VERIFICATION_PENDING: 'DOCUMENT_VERIFICATION_PENDING',
  DOCUMENT_VERIFIED: 'DOCUMENT_VERIFIED',
  ADDITIONAL_INFORMATION_REQUIRED: 'ADDITIONAL_INFORMATION_REQUIRED',
  PHYSICAL_VERIFICATION_PENDING: 'PHYSICAL_VERIFICATION_PENDING',
  PHYSICAL_VERIFICATION_COMPLETED: 'PHYSICAL_VERIFICATION_COMPLETED',
  FINAL_APPROVAL_PENDING: 'FINAL_APPROVAL_PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  ACTIVATION_PENDING: 'ACTIVATION_PENDING',
  SUCCESSFULLY_REGISTERED: 'SUCCESSFULLY_REGISTERED',
  SUSPENDED: 'SUSPENDED',
  // Backward compatibility alias keys
  UNDER_VERIFICATION: 'UNDER_INITIAL_REVIEW',
  ADDITIONAL_INFO_REQUIRED: 'ADDITIONAL_INFORMATION_REQUIRED',
  DOCUMENTS_VERIFIED: 'DOCUMENT_VERIFIED',
  CREDENTIALS_SENT: 'ACTIVATION_PENDING',
  PASSWORD_SET: 'SUCCESSFULLY_REGISTERED',
  ACTIVE: 'SUCCESSFULLY_REGISTERED',
  APPLICATION_REJECTED: 'REJECTED',
  ACTIVATION_LINK_EXPIRED: 'ACTIVATION_LINK_EXPIRED',
  APPLICATION_WITHDRAWN: 'APPLICATION_WITHDRAWN'
};

const OrganizationApplicationSchema = new mongoose.Schema(
  {
    applicationId: { type: String, required: true, unique: true, index: true },
    organizationName: { type: String, required: true, trim: true },
    organizationType: {
      type: String,
      required: true,
      enum: [
        'HOSPITAL',
        'POLICE',
        'FIRE_RESCUE',
        'AMBULANCE_PROVIDER',
        'DISASTER_MANAGEMENT',
        'DISASTER_RELIEF_NGO',
        'NGO',
        'SHELTER_PROVIDER',
        'SHELTER'
      ]
    },
    officialEmail: { type: String, required: true, lowercase: true, trim: true },
    contactNumber: { type: String, required: true },
    registrationNumber: { type: String, required: true, unique: true },
    authorizedPersonName: { type: String, required: true },
    authorizedPersonDesignation: { type: String, required: true },
    supportingDocumentUrl: { type: String },

    // Physical Location Details
    address: { type: String, required: true },
    state: { type: String, default: 'Delhi' },
    district: { type: String, default: 'Central Delhi' },
    city: { type: String, default: 'New Delhi' },
    postalCode: { type: String, default: '110001' },

    // GeoJSON Location (longitude, latitude) with 2dsphere index
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true } // [lng, lat]
    },
    locationSource: {
      type: String,
      enum: ['GPS', 'MANUAL_PIN', 'DEMO_SELECTED'],
      default: 'MANUAL_PIN'
    },
    locationAccuracy: { type: Number, default: 10 },
    formattedAddress: { type: String },
    locationConfirmedByUser: { type: Boolean, default: false },
    locationVerifiedByAdmin: { type: Boolean, default: false },
    locationVerifiedAt: { type: Date },
    locationVerifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    status: {
      type: String,
      enum: Object.values(OrganizationApplicationStatus),
      default: OrganizationApplicationStatus.APPLICATION_SUBMITTED
    },
    adminNotes: { type: String },

    // Cryptographically secure Token HASH (never stored plain)
    activationTokenHash: { type: String },
    activationTokenExpires: { type: Date },

    // Tracking Security (Hashed OTP for application status checking)
    trackingOtpHash: { type: String },
    trackingOtpExpires: { type: Date },
    trackingOtpAttempts: { type: Number, default: 0 },

    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
    createdUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    statusHistory: [
      {
        status: { type: String, required: true },
        note: { type: String },
        updatedBy: { type: String, default: 'System' },
        updatedAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

OrganizationApplicationSchema.index({ location: '2dsphere' });
OrganizationApplicationSchema.index({ status: 1, organizationType: 1 });

export const OrganizationApplication = mongoose.model(
  'OrganizationApplication',
  OrganizationApplicationSchema
);
