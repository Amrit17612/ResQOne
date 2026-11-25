import mongoose from 'mongoose';

const StationSchema = new mongoose.Schema(
  {
    stationId: { type: String, required: true, unique: true, index: true }, // e.g. POL-STN-01, FIRE-STN-04
    name: { type: String, required: true, trim: true },
    departmentType: {
      type: String,
      required: true,
      enum: ['POLICE', 'FIRE_RESCUE', 'DISASTER_MANAGEMENT']
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OrganizationApplication',
      required: true,
      index: true
    },
    address: { type: String, required: true },
    contactPhone: { type: String, required: true },
    officerInChargeName: { type: String },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true } // [longitude, latitude]
    },
    operationalStatus: {
      type: String,
      enum: ['ACTIVE', 'STANDBY', 'MAINTENANCE'],
      default: 'ACTIVE'
    }
  },
  { timestamps: true }
);

StationSchema.index({ location: '2dsphere' });

export const Station = mongoose.model('Station', StationSchema);

