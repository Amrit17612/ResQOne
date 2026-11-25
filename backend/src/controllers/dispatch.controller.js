import { ResponseUnit, UnitStatus } from '../models/responseUnit.model.js';
import { IncidentAssignment, AssignmentStatus } from '../models/incidentAssignment.model.js';
import { LocationHistory } from '../models/locationHistory.model.js';
import { Incident } from '../models/incident.model.js';
import { AuditLog } from '../models/audit.model.js';
import { getIO } from '../events/socket.js';
import { calculateRoadRouting } from '../utils/geoRouting.js';

/**
 * Find operational unit assigned to currently authenticated staff member
 */
export const getMyUnit = async (req, res) => {
  try {
    const userId = req.user?._id;
    const userName = req.user?.name;
    const userRole = req.user?.role;

    // 1. Try finding by direct user id if stored
    let unit = await ResponseUnit.findOne({ assignedStaffId: userId });

    // 2. Try finding by matching staff name
    if (!unit && userName) {
      unit = await ResponseUnit.findOne({ assignedStaffName: userName });
    }

    // 3. Fallback: check by role affinity if appropriate for seed staff
    if (!unit && userRole) {
      if (userRole.includes('AMBULANCE') || userRole.includes('PARAMEDIC')) {
        unit = await ResponseUnit.findOne({ departmentType: 'AMBULANCE' });
      } else if (userRole.includes('POLICE')) {
        unit = await ResponseUnit.findOne({ departmentType: 'POLICE' });
      } else if (userRole.includes('FIRE')) {
        unit = await ResponseUnit.findOne({ departmentType: 'FIRE_RESCUE' });
      } else if (userRole.includes('DISASTER')) {
        unit = await ResponseUnit.findOne({ departmentType: 'DISASTER_MANAGEMENT' });
      }
    }

    if (!unit) {
      return res.status(200).json({
        success: true,
        assigned: false,
        message: 'No response unit currently assigned to this user.',
        unit: null
      });
    }

    return res.status(200).json({
      success: true,
      assigned: true,
      unit
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve assigned unit profile',
      error: error.message
    });
  }
};

/**
 * 1. Find suitable available operational units for dispatch
 */
export const findSuitableUnits = async (req, res) => {
  try {
    const {
      departmentType,
      incidentLatitude,
      incidentLongitude,
      incidentLat,
      incidentLng,
      maxDistanceKm = 50
    } = req.query;

    const lat = Number(incidentLatitude || incidentLat) || 28.5420;
    const lng = Number(incidentLongitude || incidentLng) || 77.2210;

    const filter = {};
    if (departmentType) filter.departmentType = departmentType;

    const units = await ResponseUnit.find(filter);

    const unitsWithDistance = units.map((unit) => {
      const routing = calculateRoadRouting(
        lat,
        lng,
        unit.currentLocation?.coordinates?.[1] || lat,
        unit.currentLocation?.coordinates?.[0] || lng
      );
      return {
        ...unit.toObject(),
        roadDistanceKm: routing.roadDistanceKm,
        distanceKm: routing.roadDistanceKm,
        etaMinutes: routing.etaMinutes,
        estimatedMinutes: routing.etaMinutes,
        etaFormatted: routing.etaFormatted
      };
    });

    // Rank nearest first
    unitsWithDistance.sort((a, b) => a.roadDistanceKm - b.roadDistanceKm);

    return res.status(200).json({
      success: true,
      count: unitsWithDistance.length,
      units: unitsWithDistance
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 2. Assign Unit to Incident (Central Admin or Dispatcher action)
 */
export const assignUnitToIncident = async (req, res) => {
  try {
    const { incidentId, unitId, departmentType, notes } = req.body;

    const incident = await Incident.findById(incidentId);
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }

    const unit = await ResponseUnit.findById(unitId);
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Unit not found' });
    }

    if (unit.status !== UnitStatus.AVAILABLE && unit.status !== UnitStatus.ASSIGNED) {
      return res.status(400).json({ success: false, message: `Unit is currently in status: ${unit.status}` });
    }

    // Create Assignment Record
    const assignment = await IncidentAssignment.create({
      incidentId: incident._id,
      departmentType: departmentType || unit.departmentType,
      assignedUnitId: unit._id,
      unitIdentifier: unit.unitIdentifier,
      assignedStaffId: unit.assignedStaffId || req.user?.userId,
      assignedStaffName: unit.assignedStaffName || req.user?.name || 'Unit Commander',
      status: AssignmentStatus.DISPATCHED,
      dispatchedAt: new Date(),
      trackingActive: true,
      notes
    });

    // Update Unit status
    unit.status = UnitStatus.DISPATCHED;
    unit.activeIncidentId = incident._id;
    unit.activeAssignmentId = assignment._id;
    await unit.save();

    // Link unit to incident activeUnits array
    incident.activeUnits.push({
      unitId: unit._id,
      unitIdentifier: unit.unitIdentifier,
      departmentType: unit.departmentType,
      status: 'DISPATCHED'
    });

    // Add Timeline Event for Citizen and Admin
    incident.timeline.push({
      stage: 'UNIT_DISPATCHED',
      actorName: req.user?.name || 'Central Dispatch',
      department: unit.departmentType,
      message: `${unit.departmentType} unit (${unit.unitIdentifier}) dispatched towards incident location.`,
      timestamp: new Date(),
      isPublicToCitizen: true
    });

    await incident.save();

    // Broadcast Real-time Events
    try {
      const io = getIO();
      io.to(`incident:${incident._id}`).emit('dispatch:unit_assigned', {
        incidentId: incident._id,
        assignment,
        unit
      });
      io.to(`dept:${unit.departmentType.toLowerCase()}`).emit('dispatch:unit_assigned', {
        incidentId: incident._id,
        assignment,
        unit
      });
      io.to('dept:central_admin').emit('incident:updated', incident);
    } catch (e) {}

    await AuditLog.create({
      actorId: req.user?.userId,
      actorName: req.user?.name || 'Dispatcher',
      actorRole: req.user?.role || 'CENTRAL_ADMIN',
      action: 'UNIT_DISPATCHED',
      resource: 'IncidentAssignment',
      resourceId: assignment._id.toString(),
      details: { incidentId: incident._id, unitIdentifier: unit.unitIdentifier }
    });

    return res.status(201).json({
      success: true,
      message: `${unit.unitIdentifier} successfully dispatched.`,
      assignment,
      unit
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 3. Ingest GPS Telemetry from Authorized Unit (Live or Simulated)
 */
export const updateUnitTelemetry = async (req, res) => {
  try {
    const { unitId, latitude, longitude, accuracy = 5, heading = 0, speed = 0, source = 'LIVE_GPS' } = req.body;

    const unit = await ResponseUnit.findById(unitId);
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Unit not found' });
    }

    unit.currentLocation = {
      type: 'Point',
      coordinates: [Number(longitude), Number(latitude)],
      accuracy: Number(accuracy),
      heading: Number(heading),
      speed: Number(speed),
      updatedAt: new Date()
    };
    unit.isLiveGps = source === 'LIVE_GPS';
    unit.isSimulatedGps = source === 'DEMO_SIMULATION';
    await unit.save();

    // Persist to location history (for route tracing)
    await LocationHistory.create({
      unitId: unit._id,
      incidentId: unit.activeIncidentId,
      coordinates: [Number(longitude), Number(latitude)],
      accuracy: Number(accuracy),
      heading: Number(heading),
      speed: Number(speed),
      source
    });

    // Realtime broadcast to Incident Room (Citizen Map) and Admin Room
    try {
      const io = getIO();
      const telemetryPayload = {
        unitId: unit._id,
        unitIdentifier: unit.unitIdentifier,
        departmentType: unit.departmentType,
        incidentId: unit.activeIncidentId,
        coordinates: [Number(longitude), Number(latitude)],
        source,
        updatedAt: new Date().toISOString()
      };

      if (unit.activeIncidentId) {
        io.to(`incident:${unit.activeIncidentId}`).emit('vehicle:location_updated', telemetryPayload);
      }
      io.to('dept:central_admin').emit('vehicle:location_updated', telemetryPayload);
      io.to(`dept:${unit.departmentType.toLowerCase()}`).emit('vehicle:location_updated', telemetryPayload);
    } catch (e) {}

    return res.status(200).json({
      success: true,
      message: 'Telemetry coordinates persisted and broadcast.',
      source
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 4. Update Operational Stage (Approaching -> Arrived -> Patient Pickup -> etc.)
 */
export const updateUnitStage = async (req, res) => {
  try {
    const { unitId, stage, note } = req.body;

    const unit = await ResponseUnit.findById(unitId);
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Unit not found' });
    }

    unit.status = stage;
    await unit.save();

    if (unit.activeIncidentId) {
      const incident = await Incident.findById(unit.activeIncidentId);
      if (incident) {
        // Add timeline milestone
        incident.timeline.push({
          stage,
          actorName: req.user?.name || unit.unitIdentifier,
          department: unit.departmentType,
          message: note || `${unit.unitIdentifier} reached status: ${stage.replace(/_/g, ' ')}.`,
          timestamp: new Date(),
          isPublicToCitizen: true
        });

        // Update active unit record
        const matchingUnit = incident.activeUnits.find((u) => u.unitId?.toString() === unit._id.toString());
        if (matchingUnit) {
          matchingUnit.status = stage;
        }

        // If Operation Completed, end tracking for citizen
        if (stage === 'OPERATION_COMPLETED' || stage === 'PATIENT_HANDOVER_COMPLETED') {
          unit.activeIncidentId = null;
          await unit.save();
        }

        await incident.save();

        try {
          const io = getIO();
          io.to(`incident:${incident._id}`).emit('incident:timeline_updated', {
            incidentId: incident._id,
            timeline: incident.timeline,
            unitStage: stage
          });
          io.to('dept:central_admin').emit('incident:updated', incident);
        } catch (e) {}
      }
    }

    return res.status(200).json({
      success: true,
      message: `Unit stage updated to ${stage}.`,
      unit
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 5. Get Citizen Tracking Feed for Authenticated Citizen or Reference ID
 */
export const getIncidentTrackingFeed = async (req, res) => {
  try {
    const { id } = req.params;

    const incident = await Incident.findById(id).populate('activeUnits.unitId');
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }

    // Find assigned active units with their latest telemetry
    const assignedUnits = await ResponseUnit.find({
      activeIncidentId: incident._id
    });

    return res.status(200).json({
      success: true,
      incident: {
        id: incident._id,
        referenceId: incident.referenceId,
        title: incident.title,
        category: incident.category,
        priority: incident.priority,
        status: incident.status,
        location: incident.location,
        timeline: incident.timeline,
        assignedDepartments: incident.assignedDepartments,
        assignedHospitalName: incident.assignedHospitalName,
        allocationStatus: incident.allocationStatus,
        createdAt: incident.createdAt
      },
      activeUnits: assignedUnits
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
