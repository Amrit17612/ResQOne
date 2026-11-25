import { DepartmentEmergencyRequest, EmergencyRequestStatus } from '../models/departmentEmergencyRequest.model.js';
import { OrganizationApplication } from '../models/organizationApplication.model.js';
import { Incident } from '../models/incident.model.js';
import { AuditLog } from '../models/audit.model.js';
import { sendSecurityEmail } from '../utils/mailer.js';
import { getIO } from '../events/socket.js';

/**
 * Deterministic Rule-Based Department Routing Matrix
 * (Zero AI/ML - 100% Rules-Based Safety Guarantee)
 */
export const ROUTING_RULES = {
  ROAD_ACCIDENT: {
    primaryDepartments: ['POLICE', 'AMBULANCE'],
    conditionalDepartments: (incident) => (incident.priority === 'CRITICAL' ? ['FIRE_RESCUE'] : []),
    supportOrganizations: []
  },
  FIRE: {
    primaryDepartments: ['FIRE_RESCUE'],
    conditionalDepartments: (incident) =>
      incident.priority === 'CRITICAL' ? ['POLICE', 'AMBULANCE'] : ['POLICE'],
    supportOrganizations: (incident) => {
      // Large-scale / critical fire or building/industrial fire warrants relief and shelter support
      if (
        incident.priority === 'CRITICAL' ||
        incident.subcategory === 'INDUSTRIAL_FIRE' ||
        incident.subcategory === 'BUILDING_FIRE'
      ) {
        return ['NGO', 'SHELTER'];
      }
      return [];
    }
  },
  RESCUE_REQUEST: {
    primaryDepartments: ['FIRE_RESCUE', 'DISASTER_MANAGEMENT'],
    conditionalDepartments: (incident) => {
      if (incident.subcategory === 'WATER_RESCUE') {
        return ['AMBULANCE', 'POLICE'];
      }
      if (incident.priority === 'CRITICAL') {
        return ['AMBULANCE', 'POLICE'];
      }
      return ['POLICE'];
    },
    supportOrganizations: (incident) => (incident.priority === 'CRITICAL' ? ['SHELTER'] : [])
  },
  NATURAL_DISASTER: {
    primaryDepartments: ['DISASTER_MANAGEMENT', 'FIRE_RESCUE', 'POLICE', 'AMBULANCE'],
    conditionalDepartments: () => [],
    supportOrganizations: ['NGO', 'SHELTER']
  },
  BUILDING_COLLAPSE: {
    primaryDepartments: ['FIRE_RESCUE', 'DISASTER_MANAGEMENT', 'POLICE', 'AMBULANCE'],
    conditionalDepartments: () => [],
    supportOrganizations: ['SHELTER', 'NGO']
  },
  FLOOD: {
    primaryDepartments: ['DISASTER_MANAGEMENT', 'POLICE', 'FIRE_RESCUE', 'AMBULANCE'],
    conditionalDepartments: () => [],
    supportOrganizations: ['NGO', 'SHELTER']
  },
  LANDSLIDE: {
    primaryDepartments: ['DISASTER_MANAGEMENT', 'FIRE_RESCUE', 'POLICE', 'AMBULANCE'],
    conditionalDepartments: () => [],
    supportOrganizations: ['SHELTER']
  },
  EARTHQUAKE: {
    primaryDepartments: ['DISASTER_MANAGEMENT', 'FIRE_RESCUE', 'POLICE', 'AMBULANCE'],
    conditionalDepartments: () => [],
    supportOrganizations: ['NGO', 'SHELTER']
  },
  CYCLONE: {
    primaryDepartments: ['DISASTER_MANAGEMENT', 'POLICE', 'FIRE_RESCUE', 'AMBULANCE'],
    conditionalDepartments: () => [],
    supportOrganizations: ['NGO', 'SHELTER']
  },
  CLOUDBURST: {
    primaryDepartments: ['DISASTER_MANAGEMENT', 'POLICE', 'FIRE_RESCUE', 'AMBULANCE'],
    conditionalDepartments: () => [],
    supportOrganizations: ['SHELTER', 'NGO']
  },
  MEDICAL_EMERGENCY: {
    primaryDepartments: ['AMBULANCE'],
    conditionalDepartments: () => [],
    supportOrganizations: []
  },
  CRIME: {
    primaryDepartments: ['POLICE'],
    conditionalDepartments: (incident) => (incident.priority === 'CRITICAL' ? ['AMBULANCE'] : []),
    supportOrganizations: []
  },
  EVACUATION_REQUIRED: {
    primaryDepartments: ['DISASTER_MANAGEMENT', 'POLICE'],
    conditionalDepartments: () => [],
    supportOrganizations: ['SHELTER']
  },
  RELIEF_REQUIRED: {
    primaryDepartments: ['DISASTER_MANAGEMENT'],
    conditionalDepartments: () => [],
    supportOrganizations: ['NGO', 'SHELTER']
  },
  OTHER: {
    primaryDepartments: ['POLICE'],
    conditionalDepartments: () => [],
    supportOrganizations: []
  }
};

/**
 * Auto-Evaluate and Route Approved Incident to Eligible Departments & Support Orgs
 */
export const routeApprovedIncident = async (incidentId, authorizedUser = null) => {
  try {
    const incident = await Incident.findById(incidentId);
    if (!incident) throw new Error('Incident not found for automatic routing');

    const catKey = incident.category || 'OTHER';
    const rule = ROUTING_RULES[catKey] || ROUTING_RULES.OTHER;

    // Collect all departments matching deterministic rule
    const primaryDepts = rule.primaryDepartments || [];
    const conditionalDepts = rule.conditionalDepartments ? rule.conditionalDepartments(incident) : [];
    const supportOrgs = typeof rule.supportOrganizations === 'function'
      ? rule.supportOrganizations(incident)
      : (rule.supportOrganizations || []);

    const allTargetDepts = Array.from(new Set([...primaryDepts, ...conditionalDepts]));
    const allSupportTypes = Array.from(new Set(supportOrgs));

    const combinedList = [...allTargetDepts, ...allSupportTypes];
    incident.assignedDepartments = combinedList;

    // Add routing note & timeline
    incident.notes.push({
      authorName: authorizedUser?.name || 'Deterministic Routing Engine',
      authorRole: 'AUTOMATIC_ROUTING',
      text: `Automatic rule evaluation complete for ${catKey} (${incident.priority}). Routed to: ${combinedList.join(', ')}.`,
      createdAt: new Date()
    });

    incident.timeline.push({
      stage: 'DEPARTMENT_ASSIGNED',
      actorName: 'Automatic Routing Engine',
      department: 'MULTI_AGENCY',
      message: `Emergency requests automatically generated and dispatched to: ${combinedList.join(', ')}.`,
      timestamp: new Date(),
      isPublicToCitizen: true
    });

    await incident.save();

    // Create DepartmentEmergencyRequest records for each identified department with strict idempotency
    const createdRequests = [];

    for (const deptType of allTargetDepts) {
      const idempotencyKey = `REQ_${incident._id}_${deptType}`;

      // Check if request already exists for this incident and department
      let emergencyReq = await DepartmentEmergencyRequest.findOne({ idempotencyKey });
      if (emergencyReq) {
        createdRequests.push(emergencyReq);
        continue;
      }

      const count = await DepartmentEmergencyRequest.countDocuments();
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const reqId = `REQ-${dateStr}-${String(count + 1).padStart(4, '0')}`;

      // Resolve eligible organizations in database covering this department
      let orgQueryType = deptType;
      if (deptType === 'AMBULANCE') orgQueryType = { $in: ['HOSPITAL', 'AMBULANCE_PROVIDER'] };
      if (deptType === 'FIRE_RESCUE') orgQueryType = 'FIRE_RESCUE';

      const eligibleOrg = await OrganizationApplication.findOne({
        organizationType: orgQueryType,
        status: { $in: ['APPROVED', 'SUCCESSFULLY_REGISTERED', 'ACTIVE'] }
      });

      try {
        emergencyReq = await DepartmentEmergencyRequest.create({
          idempotencyKey,
          requestId: reqId,
          incidentId: incident._id,
          referenceId: incident.referenceId,
          departmentType: deptType,
          organizationId: eligibleOrg?._id,
          organizationName: eligibleOrg?.organizationName || `${deptType} Regional Command`,
          priority: incident.priority,
          category: incident.category,
          title: incident.title,
          description: incident.description,
          location: {
            type: 'Point',
            coordinates: incident.location.coordinates,
            address: incident.location.address
          },
          centralAdminInstructions: `Automatic priority dispatch. Acknowledge and deploy units to ${incident.location.address}.`,
          status: EmergencyRequestStatus.NOTIFIED
        });
        createdRequests.push(emergencyReq);
      } catch (dupErr) {
        if (dupErr.code === 11000) {
          emergencyReq = await DepartmentEmergencyRequest.findOne({ idempotencyKey });
          if (emergencyReq) createdRequests.push(emergencyReq);
        } else {
          throw dupErr;
        }
      }

      // Send operational email notification to organization official email if configured
      if (eligibleOrg?.officialEmail) {
        sendSecurityEmail({
          to: eligibleOrg.officialEmail,
          subject: `EMERGENCY ALERT [${incident.priority}]: ${incident.referenceId} - ${incident.title}`,
          html: `
            <h2>ResQOne Priority Emergency Request</h2>
            <p><strong>Department:</strong> ${deptType}</p>
            <p><strong>Incident Reference:</strong> ${incident.referenceId}</p>
            <p><strong>Category:</strong> ${incident.category} (${incident.priority})</p>
            <p><strong>Location:</strong> ${incident.location.address}</p>
            <p><strong>Description:</strong> ${incident.description}</p>
            <p>Please log in to your department administration terminal to accept the request and dispatch response units.</p>
          `
        }).catch(() => {});
      }
    }

    // Generate Support Requests for NGOs & Shelters when applicable with strict idempotency
    for (const supType of allSupportTypes) {
      const idempotencyKey = `SUP_${incident._id}_${supType}`;

      let supReq = await DepartmentEmergencyRequest.findOne({ idempotencyKey });
      if (supReq) {
        createdRequests.push(supReq);
        continue;
      }

      const count = await DepartmentEmergencyRequest.countDocuments();
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const reqId = `SUP-${dateStr}-${String(count + 1).padStart(4, '0')}`;

      let orgQueryType = 'DISASTER_RELIEF_NGO';
      if (supType === 'SHELTER') orgQueryType = { $in: ['SHELTER_PROVIDER', 'SHELTER'] };

      const eligibleSupport = await OrganizationApplication.findOne({
        organizationType: orgQueryType,
        status: { $in: ['APPROVED', 'SUCCESSFULLY_REGISTERED', 'ACTIVE'] }
      });

      try {
        supReq = await DepartmentEmergencyRequest.create({
          idempotencyKey,
          requestId: reqId,
          incidentId: incident._id,
          referenceId: incident.referenceId,
          departmentType: supType,
          organizationId: eligibleSupport?._id,
          organizationName: eligibleSupport?.organizationName || `${supType} Relief Network`,
          priority: incident.priority,
          category: incident.category,
          title: `Relief/Evacuation Support: ${incident.title}`,
          description: `Support assistance requested for ${incident.category} disaster.`,
          location: {
            type: 'Point',
            coordinates: incident.location.coordinates,
            address: incident.location.address
          },
          reliefSuppliesRequested: ['DRINKING_WATER', 'FOOD_PACKETS', 'BLANKETS', 'FIRST_AID_KITS'],
          evacuationCountRequired: incident.priority === 'CRITICAL' ? 50 : 20,
          status: EmergencyRequestStatus.NOTIFIED
        });
        createdRequests.push(supReq);
      } catch (dupErr) {
        if (dupErr.code === 11000) {
          supReq = await DepartmentEmergencyRequest.findOne({ idempotencyKey });
          if (supReq) createdRequests.push(supReq);
        } else {
          throw dupErr;
        }
      }
    }

    // Broadcast over authorized Socket.IO rooms
    try {
      const io = getIO();
      // Notify each department room
      allTargetDepts.forEach((dept) => {
        io.to(`dept:${dept.toLowerCase()}`).emit('emergency:request_created', {
          incidentId: incident._id,
          referenceId: incident.referenceId,
          departmentType: dept,
          priority: incident.priority,
          location: incident.location
        });
      });

      // Notify citizen tracking room
      io.to(`incident:${incident._id}`).emit('incident:timeline_updated', {
        incidentId: incident._id,
        timeline: incident.timeline,
        assignedDepartments: combinedList
      });

      // Notify central admin
      io.to('dept:central_admin').emit('incident:routed', {
        incidentId: incident._id,
        referenceId: incident.referenceId,
        assignedDepartments: combinedList
      });
    } catch (e) {}

    await AuditLog.create({
      actorName: authorizedUser?.name || 'RoutingEngine',
      actorRole: authorizedUser?.role || 'SYSTEM',
      action: 'AUTOMATIC_DEPARTMENT_ROUTING_EXECUTED',
      resource: 'Incident',
      resourceId: incident._id.toString(),
      details: {
        category: catKey,
        assignedDepartments: combinedList,
        requestsCreated: createdRequests.length
      }
    });

    return {
      success: true,
      incident,
      assignedDepartments: combinedList,
      requestsCreated: createdRequests
    };
  } catch (error) {
    console.error('[ResQOne Routing Engine Error]', error);
    throw error;
  }
};

