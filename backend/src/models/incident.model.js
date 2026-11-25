import mongoose from 'mongoose';
import { IncidentCategory, IncidentSubcategory, IncidentPriority, IncidentStatus } from '../constants/enums.js';

export const EvidenceExceptionReason = {
  IMMEDIATE_EMERGENCY: 'IMMEDIATE_EMERGENCY',
  UNSAFE_TO_PHOTOGRAPH: 'UNSAFE_TO_PHOTOGRAPH',
  VICTIM_INJURED: 'VICTIM_INJURED',
  CAMERA_NETWORK_UNAVAILABLE: 'CAMERA_NETWORK_UNAVAILABLE'
};

const IncidentSchema = new mongoose.Schema(
  {
    referenceId: { type: String, required: true, unique: true, index: true },
    reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reporterName: { type: String, required: true },
    reporterPhone: { type: String, required: true },
    category: {
      type: String,
      enum: Object.values(IncidentCategory),
      default: IncidentCategory.OTHER
    },
    subcategory: {
      type: String,
      enum: [...Object.values(IncidentSubcategory), null],
      default: null
    },
    priority: {
      type: String,
      enum: Object.values(IncidentPriority),
      default: IncidentPriority.MEDIUM
    },
    status: {
      type: String,
      enum: Object.values(IncidentStatus),
      default: IncidentStatus.PENDING_VERIFICATION
    },
    title: { type: String, required: true },
    description: { type: String, required: true },

    // GeoJSON Point location
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true
      },
      address: { type: String, required: true },
      landmark: { type: String },
      locationSource: { type: String, enum: ['GPS', 'MANUAL_MAP_PIN'], default: 'MANUAL_MAP_PIN' },
      accuracy: { type: Number, default: 10 },
      locationConfirmed: { type: Boolean, default: true }
    },
    mediaUrls: [{ type: String }],

    // Category-Aware Evidence Policy fields
    evidenceStatus: {
      type: String,
      enum: ['VERIFIED_ATTACHED', 'EMERGENCY_EXCEPTION', 'OPTIONAL_OMITTED'],
      default: 'VERIFIED_ATTACHED'
    },
    evidenceExceptionReason: {
      type: String,
      enum: Object.values(EvidenceExceptionReason)
    },

    assignedDepartments: [{ type: String }],
    activeUnits: [
      {
        unitId: { type: mongoose.Schema.Types.ObjectId, ref: 'ResponseUnit' },
        unitIdentifier: { type: String },
        departmentType: { type: String },
        status: { type: String, default: 'DISPATCHED' }
      }
    ],

    // Hospital Allocation Link
    assignedHospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
    assignedHospitalName: { type: String },
    allocationStatus: {
      type: String,
      enum: ['NONE', 'REQUESTED', 'ACCEPTED', 'REJECTED', 'HANDOVER_COMPLETED'],
      default: 'NONE'
    },

    verificationDetails: {
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      verifiedAt: { type: Date },
      rejectionReason: { type: String }
    },
    aiAdvisory: {
      suggestedCategory: { type: String },
      suggestedPriority: { type: String },
      suggestedDepartments: [{ type: String }],
      confidenceScore: { type: Number },
      summary: { type: String }
    },

    // Persisted Incident Event Timeline
    timeline: [
      {
        stage: { type: String, required: true },
        actorName: { type: String },
        department: { type: String },
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        isPublicToCitizen: { type: Boolean, default: true }
      }
    ],

    closureDetails: {
      closedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      closedByName: { type: String },
      closedAt: { type: Date },
      closureSummary: { type: String },
      departmentCompletionSnapshot: [{ type: Object }],
      isOverride: { type: Boolean, default: false },
      overrideReason: { type: String }
    },

    notes: [
      {
        authorName: { type: String, required: true },
        authorRole: { type: String, required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

IncidentSchema.index({ location: '2dsphere' });
IncidentSchema.index({ status: 1, priority: 1 });

export const Incident = mongoose.model('Incident', IncidentSchema);
