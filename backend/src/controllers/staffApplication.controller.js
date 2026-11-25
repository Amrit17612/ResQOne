import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { StaffApplication, StaffApplicationStatus } from '../models/staffApplication.model.js';
import { OrganizationApplication } from '../models/organizationApplication.model.js';
import { User } from '../models/user.model.js';
import { AuditLog } from '../models/audit.model.js';
import { generateSecureOTP, hashOTPWithPepper, verifyOTPWithPepper } from '../utils/secureOtp.js';
import { sendSecurityEmail } from '../utils/mailer.js';
import { getIO } from '../events/socket.js';

/**
 * 1. Discover Eligible Organizations for Staff Registration
 * Only returns organizations where status = APPROVED and operational is active
 */
export const getEligibleOrganizations = async (req, res) => {
  try {
    const { role } = req.query;

    const filter = {
      status: {
        $in: [
          'APPROVED',
          'SUCCESSFULLY_REGISTERED',
          'ACTIVE',
          'ACTIVATION_PENDING',
          'CREDENTIALS_SENT'
        ]
      }
    };

    if (role) {
      if (['DOCTOR', 'AMBULANCE_DRIVER', 'NURSE', 'BED_MANAGER', 'HOSPITAL_EMERGENCY_COORDINATOR', 'OTHER_HOSPITAL_STAFF'].includes(role)) {
        filter.organizationType = 'HOSPITAL';
      } else if (role === 'VOLUNTEER') {
        filter.organizationType = { $in: ['DISASTER_RELIEF_NGO', 'SHELTER_PROVIDER', 'HOSPITAL'] };
      }
    }

    const orgs = await OrganizationApplication.find(filter)
      .select('_id organizationName organizationType address location state district city')
      .lean();

    return res.status(200).json({
      success: true,
      count: orgs.length,
      organizations: orgs
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 2. Submit Hospital Staff Application (Model A) or Volunteer (Model C)
 * Public applicant selects an approved Hospital -> Routes strictly to that Hospital
 */
export const submitStaffApplication = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      address,
      requestedRole,
      organizationId,
      qualifications,
      relevantExperience,
      professionalRegistrationNumber,
      specialty,
      drivingLicenseNumber,
      licenseValidity,
      vehicleCategory,
      supportingDocumentUrl
    } = req.body;

    // Disallow Police and Fire government roles from public signup!
    if (['POLICE_OFFICER', 'FIREFIGHTER', 'FIRE_TRUCK_DRIVER', 'POLICE_DISPATCHER', 'FIRE_COMMANDER'].includes(requestedRole)) {
      return res.status(403).json({
        success: false,
        message: 'Police and Fire personnel accounts cannot be created via public registration. Government accounts must be provisioned directly by an authorized Department Administrator.'
      });
    }

    // Verify Organization exists and is APPROVED
    const organization = await OrganizationApplication.findById(organizationId);
    if (!organization) {
      return res.status(404).json({ success: false, message: 'Selected organization not found.' });
    }

    if (organization.status !== 'APPROVED') {
      return res.status(400).json({
        success: false,
        message: 'Applications can only be submitted to fully approved and active organizations.'
      });
    }

    // Check duplicate application
    const existing = await StaffApplication.findOne({
      email,
      organizationId,
      status: { $nin: [StaffApplicationStatus.REJECTED, StaffApplicationStatus.WITHDRAWN, StaffApplicationStatus.EXPIRED] }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An active application with this email already exists for the selected organization.'
      });
    }

    // Generate unique Application ID: STAFF-YYYYMMDD-XXXX
    const count = await StaffApplication.countDocuments();
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const applicationId = `STAFF-${dateStr}-${String(count + 1).padStart(4, '0')}`;

    const newApplication = await StaffApplication.create({
      applicationId,
      fullName,
      email,
      phone,
      address,
      requestedRole,
      organizationId: organization._id,
      organizationName: organization.organizationName,
      qualifications,
      relevantExperience,
      professionalRegistrationNumber,
      specialty,
      drivingLicenseNumber,
      licenseValidity: licenseValidity ? new Date(licenseValidity) : undefined,
      vehicleCategory,
      supportingDocumentUrl: supportingDocumentUrl || 'Uploaded Document Reference Stored',
      status: StaffApplicationStatus.APPLICATION_SUBMITTED,
      statusHistory: [
        {
          status: StaffApplicationStatus.APPLICATION_SUBMITTED,
          note: `Application submitted to ${organization.organizationName} for review.`,
          updatedBy: fullName,
          updatedAt: new Date()
        }
      ]
    });

    // Notify Hospital Admin via Socket.IO room for this organization ONLY
    try {
      const io = getIO();
      io.to(`org:${organization._id}`).emit('staff:application_submitted', {
        applicationId: newApplication.applicationId,
        fullName: newApplication.fullName,
        requestedRole: newApplication.requestedRole,
        organizationName: organization.organizationName
      });
    } catch (e) {}

    // Send confirmation email
    await sendSecurityEmail({
      to: email,
      subject: `ResQOne Application Submitted: ${applicationId}`,
      html: `
        <h2>Application Received for ${organization.organizationName}</h2>
        <p>Dear ${fullName},</p>
        <p>Your application for the role of <strong>${requestedRole}</strong> has been transmitted directly to the Administrator of <strong>${organization.organizationName}</strong>.</p>
        <p>Your Application Reference ID: <strong>${applicationId}</strong></p>
        <p>You can track the progress of your application at any time using your Reference ID and Email OTP verification.</p>
      `
    });

    return res.status(201).json({
      success: true,
      message: `Application submitted successfully to ${organization.organizationName}. Hospital Admin will review credentials.`,
      applicationId: newApplication.applicationId,
      status: newApplication.status
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 3. Track Staff Application Status (With secure OTP)
 */
export const requestStaffTrackingOTP = async (req, res) => {
  try {
    const { applicationId, email } = req.body;

    const application = await StaffApplication.findOne({ applicationId, email: email?.toLowerCase().trim() });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application record not found with provided ID and email.' });
    }

    const rawOTP = generateSecureOTP();
    const otpHash = hashOTPWithPepper(rawOTP);

    application.trackingOtpHash = otpHash;
    application.trackingOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    application.trackingOtpAttempts = 0;
    await application.save();

    await sendSecurityEmail({
      to: application.email,
      subject: `Your ResQOne Staff Tracking OTP: ${rawOTP}`,
      html: `
        <h2>Staff Application Verification</h2>
        <p>Use OTP <strong>${rawOTP}</strong> to view the review status of application ${application.applicationId}.</p>
        <p>Valid for 10 minutes.</p>
      `
    });

    return res.status(200).json({
      success: true,
      message: 'Secure tracking verification OTP sent to registered email.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyStaffTrackingOTP = async (req, res) => {
  try {
    const { applicationId, email, otp } = req.body;

    const application = await StaffApplication.findOne({ applicationId, email: email?.toLowerCase().trim() });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application record not found.' });
    }

    if (!application.trackingOtpHash || !application.trackingOtpExpires) {
      return res.status(400).json({ success: false, message: 'No active OTP verification session found. Request a new OTP.' });
    }

    if (new Date() > application.trackingOtpExpires) {
      return res.status(400).json({ success: false, message: 'Tracking OTP has expired. Please request a new code.' });
    }

    const isValid = verifyOTPWithPepper(otp, application.trackingOtpHash);
    if (!isValid) {
      application.trackingOtpAttempts += 1;
      await application.save();
      return res.status(401).json({ success: false, message: 'Invalid verification OTP.' });
    }

    // Clear OTP after successful verification
    application.trackingOtpHash = undefined;
    application.trackingOtpExpires = undefined;
    await application.save();

    return res.status(200).json({
      success: true,
      application: {
        applicationId: application.applicationId,
        fullName: application.fullName,
        requestedRole: application.requestedRole,
        organizationName: application.organizationName,
        status: application.status,
        statusHistory: application.statusHistory,
        adminRemarks: application.adminRemarks,
        assignedStaffId: application.assignedStaffId,
        createdAt: application.createdAt,
        updatedAt: application.updatedAt
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 4. Hospital Admin: View Applications for THIS Organization ONLY (Strict Isolation)
 */
export const getOrganizationStaffApplications = async (req, res) => {
  try {
    const { organizationId } = req.params;

    // Enforce data isolation: Hospital Admin can only view their own organization's applications
    if (req.user.role !== 'SUPER_ADMIN' && req.user.organizationId?.toString() !== organizationId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are only authorized to review applications belonging to your own organization.'
      });
    }

    const { status, role } = req.query;
    const filter = { organizationId };

    if (status) filter.status = status;
    if (role) filter.requestedRole = role;

    const applications = await StaffApplication.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 5. Hospital Admin: Approve Staff Application & Generate Secure Activation Token
 */
export const approveStaffApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { adminRemarks } = req.body;

    const application = await StaffApplication.findOne({ applicationId });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    // Verify Admin belongs to this Hospital organization
    if (req.user.role !== 'SUPER_ADMIN' && req.user.organizationId?.toString() !== application.organizationId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You cannot approve applications for another hospital organization.'
      });
    }

    // Generate unique Staff ID based on role prefix (e.g. DRV-001, DOC-001, NUR-001, BED-001)
    let prefix = 'STF';
    if (application.requestedRole === 'AMBULANCE_DRIVER') prefix = 'DRV';
    else if (application.requestedRole === 'DOCTOR') prefix = 'DOC';
    else if (application.requestedRole === 'NURSE') prefix = 'NUR';
    else if (application.requestedRole === 'BED_MANAGER') prefix = 'BED';
    else if (application.requestedRole === 'VOLUNTEER') prefix = 'VOL';

    const existingCount = await User.countDocuments({ role: application.requestedRole });
    const assignedStaffId = `${prefix}-${String(existingCount + 1).padStart(3, '0')}`;

    // Cryptographic single-use activation token (30-min validity)
    const rawActivationToken = crypto.randomBytes(32).toString('hex');
    const secret = process.env.HMAC_SECRET || 'resqone_activation_secret_pepper_2026';
    const activationTokenHash = crypto.createHmac('sha256', secret).update(rawActivationToken).digest('hex');

    application.status = StaffApplicationStatus.APPROVED;
    application.assignedStaffId = assignedStaffId;
    application.activationTokenHash = activationTokenHash;
    application.activationExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    application.activationUsed = false;
    application.adminRemarks = adminRemarks || 'Application verified and approved by Hospital Admin.';
    application.statusHistory.push({
      status: StaffApplicationStatus.APPROVED,
      note: `Approved by ${req.user.name}. Generated Staff ID: ${assignedStaffId}`,
      updatedBy: req.user.name,
      updatedAt: new Date()
    });

    await application.save();

    // Send activation link to staff applicant email
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const activationLink = `${clientUrl}/activate-staff?token=${rawActivationToken}&appId=${application.applicationId}`;

    await sendSecurityEmail({
      to: application.email,
      subject: `ResQOne Account Approved: Set Your Password (${assignedStaffId})`,
      html: `
        <h2>Congratulations! Your application has been approved by ${application.organizationName}</h2>
        <p>Dear ${application.fullName},</p>
        <p>Your unique Staff ID: <strong>${assignedStaffId}</strong></p>
        <p>Role: <strong>${application.requestedRole}</strong></p>
        <p>Click the link below to set your password and activate your operational dashboard:</p>
        <p><a href="${activationLink}" style="padding:10px 18px;background:#059669;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">Set Password & Activate Dashboard</a></p>
        <p>This single-use link is valid for 30 minutes.</p>
      `
    });

    return res.status(200).json({
      success: true,
      message: `Application approved. Activation link dispatched to ${application.email}. Assigned Staff ID: ${assignedStaffId}`,
      assignedStaffId,
      activationLink // included for local testing preview
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 6. Hospital Admin: Reject Staff Application with Reason
 */
export const rejectStaffApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { rejectionReason } = req.body;

    const application = await StaffApplication.findOne({ applicationId });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    if (req.user.role !== 'SUPER_ADMIN' && req.user.organizationId?.toString() !== application.organizationId.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    application.status = StaffApplicationStatus.REJECTED;
    application.adminRemarks = rejectionReason || 'Qualifications or document verification did not meet hospital requirements.';
    application.statusHistory.push({
      status: StaffApplicationStatus.REJECTED,
      note: rejectionReason || 'Application rejected by Hospital Admin.',
      updatedBy: req.user.name,
      updatedAt: new Date()
    });

    await application.save();

    await sendSecurityEmail({
      to: application.email,
      subject: `ResQOne Application Update: ${application.applicationId}`,
      html: `
        <h2>Staff Application Status Update</h2>
        <p>Dear ${application.fullName},</p>
        <p>Your application for ${application.organizationName} has been reviewed. Status: <strong>REJECTED</strong>.</p>
        <p>Reason: ${application.adminRemarks}</p>
      `
    });

    return res.status(200).json({
      success: true,
      message: 'Staff application rejected successfully and applicant notified.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 7. Secure Staff Account Activation (Password Setup)
 */
export const activateStaffAccount = async (req, res) => {
  try {
    const { applicationId, token, newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
    }

    const application = await StaffApplication.findOne({ applicationId });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    if (application.activationUsed) {
      return res.status(400).json({ success: false, message: 'This activation token has already been used.' });
    }

    if (new Date() > application.activationExpires) {
      return res.status(400).json({ success: false, message: 'Activation token has expired. Request a new activation link.' });
    }

    // Verify token hash
    const secret = process.env.HMAC_SECRET || 'resqone_activation_secret_pepper_2026';
    const computedHash = crypto.createHmac('sha256', secret).update(token).digest('hex');

    const expectedBuffer = Buffer.from(application.activationTokenHash, 'hex');
    const actualBuffer = Buffer.from(computedHash, 'hex');

    if (expectedBuffer.length !== actualBuffer.length || !crypto.timingSafeEqual(expectedBuffer, actualBuffer)) {
      return res.status(401).json({ success: false, message: 'Invalid or tampered activation token.' });
    }

    // Hash password securely
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Create or activate User record with role
    let user = await User.findOne({ email: application.email });
    if (user) {
      user.passwordHash = passwordHash;
      user.role = application.requestedRole;
      user.staffId = application.assignedStaffId;
      user.organizationId = application.organizationId;
      user.status = 'ACTIVE';
      user.isVerified = true;
      await user.save();
    } else {
      user = await User.create({
        name: application.fullName,
        email: application.email,
        phone: application.phone,
        passwordHash,
        role: application.requestedRole,
        staffId: application.assignedStaffId,
        specialty: application.specialty,
        licenseNumber: application.drivingLicenseNumber,
        departmentType: 'HOSPITAL',
        organizationId: application.organizationId,
        isVerified: true,
        status: 'ACTIVE'
      });
    }

    // Invalidate activation token
    application.activationUsed = true;
    application.status = StaffApplicationStatus.ACCOUNT_ACTIVE;
    application.createdUserId = user._id;
    application.statusHistory.push({
      status: StaffApplicationStatus.ACCOUNT_ACTIVE,
      note: 'Master password set and account successfully activated.',
      updatedBy: application.fullName,
      updatedAt: new Date()
    });
    await application.save();

    await AuditLog.create({
      actorId: user._id,
      actorName: user.name,
      actorRole: user.role,
      action: 'STAFF_ACCOUNT_ACTIVATED',
      resource: 'User',
      resourceId: user._id.toString(),
      details: { staffId: application.assignedStaffId, organizationId: application.organizationId },
      ipAddress: req.ip
    });

    return res.status(200).json({
      success: true,
      message: 'Staff account successfully activated! You can now log in via Staff Login.',
      staffId: application.assignedStaffId,
      role: user.role
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

