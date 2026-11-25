import mongoose from 'mongoose';

const DepartmentUnitSchema = new mongoose.Schema(
  {
    unitId: { type: String, required: true, unique: true, index: true }, // e.g. POL-UNIT-001, FIRE-UNIT-001, RESCUE-UNIT-001
    name: { type: String, required: true, trim: true },
    departmentType: {
      type: String,
      required: true,
      enum: ['POLICE', 'FIRE_RESCUE', 'DISASTER_MANAGEMENT']
    },
    unitType: {
      type: String,
      required: true // PATROL_UNIT, TRAFFIC_UNIT, SWAT, WATER_TENDER_TEAM, RESCUE_SQUAD
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OrganizationApplication',
      required: true,
      index: true
    },
    stationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Station'
    },
    unitLeaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    unitLeaderName: { type: String },
    assignedOfficers: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        staffId: { type: String },
        name: { type: String },
        rank: { type: String }
      }
    ],
    assignedVehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ResponseUnit'
    },
    vehicleIdentifier: { type: String },
    status: {
      type: String,
      enum: ['AVAILABLE', 'DISPATCHED', 'ON_SCENE', 'BUSY', 'MAINTENANCE'],
      default: 'AVAILABLE'
    },
    activeIncidentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Incident'
    },
    capabilities: [{ type: String }]
  },
  { timestamps: true }
);

export const DepartmentUnit = mongoose.model('DepartmentUnit', DepartmentUnitSchema);

