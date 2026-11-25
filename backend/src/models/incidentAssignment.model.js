import mongoose from 'mongoose';

export const AssignmentStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  DISPATCHED: 'DISPATCHED',
  APPROACHING: 'APPROACHING',
  ARRIVED: 'ARRIVED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

const IncidentAssignmentSchema = new mongoose.Schema(
  {
    incidentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Incident', required: true, index: true },
    departmentType: {
      type: String,
      required: true,
      enum: ['POLICE', 'FIRE_RESCUE', 'AMBULANCE', 'DISASTER_MANAGEMENT']
    },
    assignedUnitId: { type: mongoose.Schema.Types.ObjectId, ref: 'ResponseUnit' },
    unitIdentifier: { type: String },
    assignedStaffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedStaffName: { type: String },
    status: {
      type: String,
      enum: Object.values(AssignmentStatus),
      default: AssignmentStatus.PENDING
    },
    assignedAt: { type: Date, default: Date.now },
    dispatchedAt: { type: Date },
    arrivedAt: { type: Date },
    completedAt: { type: Date },
    trackingActive: { type: Boolean, default: false },
    notes: { type: String }
  },
  { timestamps: true }
);

IncidentAssignmentSchema.index({ incidentId: 1, departmentType: 1 });

export const IncidentAssignment = mongoose.model('IncidentAssignment', IncidentAssignmentSchema);

