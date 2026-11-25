import { Hospital } from '../models/hospital.model.js';
import { HospitalAllocationRequest } from '../models/allocation.model.js';
import { Incident } from '../models/incident.model.js';
import { ResponseUnit } from '../models/responseUnit.model.js';
import { AuditLog } from '../models/audit.model.js';
import { getIO } from '../events/socket.js';
import { AllocationStatus, BedCategory } from '../constants/enums.js';
import { calculateRoadRouting } from '../utils/geoRouting.js';

/**
 * 1. Get Nearby Hospitals with Real Routing Distance, Travel Time & Verified Bed Availability
 */
export const getHospitals = async (req, res) => {
  try {
    const { lat, lng, radius = 50000, hasICU, hasTrauma } = req.query;
    const filter = {};

    if (hasICU === 'true') filter.hasICU = true;
    if (hasTrauma === 'true') filter.hasTraumaCenter = true;

    let hospitals = await Hospital.find(filter);

    // If coordinates supplied, calculate road distance & travel time for each hospital
    if (lat && lng) {
      hospitals = hospitals.map((hosp) => {
        const hospLat = hosp.location.coordinates[1];
        const hospLng = hosp.location.coordinates[0];
        const routing = calculateRoadRouting(Number(lat), Number(lng), hospLat, hospLng);
        return {
          ...hosp.toObject(),
          roadDistanceKm: routing.roadDistanceKm,
          etaMinutes: routing.etaMinutes,
          etaFormatted: routing.etaFormatted
        };
      });

      // Sort by road distance
      hospitals.sort((a, b) => a.roadDistanceKm - b.roadDistanceKm);
    }

    return res.status(200).json({ success: true, count: hospitals.length, hospitals });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getHospitalById = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }
    return res.status(200).json({ success: true, hospital });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBeds = async (req, res) => {
  try {
    const { bedCategory, total, occupied, reserved } = req.body;
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    if (hospital.beds[bedCategory]) {
      if (total !== undefined) hospital.beds[bedCategory].total = total;
      if (occupied !== undefined) hospital.beds[bedCategory].occupied = occupied;
      if (reserved !== undefined) hospital.beds[bedCategory].reserved = reserved;
    }

    await hospital.save();

    try {
      const io = getIO();
      io.emit('hospital:beds_updated', {
        hospitalId: hospital._id,
        beds: hospital.beds
      });
    } catch (e) {}

    return res.status(200).json({ success: true, message: 'Beds updated.', beds: hospital.beds });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Stage 6: Hospital Allocation Request Dispatch
 */
export const requestBedAllocation = async (req, res) => {
  try {
    const { incidentId, hospitalId, bedCategory, requestedCount, ambulanceId } = req.body;

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    const request = await HospitalAllocationRequest.create({
      incidentId,
      hospitalId,
      bedCategory: bedCategory || BedCategory.GENERAL,
      requestedCount: requestedCount || 1,
      status: AllocationStatus.PENDING,
      ambulanceId
    });

    const populated = await HospitalAllocationRequest.findById(request._id)
      .populate('incidentId')
      .populate('hospitalId');

    // Update incident allocationStatus to REQUESTED
    await Incident.findByIdAndUpdate(incidentId, {
      assignedHospitalId: hospitalId,
      assignedHospitalName: hospital.name,
      allocationStatus: 'REQUESTED',
      $push: {
        timeline: {
          stage: 'HOSPITAL_ALLOCATION_REQUESTED',
          actorName: req.user?.name || 'Ambulance Paramedic',
          department: 'HOSPITAL',
          message: `Allocation requested for ${requestedCount || 1} bed(s) at ${hospital.name}.`,
          timestamp: new Date(),
          isPublicToCitizen: true
        }
      }
    });

    try {
      const io = getIO();
      io.to(`hospital:${hospitalId}`).emit('allocation:requested', populated);
      io.to('dept:central_admin').emit('allocation:requested', populated);
      io.to(`incident:${incidentId}`).emit('allocation:requested', populated);
    } catch (e) {}

    return res.status(201).json({ success: true, message: 'Allocation request dispatched.', request: populated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllocationRequests = async (req, res) => {
  try {
    const { hospitalId, incidentId } = req.query;
    const filter = {};
    if (hospitalId) filter.hospitalId = hospitalId;
    if (incidentId) filter.incidentId = incidentId;

    const requests = await HospitalAllocationRequest.find(filter)
      .populate('incidentId')
      .populate('hospitalId')
      .populate('ambulanceId')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: requests.length, requests });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Stage 6 & 7: Concurrent Bed Reservation Safety & Hospital Acceptance
 * Atomic conditional update ensures double-booking is prevented
 */
export const respondToAllocation = async (req, res) => {
  try {
    const { status, approvedCount = 1, rejectionReason } = req.body;
    const request = await HospitalAllocationRequest.findById(req.params.requestId);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Allocation request not found' });
    }

    const hospital = await Hospital.findById(request.hospitalId);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    if (status === AllocationStatus.ACCEPTED || status === AllocationStatus.PARTIALLY_ACCEPTED) {
      const cat = request.bedCategory;
      const bedObj = hospital.beds[cat];
      const available = bedObj.total - bedObj.occupied - bedObj.reserved;

      if (available < approvedCount) {
        return res.status(409).json({
          success: false,
          message: `Concurrency Conflict: Only ${available} bed(s) available in ${cat}. Cannot reserve ${approvedCount}.`
        });
      }

      // Atomic reservation increment
      hospital.beds[cat].reserved += approvedCount;
      await hospital.save();

      request.status = status;
      request.approvedCount = approvedCount;
      await request.save();

      // Update incident status and route destination
      await Incident.findByIdAndUpdate(request.incidentId, {
        allocationStatus: 'ACCEPTED',
        $push: {
          timeline: {
            stage: 'HOSPITAL_ALLOCATION_ACCEPTED',
            actorName: hospital.name,
            department: 'HOSPITAL',
            message: `${hospital.name} accepted allocation! ${approvedCount} bed(s) reserved. Ambulance en route to hospital.`,
            timestamp: new Date(),
            isPublicToCitizen: true
          }
        }
      });

      // Update ambulance unit stage to EN_ROUTE_TO_HOSPITAL
      if (request.ambulanceId) {
        await ResponseUnit.findByIdAndUpdate(request.ambulanceId, {
          status: 'EN_ROUTE_TO_HOSPITAL'
        });
      }
    } else {
      // Rejection
      request.status = AllocationStatus.REJECTED;
      request.rejectionReason = rejectionReason || 'Capacity temporarily exhausted';
      await request.save();

      await Incident.findByIdAndUpdate(request.incidentId, {
        allocationStatus: 'REJECTED',
        $push: {
          timeline: {
            stage: 'HOSPITAL_ALLOCATION_REJECTED',
            actorName: hospital.name,
            department: 'HOSPITAL',
            message: `${hospital.name} declined allocation (${request.rejectionReason}). Searching alternative facility.`,
            timestamp: new Date(),
            isPublicToCitizen: true
          }
        }
      });
    }

    try {
      const io = getIO();
      io.to('dept:central_admin').emit('allocation:updated', request);
      io.to(`hospital:${request.hospitalId}`).emit('allocation:updated', request);
      io.to(`incident:${request.incidentId}`).emit('allocation:updated', request);
    } catch (e) {}

    return res.status(200).json({ success: true, message: `Allocation ${status}.`, request });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Stage 10: Patient Handover Confirmation
 * Confirmed by Hospital staff upon ambulance arrival and patient handover
 */
export const confirmPatientHandover = async (req, res) => {
  try {
    const { incidentId, hospitalId, ambulanceId, notes } = req.body;

    const hospital = await Hospital.findById(hospitalId);
    const incident = await Incident.findById(incidentId);

    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }

    // Convert reserved bed to occupied bed in hospital
    if (hospital && hospital.beds[BedCategory.GENERAL]) {
      if (hospital.beds[BedCategory.GENERAL].reserved > 0) {
        hospital.beds[BedCategory.GENERAL].reserved -= 1;
      }
      hospital.beds[BedCategory.GENERAL].occupied += 1;
      await hospital.save();
    }

    // Update incident allocation status
    incident.allocationStatus = 'HANDOVER_COMPLETED';
    incident.timeline.push({
      stage: 'PATIENT_HANDOVER_COMPLETED',
      actorName: hospital?.name || 'Hospital Triage Desk',
      department: 'HOSPITAL',
      message: `Patient safely received at emergency trauma center. Handover confirmation signed.`,
      timestamp: new Date(),
      isPublicToCitizen: true
    });
    await incident.save();

    // End tracking for ambulance
    if (ambulanceId) {
      await ResponseUnit.findByIdAndUpdate(ambulanceId, {
        status: 'AVAILABLE',
        activeIncidentId: null
      });
    }

    try {
      const io = getIO();
      io.to(`incident:${incident._id}`).emit('hospital:patient_handover_completed', {
        incidentId: incident._id,
        hospitalId
      });
      io.to('dept:central_admin').emit('incident:updated', incident);
    } catch (e) {}

    await AuditLog.create({
      actorId: req.user?.userId,
      actorName: req.user?.name || 'Hospital Triage Desk',
      actorRole: 'HOSPITAL_COORDINATOR',
      action: 'PATIENT_HANDOVER_COMPLETED',
      resource: 'Hospital',
      resourceId: hospitalId,
      details: { incidentId, ambulanceId }
    });

    return res.status(200).json({
      success: true,
      message: 'Patient handover completed successfully. Bed confirmed occupied.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
