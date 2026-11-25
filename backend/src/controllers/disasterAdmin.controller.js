import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { User } from '../models/user.model.js';
import { Station } from '../models/station.model.js';
import { DepartmentUnit } from '../models/departmentUnit.model.js';
import { ResponseUnit } from '../models/responseUnit.model.js';
import { AuditLog } from '../models/audit.model.js';
import { sendSecurityEmail } from '../utils/mailer.js';

/**
 * 1. Disaster Admin: Provision Disaster Management Staff (Strictly Model B - No Public Signup)
 */
export const provisionDisasterStaff = async (req, res) => {
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

    const disasterOrgId = req.user.organizationId;
    if (!disasterOrgId && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Only authorized Disaster Administrators can provision disaster staff.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'A staff member with this official email already exists.' });
    }

    const count = await User.countDocuments({ role: { $in: ['DISASTER_OFFICER'] } });
    const staffId = `DIS-${String(count + 1).padStart(3, '0')}`;

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
      role: 'DISASTER_OFFICER',
      staffId,
      rankOrDesignation: rank || 'Disaster Response Specialist',
      specialty: specialization || 'Flood & Earthquake Tactical Rescue',
      stationId,
      unitId,
      departmentType: 'DISASTER_MANAGEMENT',
      organizationId: disasterOrgId,
      isVerified: true,
      status: 'PENDING_ACTIVATION',
      activationTokenHash,
      activationExpires: new Date(Date.now() + 48 * 60 * 60 * 1000)
    });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const activationLink = `${clientUrl}/activate-staff?token=${rawActivationToken}&email=${encodeURIComponent(email)}&staffId=${staffId}`;

    await sendSecurityEmail({
      to: email,
      subject: `Disaster Response Authority ResQOne Account Provisioned: ${staffId}`,
      html: `
        <h2>Disaster Management Response Network Provisioning</h2>
        <p>Specialist ${name},</p>
        <p>Your official ResQOne disaster response account has been created by your Disaster Authority Administrator.</p>
        <p>Unique Disaster Staff ID: <strong>${staffId}</strong></p>
        <p>Role: <strong>${rank || 'Disaster Response Specialist'}</strong></p>
        <p>Click below to set your confidential password and activate your terminal:</p>
        <p><a href="${activationLink}" style="padding:10px 18px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">Activate Disaster Response Terminal</a></p>
      `
    });

    await AuditLog.create({
      actorId: req.user.userId,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'DISASTER_STAFF_PROVISIONED',
      resource: 'User',
      resourceId: newUser._id.toString(),
      details: { staffId, officialServiceId, rank },
      ipAddress: req.ip
    });

    return res.status(201).json({
      success: true,
      message: `Disaster specialist account provisioned successfully. Activation email dispatched to ${email}.`,
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
 * 2. Disaster Admin: Get Disaster Staff for this Organization
 */
export const getDisasterStaff = async (req, res) => {
  try {
    const orgId = req.user.organizationId;
    const filter = {
      departmentType: 'DISASTER_MANAGEMENT',
      role: { $in: ['DISASTER_OFFICER', 'DISASTER_ADMIN'] }
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
 * 3. Disaster Admin: Create Response Centres & Units
 */
export const createDisasterUnit = async (req, res) => {
  try {
    const { name, unitType, capabilities } = req.body;
    const orgId = req.user.organizationId;

    const count = await DepartmentUnit.countDocuments({ departmentType: 'DISASTER_MANAGEMENT' });
    const unitId = `DIS-UNIT-${String(count + 1).padStart(3, '0')}`;

    const unit = await DepartmentUnit.create({
      unitId,
      name,
      departmentType: 'DISASTER_MANAGEMENT',
      unitType: unitType || 'FLOOD_RESCUE_TEAM',
      organizationId: orgId,
      capabilities: capabilities || ['FLOOD_RESCUE_BOAT', 'CANINE_SEARCH', 'EARTHQUAKE_SHORING']
    });

    return res.status(201).json({ success: true, unit });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getDisasterUnits = async (req, res) => {
  try {
    const orgId = req.user.organizationId;
    const filter = { departmentType: 'DISASTER_MANAGEMENT' };
    if (req.user.role !== 'SUPER_ADMIN' && orgId) {
      filter.organizationId = orgId;
    }

    const units = await DepartmentUnit.find(filter);
    return res.status(200).json({ success: true, count: units.length, units });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

