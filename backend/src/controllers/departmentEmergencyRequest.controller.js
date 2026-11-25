import mongoose from 'mongoose';
import { DepartmentEmergencyRequest, EmergencyRequestStatus } from '../models/departmentEmergencyRequest.model.js';
import { Incident } from '../models/incident.model.js';
import { ResponseUnit } from '../models/responseUnit.model.js';
import { AuditLog } from '../models/audit.model.js';
import { getIO } from '../events/socket.js';

/**
 * 1. Get Incoming Emergency Requests for Department / Organization
 */
export const getDepartmentEmergencyRequests = async (req, res) => {
  try {
    const { departmentType, status } = req.query;
    const filter = {};

    if (departmentType) filter.departmentType = departmentType;
    if (status) filter.status = status;

    // Organization data isolation check
    if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'CENTRAL_ADMIN') {
      if (req.user.organizationId) {
        filter.$or = [
          { organizationId: req.user.organizationId },
          { departmentType: req.user.departmentType }
        ];
      } else if (req.user.departmentType) {
        filter.departmentType = req.user.departmentType;
      }
    }

    const requests = await DepartmentEmergencyRequest.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 2. Accept Emergency Request & Assign Unit
 */
export const acceptEmergencyRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { unitId, unitIdentifier, notes } = req.body;

    // Support lookup by either human-readable requestId (REQ-XXX) or MongoDB _id
    const query = mongoose.Types.ObjectId.isValid(requestId)
      ? { $or: [{ _id: requestId }, { requestId }] }
      : { requestId };

    const request = await DepartmentEmergencyRequest.findOne(query);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Emergency request not found' });
    }

    request.status = EmergencyRequestStatus.ACCEPTED;
    request.acceptedAt = new Date();
    request.assignedLeaderId = req.user.userId;
    request.assignedLeaderName = req.user.name;

    if (unitId || unitIdentifier) {
      request.assignedUnitId = unitId;
      request.unitIdentifier = unitIdentifier;
      request.status = EmergencyRequestStatus.UNIT_ASSIGNED;
    }

    await request.save();

    // Update main incident notes and active units
    const incident = await Incident.findById(request.incidentId);
    if (incident) {
      incident.notes.push({
        authorName: req.user.name,
        authorRole: req.user.role,
        text: `Department request ${request.requestId} accepted by ${request.departmentType}. Unit: ${unitIdentifier || 'Pending unit selection'}.`,
        createdAt: new Date()
      });

      incident.timeline.push({
        stage: 'UNIT_ASSIGNED',
        actorName: req.user.name,
        department: request.departmentType,
        message: `${request.departmentType} accepted emergency dispatch request.`,
        timestamp: new Date(),
        isPublicToCitizen: true
      });

      if (unitIdentifier) {
        incident.activeUnits.push({
          unitId: unitId,
          unitIdentifier: unitIdentifier,
          departmentType: request.departmentType,
          status: 'DISPATCHED'
        });
      }

      await incident.save();
    }

    try {
      const io = getIO();
      io.to(`incident:${request.incidentId}`).emit('emergency:request_accepted', {
        requestId: request.requestId,
        departmentType: request.departmentType,
        unitIdentifier: request.unitIdentifier,
        status: request.status
      });
      io.to('dept:central_admin').emit('emergency:request_accepted', request);
    } catch (e) {}

    await AuditLog.create({
      actorId: req.user.userId,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'EMERGENCY_REQUEST_ACCEPTED',
      resource: 'DepartmentEmergencyRequest',
      resourceId: request._id.toString(),
      details: { requestId, unitIdentifier }
    });

    return res.status(200).json({
      success: true,
      message: 'Emergency request accepted successfully and response unit assigned.',
      request
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 3. Decline Emergency Request with Reason
 */
export const declineEmergencyRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { declineReason } = req.body;

    const query = mongoose.Types.ObjectId.isValid(requestId)
      ? { $or: [{ _id: requestId }, { requestId }] }
      : { requestId };

    const request = await DepartmentEmergencyRequest.findOne(query);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Emergency request not found' });
    }

    request.status = EmergencyRequestStatus.DECLINED;
    request.declineReason = declineReason || 'Units fully committed or area outside jurisdictional coverage.';
    await request.save();

    const incident = await Incident.findById(request.incidentId);
    if (incident) {
      incident.notes.push({
        authorName: req.user.name,
        authorRole: req.user.role,
        text: `Emergency request declined by ${request.departmentType}: ${request.declineReason}`,
        createdAt: new Date()
      });
      await incident.save();
    }

    try {
      const io = getIO();
      io.to('dept:central_admin').emit('emergency:request_declined', {
        requestId: request.requestId,
        departmentType: request.departmentType,
        declineReason: request.declineReason
      });
    } catch (e) {}

    return res.status(200).json({
      success: true,
      message: 'Emergency request marked as declined. Central Admin alerted for re-routing.',
      request
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
