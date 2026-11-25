import { User } from '../models/user.model.js';
import { VolunteerTask } from '../models/volunteer.model.js';
import { DepartmentEmergencyRequest } from '../models/departmentEmergencyRequest.model.js';
import { AuditLog } from '../models/audit.model.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { sendSecurityEmail } from '../utils/mailer.js';

/**
 * 1. Register / Provision NGO Staff or Volunteers
 */
export const provisionNgoVolunteer = async (req, res) => {
  try {
    const { name, email, phone, role, skills } = req.body;
    const ngoOrgId = req.user.organizationId;

    if (!ngoOrgId && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Forbidden. NGO admin privileges required.' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Volunteer or Staff already registered with this email.' });
    }

    const count = await User.countDocuments({ departmentType: 'NGO' });
    const staffId = `NGO-VOL-${String(count + 1).padStart(3, '0')}`;

    const rawActivationToken = crypto.randomBytes(32).toString('hex');
    const secret = process.env.HMAC_SECRET || 'resqone_activation_secret_pepper_2026';
    const activationTokenHash = crypto.createHmac('sha256', secret).update(rawActivationToken).digest('hex');

    const tempPass = crypto.randomBytes(16).toString('hex');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(tempPass, salt);

    const assignedRole = role === 'NGO_ADMIN' ? 'NGO_ADMIN' : 'VOLUNTEER';

    const newUser = await User.create({
      name,
      email,
      phone,
      passwordHash,
      role: assignedRole,
      staffId,
      specialty: Array.isArray(skills) ? skills.join(', ') : skills || 'General Relief & Food Distribution',
      departmentType: 'NGO',
      organizationId: ngoOrgId,
      isVerified: true,
      status: 'PENDING_ACTIVATION',
      activationTokenHash,
      activationExpires: new Date(Date.now() + 48 * 60 * 60 * 1000)
    });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const activationLink = `${clientUrl}/activate-staff?token=${rawActivationToken}&email=${encodeURIComponent(email)}&staffId=${staffId}`;

    await sendSecurityEmail({
      to: email,
      subject: `ResQOne Relief Volunteer Account: ${staffId}`,
      html: `
        <h2>NGO Relief Taskforce Onboarding</h2>
        <p>Dear ${name},</p>
        <p>You have been enrolled in the ResQOne NGO Disaster Relief volunteer network.</p>
        <p>Volunteer Identification: <strong>${staffId}</strong></p>
        <p><a href="${activationLink}">Click here to activate your account and set password.</a></p>
      `
    });

    return res.status(201).json({
      success: true,
      message: 'NGO team member provisioned successfully.',
      volunteer: {
        id: newUser._id,
        staffId: newUser.staffId,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        activationLink
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 2. Get NGO Team Members / Volunteers
 */
export const getNgoVolunteers = async (req, res) => {
  try {
    const orgId = req.user.organizationId;
    const filter = {
      $or: [
        { departmentType: 'NGO' },
        { departmentType: 'DISASTER_RELIEF_NGO' },
        { role: 'VOLUNTEER' }
      ]
    };

    if (req.user.role !== 'SUPER_ADMIN' && orgId) {
      filter.organizationId = orgId;
    }

    const volunteers = await User.find(filter).select('-passwordHash -activationTokenHash').sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: volunteers.length, volunteers });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 3. Create Volunteer Relief Task
 */
export const createVolunteerTask = async (req, res) => {
  try {
    const { title, description, requiredSkills, coordinates, address, urgency, incidentId } = req.body;
    const task = await VolunteerTask.create({
      title,
      description,
      requiredSkills: requiredSkills || ['Food Distribution', 'First Aid'],
      location: {
        type: 'Point',
        coordinates: coordinates || [77.2210, 28.5420],
        address: address || 'Disaster Relief Distribution Zone'
      },
      urgency: urgency || 'HIGH',
      incidentId
    });

    return res.status(201).json({ success: true, task });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 4. Get NGO Relief Tasks
 */
export const getNgoTasks = async (req, res) => {
  try {
    const tasks = await VolunteerTask.find().populate('assignedVolunteerId', 'name phone email').sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 5. Assign Task to Volunteer
 */
export const assignVolunteerTask = async (req, res) => {
  try {
    const { volunteerId } = req.body;
    const volunteer = await User.findById(volunteerId);
    if (!volunteer) return res.status(404).json({ success: false, message: 'Volunteer not found' });

    const task = await VolunteerTask.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    task.assignedVolunteerId = volunteer._id;
    task.assignedVolunteerName = volunteer.name;
    task.status = 'ASSIGNED';
    await task.save();

    return res.status(200).json({ success: true, message: 'Task assigned to volunteer', task });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

