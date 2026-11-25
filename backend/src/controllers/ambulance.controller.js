import { Ambulance } from '../models/ambulance.model.js';
import { getIO } from '../events/socket.js';

export const getAmbulances = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const ambulances = await Ambulance.find(filter)
      .populate('activeIncidentId')
      .populate('assignedHospitalId');
    return res.status(200).json({ success: true, count: ambulances.length, ambulances });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAmbulanceStatus = async (req, res) => {
  try {
    const { status, activeIncidentId, assignedHospitalId, patientHandoverNotes } = req.body;
    const ambulance = await Ambulance.findById(req.params.id);

    if (!ambulance) {
      return res.status(404).json({ success: false, message: 'Ambulance not found' });
    }

    if (status) ambulance.status = status;
    if (activeIncidentId !== undefined) ambulance.activeIncidentId = activeIncidentId || null;
    if (assignedHospitalId !== undefined) ambulance.assignedHospitalId = assignedHospitalId || null;
    if (patientHandoverNotes) ambulance.patientHandoverNotes = patientHandoverNotes;

    await ambulance.save();

    try {
      const io = getIO();
      io.emit('ambulance:status_updated', ambulance);
    } catch (e) {}

    return res.status(200).json({ success: true, message: 'Ambulance status updated.', ambulance });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAmbulanceLocation = async (req, res) => {
  try {
    const { longitude, latitude } = req.body;
    const ambulance = await Ambulance.findById(req.params.id);

    if (!ambulance) {
      return res.status(404).json({ success: false, message: 'Ambulance not found' });
    }

    ambulance.currentLocation = {
      type: 'Point',
      coordinates: [Number(longitude), Number(latitude)],
      updatedAt: new Date()
    };

    await ambulance.save();

    try {
      const io = getIO();
      io.emit('ambulance:location_updated', {
        ambulanceId: ambulance._id,
        coordinates: [Number(longitude), Number(latitude)]
      });
    } catch (e) {}

    return res.status(200).json({ success: true, message: 'Location updated.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

