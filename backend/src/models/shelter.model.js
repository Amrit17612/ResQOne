import mongoose from 'mongoose';

const ShelterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
      address: { type: String, required: true }
    },
    totalCapacity: { type: Number, required: true, default: 200 },
    occupiedCapacity: { type: Number, default: 0 },
    contactPerson: { type: String, required: true },
    phone: { type: String, required: true },
    supplies: {
      drinkingWaterLiters: { type: Number, default: 1000 },
      foodPackets: { type: Number, default: 500 },
      blankets: { type: Number, default: 300 },
      medicalKits: { type: Number, default: 50 }
    },
    status: {
      type: String,
      enum: ['OPERATIONAL', 'FULL', 'EVACUATING', 'CLOSED'],
      default: 'OPERATIONAL'
    }
  },
  { timestamps: true }
);

ShelterSchema.index({ 'location': '2dsphere' });

export const Shelter = mongoose.model('Shelter', ShelterSchema);

