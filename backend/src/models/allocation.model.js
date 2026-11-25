import mongoose from 'mongoose';
import { BedCategory, AllocationStatus } from '../constants/enums.js';

const AllocationRequestSchema = new mongoose.Schema(
  {
    incidentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Incident', required: true },
    hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
    bedCategory: {
      type: String,
      enum: Object.values(BedCategory),
      default: BedCategory.GENERAL
    },
    requestedCount: { type: Number, required: true, default: 1 },
    approvedCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: Object.values(AllocationStatus),
      default: AllocationStatus.PENDING
    },
    rejectionReason: { type: String },
    ambulanceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ambulance' }
  },
  { timestamps: true }
);

export const HospitalAllocationRequest = mongoose.model(
  'HospitalAllocationRequest',
  AllocationRequestSchema
);

