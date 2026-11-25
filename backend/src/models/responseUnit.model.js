import mongoose from 'mongoose';
import { UserRole } from '../constants/enums.js';

export const UnitStatus = {
  AVAILABLE: 'AVAILABLE',
  ASSIGNED: 'ASSIGNED',
  DISPATCHED: 'DISPATCHED',
  APPROACHING: 'APPROACHING',
  ARRIVED: 'ARRIVED',
  ARRIVED_AT_SCENE: 'ARRIVED_AT_SCENE',
  RESPONSE_IN_PROGRESS: 'RESPONSE_IN_PROGRESS',
  PATIENT_PICKED_UP: 'PATIENT_PICKED_UP',
  EN_ROUTE_TO_HOSPITAL: 'EN_ROUTE_TO_HOSPITAL',
  ARRIVED_AT_HOSPITAL: 'ARRIVED_AT_HOSPITAL',
  PATIENT_HANDOVER_COMPLETED: 'PATIENT_HANDOVER_COMPLETED',
  OPERATION_COMPLETED: 'OPERATION_COMPLETED',
  MAINTENANCE: 'MAINTENANCE'
};

const ResponseUnitSchema = new mongoose.Schema(
  {
    unitIdentifier: { type: String, required: true, unique: true }, // e.g. "PCR-VAN-04", "FIRE-TENDER-12"
    departmentType: {
      type: String,
      required: true,
      enum: ['POLICE', 'FIRE_RESCUE', 'AMBULANCE', 'DISASTER_MANAGEMENT']
    },
    vehicleType: { type: String, default: 'PATROL_CAR' }, // PCR, AMBULANCE_ALS, FOAM_TENDER, RESCUE_BOAT
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'OrganizationApplication' },
    organizationName: { type: String },
    assignedStaffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedStaffName: { type: String },
    status: {
      type: String,
      enum: Object.values(UnitStatus),
      default: UnitStatus.AVAILABLE
    },
    isLiveGps: { type: Boolean, default: false },
    isSimulatedGps: { type: Boolean, default: false },
    currentLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [lng, lat]
      heading: { type: Number, default: 0 },
      speed: { type: Number, default: 0 },
      accuracy: { type: Number, default: 10 },
      updatedAt: { type: Date, default: Date.now }
    },
    activeIncidentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Incident' },
    activeAssignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'IncidentAssignment' },
    capabilities: [{ type: String }]
  },
  { timestamps: true }
);

ResponseUnitSchema.index({ currentLocation: '2dsphere' });
ResponseUnitSchema.index({ departmentType: 1, status: 1 });

export const ResponseUnit = mongoose.model('ResponseUnit', ResponseUnitSchema);
