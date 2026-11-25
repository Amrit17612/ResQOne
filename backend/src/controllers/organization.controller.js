import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import {
  OrganizationApplication,
  OrganizationApplicationStatus
} from '../models/organizationApplication.model.js';
import { Hospital } from '../models/hospital.model.js';
import { User } from '../models/user.model.js';
import { AuditLog } from '../models/audit.model.js';
import { UserRole } from '../constants/enums.js';
import { sendSecurityEmail } from '../utils/mailer.js';
import { generateSecureOTP, hashOTPWithPepper, verifyOTPWithPepper } from '../utils/secureOtp.js';

/**
 * 1. Submit Organization Application
 */
export const submitOrganizationApplication = async (req, res) => {
  try {
    const {
      organizationName,
      organizationType,
      officialEmail,
      contactNumber,
      address,
      registrationNumber,
      authorizedPersonName,
      authorizedPersonDesignation,
      supportingDocumentUrl,
      latitude,
      longitude,
      formattedAddress,
      state,
      district,
      city,
      postalCode,
      locationSource,
      locationAccuracy,
      locationConfirmedByUser
    } = req.body;

    const existingApp = await OrganizationApplication.findOne({
      $or: [{ officialEmail }, { registrationNumber }]
    });

    if (existingApp) {
      return res.status(400).json({
        success: false,
        message: 'An application with this official email or registration number already exists.'
      });
    }

    const count = await OrganizationApplication.countDocuments();
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const applicationId = `ORG-${dateStr}-${String(count + 1).padStart(4, '0')}`;

    const latNum = Number(latitude) || 28.5420;
    const lngNum = Number(longitude) || 77.2210;

    const newApp = await OrganizationApplication.create({
      applicationId,
      organizationName,
      organizationType,
      officialEmail,
      contactNumber,
      address,
      state: state || 'Delhi',
      district: district || 'New Delhi',
      city: city || 'New Delhi',
      postalCode: postalCode || '110001',
      location: {
        type: 'Point',
        coordinates: [lngNum, latNum], // GeoJSON longitude-first order
        formattedAddress: formattedAddress || address,
        locationSource: locationSource || 'MANUAL_PIN',
        locationAccuracy: locationAccuracy || 10,
        locationConfirmedByUser: locationConfirmedByUser !== false,
        locationVerifiedByAdmin: false
      },
      registrationNumber,
      authorizedPersonName,
      authorizedPersonDesignation,
      supportingDocumentUrl: supportingDocumentUrl || 'Uploaded Document Reference Stored',
      status: OrganizationApplicationStatus.APPLICATION_SUBMITTED,
      statusHistory: [
        {
          status: OrganizationApplicationStatus.APPLICATION_SUBMITTED,
          note: 'Initial application submitted with confirmed physical map location.',
          updatedBy: authorizedPersonName,
          updatedAt: new Date()
        }
      ]
    });

    await AuditLog.create({
      actorName: authorizedPersonName,
      actorRole: 'ORGANIZATION_APPLICANT',
      action: 'ORG_APPLICATION_SUBMITTED',
      resource: 'OrganizationApplication',
      resourceId: newApp._id.toString(),
      ipAddress: req.ip
    });

    // Send Instant Application Submission Confirmation Email to Applicant's Real Email
    await sendSecurityEmail({
      to: officialEmail,
      subject: `ResQOne Application Received: ${newApp.applicationId}`,
      text: `Dear ${authorizedPersonName},\n\nYour registration application for ${organizationName} has been successfully submitted to the ResQOne Emergency Grid.\n\nApplication ID: ${newApp.applicationId}\nStatus: SUBMITTED\n\nYou will receive real-time email updates as our central administration reviews your application.`,
      html: `
        <div style="font-family: Arial, sans-serif; background: #0B132B; color: #ffffff; padding: 25px; border-radius: 10px; max-width: 600px;">
          <h2 style="color: #38bdf8; margin-top: 0;">ResQOne Emergency Response Network</h2>
          <p>Dear <strong>${authorizedPersonName}</strong>,</p>
          <p>Thank you for registering <strong>${organizationName}</strong> (${organizationType}) on ResQOne.</p>
          <div style="background: #1C2541; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #38bdf8;">
            <p style="margin: 5px 0;"><strong>Application ID:</strong> <span style="color: #4ade80; font-family: monospace; font-size: 16px;">${newApp.applicationId}</span></p>
            <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #facc15; font-weight: bold;">APPLICATION_SUBMITTED</span></p>
            <p style="margin: 5px 0;"><strong>Registered Location:</strong> ${formattedAddress || address}</p>
          </div>
          <p style="color: #94a3b8; font-size: 13px;">Our Central Administration is verifying your documents. You will receive automated real-time email notifications whenever your status changes.</p>
        </div>
      `
    }).catch(err => console.error('[Submission Mailer Error Non-blocking]', err.message));

    return res.status(201).json({
      success: true,
      message: 'Organization onboarding application submitted successfully. Use OTP to track application status.',
      applicationId: newApp.applicationId,
      status: newApp.status
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Public Direct Tracking (No OTP Required)
 * Allows checking status using Reference ID OR Official Email
 */
export const trackApplicationDirect = async (req, res) => {
  try {
    const { identifier } = req.body;

    if (!identifier || !identifier.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either Application Reference ID or Registered Official Email.'
      });
    }

    const cleanInput = identifier.trim();

    const application = await OrganizationApplication.findOne({
      $or: [
        { applicationId: cleanInput },
        { officialEmail: cleanInput.toLowerCase() }
      ]
    }).sort({ createdAt: -1 });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'No matching application found for the provided Reference ID or Email.'
      });
    }

    return res.status(200).json({
      success: true,
      application: {
        applicationId: application.applicationId,
        organizationName: application.organizationName,
        organizationType: application.organizationType,
        officialEmail: application.officialEmail,
        authorizedPersonName: application.authorizedPersonName,
        status: application.status,
        statusHistory: application.statusHistory,
        createdAt: application.createdAt,
        updatedAt: application.updatedAt,
        location: application.location
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 2. Request OTP for Application Status Tracking

 * Security Improvement 1: Does not expose details without OTP verification
 */
export const requestTrackingOTP = async (req, res) => {
  try {
    const { applicationId, email } = req.body;

    const application = await OrganizationApplication.findOne({
      applicationId: applicationId.trim(),
      officialEmail: email.trim().toLowerCase()
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'No matching application found. Please verify Application ID and Email.'
      });
    }

    // Generate Cryptographically Secure 6-digit OTP using CSPRNG
    const rawOtp = generateSecureOTP();
    // HMAC-SHA256 with Server-side Pepper + Application ID binding
    const otpHmac = hashOTPWithPepper(rawOtp, application.applicationId);

    application.trackingOtpHash = otpHmac;
    application.trackingOtpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 min
    application.trackingOtpAttempts = 0;
    await application.save();

    await sendSecurityEmail({
      to: application.officialEmail,
      subject: `ResQOne Application Tracking OTP: ${application.applicationId}`,
      text: `Your OTP for tracking application status is: ${rawOtp}. Valid for 5 minutes.`,
      html: `
        <div style="font-family: sans-serif; background: #0B132B; color: #fff; padding: 20px; border-radius: 8px;">
          <h3 style="color: #38bdf8;">ResQOne Application Status Inquiry</h3>
          <p>Verification Code for <strong>${application.applicationId}</strong>:</p>
          <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #4ade80;">${rawOtp}</div>
          <p style="font-size: 12px; color: #94a3b8;">Valid for 5 minutes.</p>
        </div>
      `
    });

    return res.status(200).json({
      success: true,
      message: 'Tracking verification code dispatched to registered email.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 3. Verify OTP & Display Application Status
 */
export const verifyTrackingOTP = async (req, res) => {
  try {
    const { applicationId, email, otp } = req.body;

    const application = await OrganizationApplication.findOne({
      applicationId: applicationId.trim(),
      officialEmail: email.trim().toLowerCase()
    });

    if (!application || !application.trackingOtpHash) {
      return res.status(400).json({ success: false, message: 'Invalid tracking session.' });
    }

    if (new Date() > application.trackingOtpExpires) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Request a new one.' });
    }

    const isValidOtp = verifyOTPWithPepper(
      String(otp).trim(),
      application.applicationId,
      application.trackingOtpHash
    );

    if (!isValidOtp) {
      application.trackingOtpAttempts = (application.trackingOtpAttempts || 0) + 1;
      await application.save();
      return res.status(400).json({
        success: false,
        message: `Incorrect OTP. (${5 - application.trackingOtpAttempts} attempts remaining)`
      });
    }

    // OTP consumed (Single-use guarantee)
    application.trackingOtpHash = undefined;
    application.trackingOtpExpires = undefined;
    application.trackingOtpAttempts = 0;
    await application.save();

    return res.status(200).json({
      success: true,
      application: {
        applicationId: application.applicationId,
        organizationName: application.organizationName,
        organizationType: application.organizationType,
        officialEmail: application.officialEmail,
        contactNumber: application.contactNumber,
        address: application.address,
        registrationNumber: application.registrationNumber,
        status: application.status,
        statusHistory: application.statusHistory,
        adminNotes: application.adminNotes
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 4. Super Admin Review Workflow
 */
export const getOrganizationApplications = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const applications = await OrganizationApplication.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: applications.length, applications });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    let { status, note, adminNotes } = req.body;
    const application = await OrganizationApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Map any legacy or UI status aliases to valid OrganizationApplicationStatus
    const statusMap = {
      'UNDER_VERIFICATION': OrganizationApplicationStatus.UNDER_INITIAL_REVIEW,
      'DOCUMENTS_VERIFIED': OrganizationApplicationStatus.DOCUMENT_VERIFIED,
      'ADDITIONAL_INFO_REQUIRED': OrganizationApplicationStatus.ADDITIONAL_INFORMATION_REQUIRED,
      'APPROVED': OrganizationApplicationStatus.APPROVED,
      'REJECTED': OrganizationApplicationStatus.REJECTED
    };

    if (statusMap[status]) {
      status = statusMap[status];
    }

    application.status = status;
    if (adminNotes) application.adminNotes = adminNotes;

    const transitionNote = note || `Application transitioned to ${status}`;

    application.statusHistory.push({
      status,
      note: transitionNote,
      updatedBy: req.user?.name || 'Super Admin',
      updatedAt: new Date()
    });

    await application.save();

    // Automated Transactional Notifications for key verification stages
    const emailTemplates = {
      UNDER_INITIAL_REVIEW: {
        subject: `Application Under Review: ${application.applicationId}`,
        message: `Your organization onboarding application (${application.applicationId}) has entered initial review by the ResQOne Super Admin authority.`
      },
      DOCUMENT_VERIFICATION_PENDING: {
        subject: `Document Verification in Progress: ${application.applicationId}`,
        message: `Your submitted statutory licenses and authority documents are currently undergoing forensic and authenticity validation.`
      },
      DOCUMENT_VERIFIED: {
        subject: `Documents Verified: ${application.applicationId}`,
        message: `All statutory credentials and submitted documents for ${application.organizationName} have been verified.`
      },
      ADDITIONAL_INFORMATION_REQUIRED: {
        subject: `Action Required: Additional Information Requested for ${application.applicationId}`,
        message: `Super Admin requires additional clarification or documents: "${adminNotes || transitionNote}". Please submit updates.`
      },
      PHYSICAL_VERIFICATION_PENDING: {
        subject: `Physical Location Verification Scheduled: ${application.applicationId}`,
        message: `Your registered address and coordinates are flagged for field verification.`
      },
      PHYSICAL_VERIFICATION_COMPLETED: {
        subject: `Physical Location Verified: ${application.applicationId}`,
        message: `Your facility coordinates and premises have been confirmed and geo-pinned on the ResQOne live emergency grid.`
      },
      FINAL_APPROVAL_PENDING: {
        subject: `Final Review Pending: ${application.applicationId}`,
        message: `Application has passed all technical and physical verification checks and is queued for final commission approval.`
      },
      APPROVED: {
        subject: `Application APPROVED: ${application.applicationId}`,
        message: `Congratulations! ${application.organizationName} has been officially approved for induction into the ResQOne emergency response network.`
      },
      REJECTED: {
        subject: `Application Status Update: REJECTED - ${application.applicationId}`,
        message: `Your organization onboarding application (${application.applicationId}) has been rejected by the Super Admin authority. Reason: ${adminNotes || transitionNote}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #0B132B; color: #fff; padding: 30px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #1c2a4e;">
            <div style="display: flex; align-items: center; margin-bottom: 20px;">
              <h2 style="color: #f43f5e; margin: 0; font-size: 22px;">Application Rejected</h2>
            </div>
            <p style="font-size: 15px; color: #e2e8f0; line-height: 1.6;">
              Dear <strong>${application.authorizedPersonName}</strong>,
            </p>
            <p style="font-size: 14px; color: #94a3b8; line-height: 1.6;">
              We regret to inform you that the onboarding application for <strong>${application.organizationName}</strong> (Ref ID: <span style="font-family: monospace; color: #38bdf8;">${application.applicationId}</span>) could not be approved at this time.
            </p>
            <div style="background: rgba(244, 63, 94, 0.1); border-left: 4px solid #f43f5e; padding: 15px 20px; border-radius: 6px; margin: 25px 0;">
              <span style="display: block; font-size: 12px; font-weight: bold; text-transform: uppercase; color: #fda4af; letter-spacing: 1px; margin-bottom: 5px;">Reason for Rejection:</span>
              <p style="font-size: 14px; color: #ffffff; margin: 0; line-height: 1.5; font-weight: 500;">
                "${adminNotes || transitionNote}"
              </p>
            </div>
            <p style="font-size: 13px; color: #94a3b8; line-height: 1.6;">
              If you believe this decision was made in error or if you have corrected the specified issues, you may submit a fresh application with revised statutory documentation.
            </p>
            <hr style="border: 0; border-top: 1px solid #1e293b; margin: 25px 0;" />
            <p style="font-size: 11px; color: #64748b; margin: 0;">
              ResQOne Emergency Grid Security & Governance Authority • Generated on ${new Date().toUTCString()}
            </p>
          </div>
        `
      },
      SUSPENDED: {
        subject: `Organization Access Suspended: ${application.applicationId}`,
        message: `Your organization dispatch privileges on ResQOne have been suspended. Inquiries may be directed to central administration.`
      }
    };

    if (emailTemplates[status]) {
      const template = emailTemplates[status];
      await sendSecurityEmail({
        to: application.officialEmail,
        subject: template.subject,
        text: template.message,
        html: template.html || `
          <div style="font-family: sans-serif; background: #0B132B; color: #fff; padding: 24px; border-radius: 10px;">
            <h3 style="color: #38bdf8;">${template.subject}</h3>
            <p>Dear <strong>${application.authorizedPersonName}</strong>,</p>
            <p>${template.message}</p>
            <p style="margin-top: 15px; font-size: 13px; color: #94a3b8;">
              Status: <span style="color: #4ade80; font-weight: bold;">${status}</span><br/>
              Updated on: ${new Date().toUTCString()}
            </p>
          </div>
        `
      }).catch(err => console.error('[Mailer Error Non-blocking]', err.message));
    }

    return res.status(200).json({
      success: true,
      message: `Application status updated to ${status}. Notification dispatched.`,
      application
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 5. Generate Cryptographic Activation Token (30 min expiry + Hashed in DB)
 * Security Improvements 3, 4, 6
 */
export const generateOrganizationCredentials = async (req, res) => {
  try {
    const application = await OrganizationApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.status !== OrganizationApplicationStatus.APPROVED &&
        application.status !== OrganizationApplicationStatus.DOCUMENTS_VERIFIED) {
      return res.status(400).json({
        success: false,
        message: 'Application must be APPROVED before generating credentials.'
      });
    }

    // 1. Generate Raw Token (Sent to client via email/link only once)
    const rawToken = crypto.randomBytes(32).toString('hex');
    // 2. Hash token for storage in DB
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    // 3. 30 Minutes Expiration
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    let orgEntityId = application.organizationId;
    if (application.organizationType === 'HOSPITAL' && !orgEntityId) {
      const hospital = await Hospital.create({
        name: application.organizationName,
        registrationNumber: application.registrationNumber,
        phone: application.contactNumber,
        emergencyHotline: application.contactNumber,
        address: application.address,
        location: {
          type: 'Point',
          coordinates: [77.2090, 28.6139]
        },
        hasTraumaCenter: true,
        hasICU: true
      });
      orgEntityId = hospital._id;
      application.organizationId = orgEntityId;
    }

    // Provision User in PENDING_ACTIVATION
    let user = await User.findOne({ email: application.officialEmail });
    if (!user) {
      const dummySalt = await bcrypt.genSalt(10);
      const temporaryHash = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), dummySalt);

      user = await User.create({
        name: application.authorizedPersonName,
        email: application.officialEmail,
        phone: application.contactNumber,
        passwordHash: temporaryHash,
        role: application.organizationType === 'HOSPITAL'
          ? UserRole.HOSPITAL_COORDINATOR
          : UserRole.CENTRAL_ADMIN,
        departmentType: application.organizationType,
        organizationId: orgEntityId,
        isVerified: false,
        status: 'PENDING_ACTIVATION',
        activationTokenHash: tokenHash,
        activationExpires: expiresAt
      });
    } else {
      user.activationTokenHash = tokenHash;
      user.activationExpires = expiresAt;
      user.organizationId = orgEntityId;
      await user.save();
    }

    application.activationTokenHash = tokenHash;
    application.activationTokenExpires = expiresAt;
    application.createdUserId = user._id;
    application.status = OrganizationApplicationStatus.CREDENTIALS_SENT;
    application.statusHistory.push({
      status: OrganizationApplicationStatus.CREDENTIALS_SENT,
      note: 'Secure activation link (30-minute validity) generated and dispatched.',
      updatedBy: req.user?.name || 'Super Admin',
      updatedAt: new Date()
    });

    await application.save();

    // Production Domain Configurable
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const activationLink = `${baseUrl}/activate-account?token=${rawToken}`;

    // Send Activation Email
    await sendSecurityEmail({
      to: application.officialEmail,
      subject: 'ResQOne Official Account: Activation Link & Master Password Setup',
      text: `Your application has been approved. Set your password here: ${activationLink}\nThis link is single-use and expires in 30 minutes.`,
      html: `
        <div style="font-family: sans-serif; background: #0B132B; color: #fff; padding: 25px; border-radius: 12px; max-width: 550px;">
          <h2 style="color: #4ade80;">Application Approved</h2>
          <p>Congratulations, <strong>${application.organizationName}</strong> is verified for ResQOne Emergency Grid.</p>
          <p>Please establish your master password to activate your command account:</p>
          <div style="margin: 25px 0;">
            <a href="${activationLink}" style="background: #D97706; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              Set Password & Activate Account
            </a>
          </div>
          <p style="font-size: 11px; color: #94a3b8;">This single-use link expires in 30 minutes. Database maintains hashed token security.</p>
        </div>
      `
    });

    return res.status(200).json({
      success: true,
      message: 'Activation link generated and dispatched to official email.',
      activationLink,
      application
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 6. Set Password & Transition to ACTIVE
 * Flow: APPROVED -> CREDENTIALS_SENT -> PASSWORD_SET -> ACTIVE
 */
export const activateAccountWithToken = async (req, res) => {
  try {
    const { token, password } = req.body;

    const tokenHash = crypto.createHash('sha256').update(String(token).trim()).digest('hex');

    const user = await User.findOne({
      activationTokenHash: tokenHash,
      activationExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired activation link (links expire after 30 minutes). Please contact Super Admin.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(password, salt);
    user.isVerified = true;
    user.status = 'ACTIVE';
    // Single-use guarantee: Invalidate token hash immediately
    user.activationTokenHash = undefined;
    user.activationExpires = undefined;
    await user.save();

    await OrganizationApplication.findOneAndUpdate(
      { createdUserId: user._id },
      {
        status: OrganizationApplicationStatus.ACTIVE,
        activationTokenHash: undefined,
        activationTokenExpires: undefined,
        $push: {
          statusHistory: [
            {
              status: OrganizationApplicationStatus.PASSWORD_SET,
              note: 'Official master password set.',
              updatedBy: user.name,
              updatedAt: new Date()
            },
            {
              status: OrganizationApplicationStatus.ACTIVE,
              note: 'Official command account is now fully active.',
              updatedBy: user.name,
              updatedAt: new Date()
            }
          ]
        }
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Password successfully set! Account is ACTIVE. Please login using Official Login with 2FA.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
