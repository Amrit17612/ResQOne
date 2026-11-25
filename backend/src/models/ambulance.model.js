import mongoose from 'mongoose';
import { AmbulanceStatus } from '../constants/enums.js';

const AmbulanceSchema = new mongoose.Schema(
  {
    vehicleNumber: { type: String, required: true, unique: true },
    driverName: { type: String, required: true },
    driverPhone: { type: String, required: true },
    paramedicName: { type: String, required: true },
    ambulanceType: { type: String, enum: ['BLS', 'ALS', 'PATIENT_TRANSPORT'], default: 'BLS' },
    status: {
      type: String,
      enum: Object.values(AmbulanceStatus),
      default: AmbulanceStatus.AVAILABLE
    },
    currentLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
      updatedAt: { type: Date, default: Date.now }
    },
    activeIncidentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Incident' },
    assignedHospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
    patientHandoverNotes: { type: String }
  },
  { timestamps: true }
);

AmbulanceSchema.index({ currentLocation: '2dsphere' });

export const Ambulance = mongoose.model('Ambulance', AmbulanceSchema);

