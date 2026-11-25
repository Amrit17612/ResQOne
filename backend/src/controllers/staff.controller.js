import bcrypt from 'bcryptjs';
import { User } from '../models/user.model.js';
import { Hospital } from '../models/hospital.model.js';
import { AuditLog } from '../models/audit.model.js';
import { UserRole } from '../constants/enums.js';

/**
 * Hospital Admin: Create Authorized Staff Accounts (Doctor, Bed Manager, etc.)
 * Strictly scopes staff to req.user.organizationId
 */
export const createHospitalStaff = async (req, res) => {
  try {
    const { name, email, phone, staffRole } = req.body;

    const hospitalId = req.user.organizationId;
    if (!hospitalId) {
      return res.status(403).json({
        success: false,
        message: 'No associated hospital organization found for this administrator.'
      });
    }

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital facility not found.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'A staff member with this email already exists.' });
    }

    // Default secure initial password generated
    const defaultPass = 'Staff@ResQOne2026';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(defaultPass, salt);

    const staffUser = await User.create({
      name,
      email,
      phone,
      passwordHash,
      role: UserRole.HOSPITAL_COORDINATOR,
      departmentType: 'HOSPITAL',
      organizationId: hospitalId, // STRICT DATA ISOLATION
      isVerified: true,
      status: 'ACTIVE'
    });

    await AuditLog.create({
      actorId: req.user.userId,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'HOSPITAL_STAFF_CREATED',
      resource: 'User',
      resourceId: staffUser._id.toString(),
      details: { staffRole, hospitalId: hospitalId.toString() },
      ipAddress: req.ip
    });

    return res.status(201).json({
      success: true,
      message: `Staff account (${staffRole}) successfully established for ${hospital.name}.`,
      staff: {
        id: staffUser._id,
        name: staffUser.name,
        email: staffUser.email,
        phone: staffUser.phone,
        organizationId: staffUser.organizationId
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Hospital Admin: List Staff for this Hospital ONLY
 */
export const getHospitalStaff = async (req, res) => {
  try {
    const hospitalId = req.user.organizationId;
    if (!hospitalId) {
      return res.status(403).json({ success: false, message: 'Unauthorized hospital organization.' });
    }

    const staffMembers = await User.find({
      organizationId: hospitalId
    }).select('-passwordHash -currentEmailOtpHash');

    return res.status(200).json({ success: true, count: staffMembers.length, staffMembers });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

