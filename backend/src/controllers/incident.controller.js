import { Incident } from '../models/incident.model.js';
import { DepartmentEmergencyRequest } from '../models/departmentEmergencyRequest.model.js';
import { AIServiceClient } from '../services/ai.service.js';
import { getIO } from '../events/socket.js';
import { IncidentStatus, UserRole } from '../constants/enums.js';
import { AuditLog } from '../models/audit.model.js';
import { routeApprovedIncident } from '../services/incidentRoutingService.js';

export const createIncident = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      subcategory,
      priority,
      latitude,
      longitude,
      address,
      landmark,
      reporterName,
      reporterPhone,
      mediaUrls,
      locationSource,
      accuracy,
      locationConfirmed,
      evidenceStatus,
      evidenceExceptionReason
    } = req.body;

    const count = await Incident.countDocuments();
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const referenceId = `RESQ-${dateStr}-${String(count + 1).padStart(4, '0')}`;

    const aiAdvisory = await AIServiceClient.analyzeIncident(title, description);

    const newIncident = await Incident.create({
      referenceId,
      reporterId: req.user?.userId,
      reporterName: reporterName || req.user?.name || 'Anonymous Citizen',
      reporterPhone: reporterPhone || 'Not provided',
      category: category || aiAdvisory.suggestedCategory,
      subcategory: subcategory || null,
      priority: priority || aiAdvisory.suggestedPriority,
      status: IncidentStatus.PENDING_VERIFICATION,
      title,
      description,
      location: {
        type: 'Point',
        coordinates: [Number(longitude), Number(latitude)],
        address,
        landmark,
        locationSource: locationSource || 'MANUAL_MAP_PIN',
        accuracy: accuracy ? Number(accuracy) : 10,
        locationConfirmed: locationConfirmed !== false
      },
      mediaUrls: mediaUrls || [],
      evidenceStatus: evidenceStatus || (mediaUrls?.length ? 'VERIFIED_ATTACHED' : 'EMERGENCY_EXCEPTION'),
      evidenceExceptionReason,
      assignedDepartments: [],
      aiAdvisory,
      notes: [
        {
          authorName: 'ResQOne AI System',
          authorRole: 'AI_ADVISORY',
          text: aiAdvisory.summary,
          createdAt: new Date()
        }
      ]
    });

    try {
      const io = getIO();
      io.to('dept:central_admin').emit('incident:new', newIncident);
      io.emit('incident:public_broadcast', {
        referenceId: newIncident.referenceId,
        category: newIncident.category,
        priority: newIncident.priority,
        location: newIncident.location
      });
    } catch (e) {
      // socket client fallback
    }

    return res.status(201).json({
      success: true,
      message: 'Emergency incident logged successfully.',
      incident: newIncident
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getIncidents = async (req, res) => {
  try {
    const { status, priority, category, department } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (department) filter.assignedDepartments = department;

    // Filter strictly for Department Users: Unverified incidents must never reach department dashboards
    if (
      req.user &&
      req.user.role !== UserRole.SUPER_ADMIN &&
      req.user.role !== UserRole.CENTRAL_ADMIN &&
      req.user.role !== UserRole.CITIZEN
    ) {
      filter.status = { $in: [IncidentStatus.VERIFIED, IncidentStatus.ASSIGNED, IncidentStatus.DISPATCHED, IncidentStatus.TEAM_ON_THE_WAY, IncidentStatus.ON_SCENE, IncidentStatus.ASSISTANCE_IN_PROGRESS, IncidentStatus.RESOLVED, IncidentStatus.CLOSED] };
    }

    if (req.user?.role === UserRole.POLICE_DISPATCHER) {
      filter.$or = [{ assignedDepartments: 'POLICE' }, { category: 'CRIME' }, { category: 'ROAD_ACCIDENT' }];
    } else if (req.user?.role === UserRole.FIRE_COMMANDER) {
      filter.$or = [{ assignedDepartments: 'FIRE_RESCUE' }, { category: 'FIRE' }, { category: 'BUILDING_COLLAPSE' }];
    } else if (
      req.user?.role === UserRole.HOSPITAL_COORDINATOR ||
      req.user?.role === UserRole.HOSPITAL_ADMIN ||
      req.user?.role === UserRole.DOCTOR
    ) {
      filter.$or = [
        { assignedDepartments: 'HOSPITAL' },
        { assignedDepartments: 'AMBULANCE' },
        { category: 'ROAD_ACCIDENT' },
        { category: 'MEDICAL_EMERGENCY' }
      ];
    } else if (req.user?.role === UserRole.CITIZEN) {
      filter.reporterId = req.user.userId;
    }

    const incidents = await Incident.find(filter).sort({ createdAt: -1 }).limit(100);
    return res.status(200).json({ success: true, count: incidents.length, incidents });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getIncidentById = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }
    return res.status(200).json({ success: true, incident });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getIncidentByReference = async (req, res) => {
  try {
    const incident = await Incident.findOne({ referenceId: req.params.referenceId });
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident reference not found' });
    }
    return res.status(200).json({ success: true, incident });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyIncident = async (req, res) => {
  try {
    const { status, rejectionReason, departments, priority } = req.body;
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }

    incident.status = status || IncidentStatus.VERIFIED;
    if (priority) incident.priority = priority;
    if (departments && Array.isArray(departments)) {
      incident.assignedDepartments = departments;
    }

    incident.verificationDetails = {
      verifiedBy: req.user?.userId,
      verifiedAt: new Date(),
      rejectionReason: rejectionReason || ''
    };

    incident.notes.push({
      authorName: req.user?.name || 'Central Admin',
      authorRole: req.user?.role || 'ADMIN',
      text: `Incident ${incident.status}. Departments assigned: ${incident.assignedDepartments.join(', ') || 'None'}.`,
      createdAt: new Date()
    });

    await incident.save();

    // Trigger Automatic Department Routing Engine upon Approval
    let routingResult = null;
    if (incident.status === IncidentStatus.VERIFIED || incident.status === 'VERIFIED') {
      try {
        routingResult = await routeApprovedIncident(incident._id, req.user);
      } catch (routingErr) {
        console.error('[Automatic Routing Trigger Warning]', routingErr.message);
      }
    }

    await AuditLog.create({
      actorId: req.user?.userId,
      actorName: req.user?.name || 'Admin',
      actorRole: req.user?.role || 'ADMIN',
      action: 'INCIDENT_VERIFIED',
      resource: 'Incident',
      resourceId: incident._id.toString(),
      details: { status: incident.status, departments: incident.assignedDepartments }
    });

    try {
      const io = getIO();
      incident.assignedDepartments.forEach((dept) => {
        io.to(`dept:${dept.toLowerCase()}`).emit('incident:assigned', incident);
        if (dept === 'HOSPITAL') {
          io.to('dept:hospital').emit('incident:assigned', incident);
        }
      });
      io.emit('incident:updated', incident);
    } catch (e) {}

    return res.status(200).json({ success: true, message: 'Incident verification updated.', incident });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateIncidentStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }

    incident.status = status;
    if (note) {
      incident.notes.push({
        authorName: req.user?.name || 'Responder',
        authorRole: req.user?.role || 'DEPARTMENT',
        text: note,
        createdAt: new Date()
      });
    }

    await incident.save();

    try {
      const io = getIO();
      io.emit('incident:updated', incident);
    } catch (e) {}

    return res.status(200).json({ success: true, message: 'Status updated.', incident });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Authorized Central Admin Final Incident Closure
 */
export const closeIncident = async (req, res) => {
  try {
    const { id } = req.params;
    const { closureSummary, isOverride, overrideReason } = req.body;

    const incident = await Incident.findById(id);
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }

    if (incident.status === IncidentStatus.CLOSED) {
      return res.status(400).json({ success: false, message: 'Incident is already closed.' });
    }

    if (!closureSummary || closureSummary.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'A detailed closure summary / operational debrief (at least 5 characters) is mandatory.'
      });
    }

    // Inspect active department emergency requests for this incident
    const requests = await DepartmentEmergencyRequest.find({ incidentId: incident._id });

    // Identify mandatory operational responders (POLICE, FIRE_RESCUE, AMBULANCE, DISASTER_MANAGEMENT)
    const pendingMandatoryRequests = requests.filter((r) => {
      const isMandatoryDept = ['POLICE', 'FIRE_RESCUE', 'AMBULANCE', 'DISASTER_MANAGEMENT'].includes(r.departmentType);
      const isUnresolved = !['COMPLETED', 'CANCELLED', 'DECLINED'].includes(r.status);
      return isMandatoryDept && isUnresolved;
    });

    if (pendingMandatoryRequests.length > 0 && !isOverride) {
      const unresolvedDepts = pendingMandatoryRequests.map((r) => `${r.departmentType} (${r.status})`).join(', ');
      return res.status(400).json({
        success: false,
        message: `Cannot close incident: Mandatory department operations are still active or unresolved: ${unresolvedDepts}. Use authorized override with justification if required.`,
        pendingRequests: pendingMandatoryRequests
      });
    }

    if (isOverride && (!overrideReason || overrideReason.trim().length < 5)) {
      return res.status(400).json({
        success: false,
        message: 'An authorized override requires a clear operational justification reason.'
      });
    }

    // Capture snapshot of department completion states
    const departmentCompletionSnapshot = requests.map((r) => ({
      requestId: r.requestId,
      departmentType: r.departmentType,
      organizationName: r.organizationName,
      status: r.status,
      assignedUnitId: r.assignedUnitId,
      completedAt: r.completedAt
    }));

    incident.status = IncidentStatus.CLOSED;
    incident.closureDetails = {
      closedBy: req.user.userId,
      closedByName: req.user.name || 'Central Admin',
      closedAt: new Date(),
      closureSummary: closureSummary.trim(),
      departmentCompletionSnapshot,
      isOverride: Boolean(isOverride),
      overrideReason: isOverride ? overrideReason.trim() : null
    };

    incident.timeline.push({
      stage: 'INCIDENT_CLOSED',
      actorName: req.user.name || 'Central Admin',
      department: 'CENTRAL_COMMAND',
      message: `Incident officially CLOSED. Closure summary: "${closureSummary.trim()}".${
        isOverride ? ` (Authorized Override: ${overrideReason})` : ''
      }`,
      timestamp: new Date(),
      isPublicToCitizen: true
    });

    incident.notes.push({
      authorName: req.user.name || 'Central Admin',
      authorRole: 'CENTRAL_ADMIN',
      text: `Official final incident closure executed. Debrief: ${closureSummary.trim()}`,
      createdAt: new Date()
    });

    await incident.save();

    await AuditLog.create({
      actorId: req.user.userId,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'INCIDENT_CLOSED',
      resource: 'Incident',
      resourceId: incident._id.toString(),
      details: {
        closureSummary,
        isOverride,
        overrideReason,
        requestsCount: requests.length
      }
    });

    // Broadcast closure to citizen and admin rooms
    try {
      const io = getIO();
      io.to(`incident:${incident._id}`).emit('incident:closed', {
        incidentId: incident._id,
        referenceId: incident.referenceId,
        closureDetails: incident.closureDetails,
        timeline: incident.timeline
      });
      io.to('dept:central_admin').emit('incident:updated', incident);
      io.emit('incident:status_changed', { incidentId: incident._id, status: 'CLOSED' });
    } catch (e) {}

    return res.status(200).json({
      success: true,
      message: 'Incident closed successfully. Operational debrief logged.',
      incident
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

