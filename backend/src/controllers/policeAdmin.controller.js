import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { User } from '../models/user.model.js';
import { Station } from '../models/station.model.js';
import { DepartmentUnit } from '../models/departmentUnit.model.js';
import { ResponseUnit } from '../models/responseUnit.model.js';
import { AuditLog } from '../models/audit.model.js';
import { sendSecurityEmail } from '../utils/mailer.js';

/**
 * 1. Police Admin: Provision Police Staff Account (Model B - Strictly NO Public Signup)
 */
export const provisionPoliceStaff = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      officialServiceId,
      rank,
      stationId,
      unitId,
      dutyShift
    } = req.body;

    const policeOrgId = req.user.organizationId;
    if (!policeOrgId && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Only authorized Police Administrators can provision police staff.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'A staff member with this official email already exists.' });
    }

    // Generate unique Police ID: POL-001, POL-002...
    const count = await User.countDocuments({ role: { $in: ['POLICE_OFFICER', 'POLICE_DISPATCHER', 'TRAFFIC_OFFICER', 'PATROL_OFFICER'] } });
    const staffId = `POL-${String(count + 1).padStart(3, '0')}`;

    // Generate Single-Use Activation Token (hash stored)
    const rawActivationToken = crypto.randomBytes(32).toString('hex');
    const secret = process.env.HMAC_SECRET || 'resqone_activation_secret_pepper_2026';
    const activationTokenHash = crypto.createHmac('sha256', secret).update(rawActivationToken).digest('hex');

    // Default temporary hash until activated
    const tempPass = crypto.randomBytes(16).toString('hex');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(tempPass, salt);

    const newUser = await User.create({
      name,
      email,
      phone,
      passwordHash,
      role: 'POLICE_OFFICER',
      staffId,
      rankOrDesignation: rank || 'Police Officer',
      stationId,
      unitId,
      departmentType: 'POLICE',
      organizationId: policeOrgId,
      isVerified: true,
      status: 'PENDING_ACTIVATION',
      activationTokenHash,
      activationExpires: new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours for govt onboarding
    });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const activationLink = `${clientUrl}/activate-staff?token=${rawActivationToken}&email=${encodeURIComponent(email)}&staffId=${staffId}`;

    await sendSecurityEmail({
      to: email,
      subject: `Official Police ResQOne Account Provisioned: ${staffId}`,
      html: `
        <h2>Delhi Police ResQOne Staff Account Provisioning</h2>
        <p>Officer ${name},</p>
        <p>Your official ResQOne service account has been created by your Police Administrator.</p>
        <p>Unique Police ID: <strong>${staffId}</strong></p>
        <p>Rank / Designation: <strong>${rank || 'Police Officer'}</strong></p>
        <p>Click below to set your confidential password and activate your patrol terminal:</p>
        <p><a href="${activationLink}" style="padding:10px 18px;background:#4338ca;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">Activate Police Terminal</a></p>
      `
    });

    await AuditLog.create({
      actorId: req.user.userId,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'POLICE_STAFF_PROVISIONED',
      resource: 'User',
      resourceId: newUser._id.toString(),
      details: { staffId, officialServiceId, rank },
      ipAddress: req.ip
    });

    return res.status(201).json({
      success: true,
      message: `Police staff account successfully provisioned. Activation email dispatched to ${email}.`,
      staff: {
        id: newUser._id,
        staffId: newUser.staffId,
        name: newUser.name,
        rank: newUser.rankOrDesignation,
        email: newUser.email,
        activationLink
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 2. Police Admin: Get Police Staff for THIS Organization Only
 */
export const getPoliceStaff = async (req, res) => {
  try {
    const orgId = req.user.organizationId;
    const filter = {
      departmentType: 'POLICE',
      role: { $in: ['POLICE_OFFICER', 'POLICE_DISPATCHER', 'TRAFFIC_OFFICER', 'PATROL_OFFICER', 'POLICE_ADMIN'] }
    };

    if (req.user.role !== 'SUPER_ADMIN' && orgId) {
      filter.organizationId = orgId;
    }

    const staff = await User.find(filter).select('-passwordHash -activationTokenHash').sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: staff.length,
      staff
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 3. Police Admin: Manage Police Stations
 */
export const createPoliceStation = async (req, res) => {
  try {
    const { name, address, contactPhone, officerInChargeName, latitude, longitude } = req.body;
    const orgId = req.user.organizationId;

    const count = await Station.countDocuments({ departmentType: 'POLICE' });
    const stationId = `POL-STN-${String(count + 1).padStart(2, '0')}`;

    const station = await Station.create({
      stationId,
      name,
      departmentType: 'POLICE',
      organizationId: orgId,
      address,
      contactPhone,
      officerInChargeName,
      location: {
        type: 'Point',
        coordinates: [Number(longitude), Number(latitude)]
      }
    });

    return res.status(201).json({ success: true, station });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPoliceStations = async (req, res) => {
  try {
    const orgId = req.user.organizationId;
    const filter = { departmentType: 'POLICE' };
    if (req.user.role !== 'SUPER_ADMIN' && orgId) {
      filter.organizationId = orgId;
    }

    const stations = await Station.find(filter);
    return res.status(200).json({ success: true, count: stations.length, stations });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 4. Police Admin: Manage Police Units (Patrol Unit 1, Traffic Squad, etc.)
 */
export const createPoliceUnit = async (req, res) => {
  try {
    const { name, unitType, stationId, vehicleId, unitLeaderId, capabilities } = req.body;
    const orgId = req.user.organizationId;

    const count = await DepartmentUnit.countDocuments({ departmentType: 'POLICE' });
    const unitId = `POL-UNIT-${String(count + 1).padStart(3, '0')}`;

    const unit = await DepartmentUnit.create({
      unitId,
      name,
      departmentType: 'POLICE',
      unitType: unitType || 'PATROL_UNIT',
      organizationId: orgId,
      stationId,
      unitLeaderId,
      assignedVehicleId: vehicleId,
      capabilities: capabilities || ['CROWD_CONTROL', 'FIRST_AID', 'TRAFFIC_MANAGEMENT']
    });

    return res.status(201).json({ success: true, unit });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPoliceUnits = async (req, res) => {
  try {
    const orgId = req.user.organizationId;
    const filter = { departmentType: 'POLICE' };
    if (req.user.role !== 'SUPER_ADMIN' && orgId) {
      filter.organizationId = orgId;
    }

    const units = await DepartmentUnit.find(filter)
      .populate('stationId', 'name address')
      .populate('assignedVehicleId', 'unitIdentifier vehicleType status currentLocation');

    return res.status(200).json({ success: true, count: units.length, units });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

