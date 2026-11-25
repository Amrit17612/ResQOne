import mongoose from 'mongoose';

export const EmergencyRequestStatus = {
  REQUEST_CREATED: 'REQUEST_CREATED',
  NOTIFICATION_QUEUED: 'NOTIFICATION_QUEUED',
  NOTIFIED: 'NOTIFIED',
  ACKNOWLEDGED: 'ACKNOWLEDGED',
  ACCEPTED: 'ACCEPTED',
  DECLINED: 'DECLINED',
  UNIT_ASSIGNED: 'UNIT_ASSIGNED',
  DISPATCHED: 'DISPATCHED',
  ARRIVED_AT_SCENE: 'ARRIVED_AT_SCENE',
  OPERATION_IN_PROGRESS: 'OPERATION_IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

const DepartmentEmergencyRequestSchema = new mongoose.Schema(
  {
    requestId: { type: String, required: true, unique: true, index: true },
    incidentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Incident', required: true, index: true },
    referenceId: { type: String, required: true },
    departmentType: {
      type: String,
      required: true,
      enum: ['POLICE', 'FIRE_RESCUE', 'AMBULANCE', 'DISASTER_MANAGEMENT', 'NGO', 'SHELTER']
    },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'OrganizationApplication', index: true },
    organizationName: { type: String },

    // Request details
    priority: { type: String, default: 'HIGH' },
    category: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
      address: { type: String, required: true }
    },
    centralAdminInstructions: { type: String },

    // Lifecycle Status
    status: {
      type: String,
      enum: Object.values(EmergencyRequestStatus),
      default: EmergencyRequestStatus.REQUEST_CREATED,
      index: true
    },
    declineReason: { type: String },
    idempotencyKey: { type: String, unique: true, sparse: true, index: true },

    // Department actions
    acknowledgedAt: { type: Date },
    acceptedAt: { type: Date },
    assignedUnitId: { type: mongoose.Schema.Types.ObjectId, ref: 'ResponseUnit' },
    unitIdentifier: { type: String },
    assignedLeaderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedLeaderName: { type: String },
    completedAt: { type: Date },

    // Relief / Shelter specific fields
    reliefSuppliesRequested: [{ type: String }],
    evacuationCountRequired: { type: Number, default: 0 }
  },
  { timestamps: true }
);

DepartmentEmergencyRequestSchema.index({ incidentId: 1, departmentType: 1 });
DepartmentEmergencyRequestSchema.index({ organizationId: 1, status: 1 });

export const DepartmentEmergencyRequest = mongoose.model(
  'DepartmentEmergencyRequest',
  DepartmentEmergencyRequestSchema
);

