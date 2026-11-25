import mongoose from 'mongoose';

const LocationHistorySchema = new mongoose.Schema(
  {
    unitId: { type: mongoose.Schema.Types.ObjectId, ref: 'ResponseUnit', required: true, index: true },
    incidentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Incident', index: true },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true
    },
    accuracy: { type: Number, default: 5 },
    heading: { type: Number, default: 0 },
    speed: { type: Number, default: 0 },
    source: { type: String, enum: ['LIVE_GPS', 'DEMO_SIMULATION'], default: 'LIVE_GPS' },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: false }
);

LocationHistorySchema.index({ unitId: 1, timestamp: -1 });

export const LocationHistory = mongoose.model('LocationHistory', LocationHistorySchema);

