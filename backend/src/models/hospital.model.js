import mongoose from 'mongoose';
import { BedCategory } from '../constants/enums.js';

const BedSubSchema = new mongoose.Schema(
  {
    total: { type: Number, default: 0 },
    occupied: { type: Number, default: 0 },
    reserved: { type: Number, default: 0 }
  },
  { _id: false }
);

const HospitalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    registrationNumber: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    emergencyHotline: { type: String, required: true },
    address: { type: String, required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }
    },
    hasTraumaCenter: { type: Boolean, default: false },
    hasICU: { type: Boolean, default: true },
    hasBurnUnit: { type: Boolean, default: false },
    beds: {
      [BedCategory.GENERAL]: { type: BedSubSchema, default: { total: 50, occupied: 30, reserved: 0 } },
      [BedCategory.OXYGEN_SUPPORT]: { type: BedSubSchema, default: { total: 20, occupied: 10, reserved: 0 } },
      [BedCategory.ICU]: { type: BedSubSchema, default: { total: 10, occupied: 6, reserved: 0 } },
      [BedCategory.NICU]: { type: BedSubSchema, default: { total: 5, occupied: 2, reserved: 0 } },
      [BedCategory.TRAUMA_STABILIZATION]: { type: BedSubSchema, default: { total: 5, occupied: 1, reserved: 0 } }
    }
  },
  { timestamps: true }
);

HospitalSchema.index({ location: '2dsphere' });

export const Hospital = mongoose.model('Hospital', HospitalSchema);

