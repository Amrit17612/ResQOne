import mongoose from 'mongoose';

const VolunteerTaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    requiredSkills: [{ type: String }],
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
      address: { type: String, required: true }
    },
    urgency: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
    status: {
      type: String,
      enum: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'OPEN'
    },
    assignedVolunteerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedVolunteerName: { type: String },
    shelterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shelter' },
    incidentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Incident' }
  },
  { timestamps: true }
);

VolunteerTaskSchema.index({ 'location': '2dsphere' });

export const VolunteerTask = mongoose.model('VolunteerTask', VolunteerTaskSchema);

