import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { User } from '../models/user.model.js';
import { Station } from '../models/station.model.js';
import { DepartmentUnit } from '../models/departmentUnit.model.js';
import { ResponseUnit } from '../models/responseUnit.model.js';
import { AuditLog } from '../models/audit.model.js';
import { sendSecurityEmail } from '../utils/mailer.js';

/**
 * 1. Fire Admin: Provision Firefighter/Rescue Staff (Model B - Strictly NO Public Signup)
 */
export const provisionFireStaff = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      officialServiceId,
      rank,
      specialization,
      stationId,
      unitId
    } = req.body;

    const fireOrgId = req.user.organizationId;
    if (!fireOrgId && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Only authorized Fire Administrators can provision fire staff.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'A staff member with this official email already exists.' });
    }

    // Generate unique Fire ID: FIRE-001, FIRE-002...
    const count = await User.countDocuments({ role: { $in: ['FIREFIGHTER', 'FIRE_COMMANDER', 'FIRE_TRUCK_DRIVER', 'RESCUE_TEAM_MEMBER'] } });
    const staffId = `FIRE-${String(count + 1).padStart(3, '0')}`;

    // Generate Single-Use Activation Token (hash stored)
    const rawActivationToken = crypto.randomBytes(32).toString('hex');
    const secret = process.env.HMAC_SECRET || 'resqone_activation_secret_pepper_2026';
    const activationTokenHash = crypto.createHmac('sha256', secret).update(rawActivationToken).digest('hex');

    const tempPass = crypto.randomBytes(16).toString('hex');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(tempPass, salt);

    const newUser = await User.create({
      name,
      email,
      phone,
      passwordHash,
      role: 'FIREFIGHTER',
      staffId,
      rankOrDesignation: rank || 'Leading Firefighter',
      specialty: specialization || 'HAZMAT & Foam Suppression',
      stationId,
      unitId,
      departmentType: 'FIRE_RESCUE',
      organizationId: fireOrgId,
      isVerified: true,
      status: 'PENDING_ACTIVATION',
      activationTokenHash,
      activationExpires: new Date(Date.now() + 48 * 60 * 60 * 1000)
    });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const activationLink = `${clientUrl}/activate-staff?token=${rawActivationToken}&email=${encodeURIComponent(email)}&staffId=${staffId}`;

    await sendSecurityEmail({
      to: email,
      subject: `Fire & Tactical Rescue ResQOne Account Provisioned: ${staffId}`,
      html: `
        <h2>Delhi Fire Service ResQOne Account Provisioning</h2>
        <p>Firefighter ${name},</p>
        <p>Your official ResQOne rescue terminal account has been created by your Fire Commander.</p>
        <p>Unique Fire Service ID: <strong>${staffId}</strong></p>
        <p>Rank / Role: <strong>${rank || 'Leading Firefighter'}</strong></p>
        <p>Click below to set your confidential password and activate your dispatch terminal:</p>
        <p><a href="${activationLink}" style="padding:10px 18px;background:#dc2626;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">Activate Fire Service Terminal</a></p>
      `
    });

    await AuditLog.create({
      actorId: req.user.userId,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'FIRE_STAFF_PROVISIONED',
      resource: 'User',
      resourceId: newUser._id.toString(),
      details: { staffId, officialServiceId, rank },
      ipAddress: req.ip
    });

    return res.status(201).json({
      success: true,
      message: `Fire service account provisioned successfully. Activation email dispatched to ${email}.`,
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
 * 2. Fire Admin: Get Fire Staff for THIS Organization Only
 */
export const getFireStaff = async (req, res) => {
  try {
    const orgId = req.user.organizationId;
    const filter = {
      departmentType: 'FIRE_RESCUE',
      role: { $in: ['FIREFIGHTER', 'FIRE_COMMANDER', 'FIRE_TRUCK_DRIVER', 'RESCUE_TEAM_MEMBER', 'FIRE_ADMIN'] }
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
 * 3. Fire Admin: Manage Fire Stations
 */
export const createFireStation = async (req, res) => {
  try {
    const { name, address, contactPhone, officerInChargeName, latitude, longitude } = req.body;
    const orgId = req.user.organizationId;

    const count = await Station.countDocuments({ departmentType: 'FIRE_RESCUE' });
    const stationId = `FIRE-STN-${String(count + 1).padStart(2, '0')}`;

    const station = await Station.create({
      stationId,
      name,
      departmentType: 'FIRE_RESCUE',
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

export const getFireStations = async (req, res) => {
  try {
    const orgId = req.user.organizationId;
    const filter = { departmentType: 'FIRE_RESCUE' };
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
 * 4. Fire Admin: Manage Fire Units & Rescue Teams
 */
export const createFireUnit = async (req, res) => {
  try {
    const { name, unitType, stationId, vehicleId, unitLeaderId, capabilities } = req.body;
    const orgId = req.user.organizationId;

    const count = await DepartmentUnit.countDocuments({ departmentType: 'FIRE_RESCUE' });
    const unitId = `FIRE-UNIT-${String(count + 1).padStart(3, '0')}`;

    const unit = await DepartmentUnit.create({
      unitId,
      name,
      departmentType: 'FIRE_RESCUE',
      unitType: unitType || 'WATER_TENDER_TEAM',
      organizationId: orgId,
      stationId,
      unitLeaderId,
      assignedVehicleId: vehicleId,
      capabilities: capabilities || ['HYDRAULIC_CUTTERS', 'FOAM_SUPPRESSION', 'RESCUE_LADDER']
    });

    return res.status(201).json({ success: true, unit });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getFireUnits = async (req, res) => {
  try {
    const orgId = req.user.organizationId;
    const filter = { departmentType: 'FIRE_RESCUE' };
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

