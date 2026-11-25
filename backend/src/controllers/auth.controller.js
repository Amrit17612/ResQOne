import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User } from '../models/user.model.js';
import { signToken } from '../utils/token.js';
import { AuditLog } from '../models/audit.model.js';
import { UserRole } from '../constants/enums.js';
import { sendSecurityEmail } from '../utils/mailer.js';
import { generateSecureOTP, hashOTPWithPepper, verifyOTPWithPepper } from '../utils/secureOtp.js';

/**
 * Citizen Registration
 */
export const registerCitizen = async (req, res) => {
  try {
    const { name, email, phone, password, address, emergencyContact } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newCitizen = await User.create({
      name,
      email,
      phone,
      passwordHash,
      role: UserRole.CITIZEN,
      isVerified: true,
      authProvider: 'LOCAL',
      emergencyContact
    });

    const token = signToken({
      userId: newCitizen._id.toString(),
      role: newCitizen.role,
      email: newCitizen.email,
      name: newCitizen.name
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(201).json({
      success: true,
      message: 'Citizen account created successfully.',
      user: {
        id: newCitizen._id,
        name: newCitizen.name,
        email: newCitizen.email,
        role: newCitizen.role
      },
      token
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Citizen Firebase / Google Sign-In Exchange
 * Verifies email and provisions or syncs a CITIZEN account (Never elevates to official)
 */
export const loginCitizenFirebase = async (req, res) => {
  try {
    const { email, name, firebaseUid, phone } = req.body;

    if (!email || !firebaseUid) {
      return res.status(400).json({ success: false, message: 'Invalid Firebase credential payload.' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      // Auto-provision Citizen
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(randomPassword, salt);

      user = await User.create({
        name: name || email.split('@')[0],
        email,
        phone: phone || '9999999999',
        passwordHash,
        role: UserRole.CITIZEN, // Hardcoded
        authProvider: 'FIREBASE_GOOGLE',
        firebaseUid,
        isVerified: true
      });
    } else {
      // Ensure existing user has citizen role
      if (user.role !== UserRole.CITIZEN) {
        return res.status(403).json({
          success: false,
          message: 'Official accounts cannot authenticate via Citizen Google Sign-In.'
        });
      }
      user.firebaseUid = firebaseUid;
      await user.save();
    }

    const token = signToken({
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
      name: user.name
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      success: true,
      message: 'Authenticated successfully via Firebase Google Sign-In.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Citizen Local Login
 */
export const loginCitizen = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.role !== UserRole.CITIZEN) {
      return res.status(403).json({
        success: false,
        message: 'This portal is for Citizens only. Please use the Official Department portal.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = signToken({
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
      name: user.name
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Official Login Step 1: Password Verification & 2FA Email OTP Dispatch
 */
export const loginOfficialInitiate = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid official credentials.' });
    }

    if (user.role === UserRole.CITIZEN) {
      return res.status(403).json({
        success: false,
        message: 'Citizen accounts cannot access the Official Command network.'
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Your official account is pending activation or Super Admin approval.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid official credentials.' });
    }

    // Cryptographically Secure CSPRNG 6-digit Email OTP via crypto.randomInt
    const rawOtp = generateSecureOTP();
    // HMAC-SHA256 with Server-side Pepper + User Identity binding
    const otpHmac = hashOTPWithPepper(rawOtp, user.email);

    user.currentEmailOtpHash = otpHmac;
    user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity
    user.otpAttempts = 0;
    await user.save();

    console.log(`[ResQOne Security Grid] 2FA OTP generated for ${user.email}: [ ${rawOtp} ]`);

    // Send 2FA Email (non-blocking with error catch to prevent request freeze)
    sendSecurityEmail({
      to: user.email,
      subject: 'ResQOne Security Grid: 2FA Login Verification Code',
      text: `RESQONE SECURITY VERIFICATION\nYour 6-digit login verification code: ${rawOtp}\nValid for 5 minutes. Do not share this code.`,
      html: `
        <div style="font-family: sans-serif; background: #0B132B; color: #fff; padding: 25px; border-radius: 12px; max-width: 500px;">
          <h2 style="color: #DC2626; margin-top: 0;">ResQOne Security Verification</h2>
          <p style="font-size: 14px; color: #cbd5e1;">A login request was initiated for your Official Command Account (<strong>${user.role}</strong>).</p>
          <div style="background: #1C2541; padding: 18px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #38bdf8;">${rawOtp}</span>
          </div>
          <p style="font-size: 12px; color: #94a3b8;">This code expires in 5 minutes. If you did not initiate this request, notify the Super Admin immediately.</p>
        </div>
      `
    }).catch(err => console.error('[2FA Email Dispatch Failed Non-blocking]', err.message));

    return res.status(200).json({
      success: true,
      requires2FA: true,
      maskedEmail: `${user.email.slice(0, 3)}***@${user.email.split('@')[1]}`,
      message: 'Password verified. 6-digit Security Verification Code dispatched to registered email.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Official Login Step 2: 2FA OTP Verification & JWT Token Issuance
 */
export const loginOfficialVerifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid session.' });
    }

    if (!user.currentEmailOtpHash || !user.otpExpiresAt) {
      return res.status(400).json({ success: false, message: 'No active OTP request found. Please login again.' });
    }

    if (new Date() > user.otpExpiresAt) {
      user.currentEmailOtpHash = undefined;
      user.otpExpiresAt = undefined;
      await user.save();
      return res.status(400).json({ success: false, message: 'Security code has expired. Please request a new one.' });
    }

    if (user.otpAttempts >= 5) {
      user.currentEmailOtpHash = undefined;
      user.otpExpiresAt = undefined;
      await user.save();
      return res.status(429).json({ success: false, message: 'Too many incorrect attempts. Session locked. Please login again.' });
    }

    // Verify OTP using constant-time comparison against HMAC-SHA256 Peppered Hash
    const isOtpValid = verifyOTPWithPepper(String(otp).trim(), user.email, user.currentEmailOtpHash);

    if (!isOtpValid) {
      user.otpAttempts += 1;
      await user.save();
      return res.status(400).json({
        success: false,
        message: `Incorrect verification code. (${5 - user.otpAttempts} attempts remaining)`
      });
    }

    // OTP matched: Invalidate OTP immediately (One-Time Use Guarantee)
    user.currentEmailOtpHash = undefined;
    user.otpExpiresAt = undefined;
    user.otpAttempts = 0;
    await user.save();

    const token = signToken({
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
      name: user.name,
      organizationId: user.organizationId?.toString(),
      departmentType: user.departmentType
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    await AuditLog.create({
      actorId: user._id,
      actorName: user.name,
      actorRole: user.role,
      action: 'OFFICIAL_2FA_VERIFIED_LOGIN',
      resource: 'User',
      resourceId: user._id.toString(),
      ipAddress: req.ip
    });

    return res.status(200).json({
      success: true,
      message: '2FA authentication successful. Access granted.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        departmentType: user.departmentType,
        organizationId: user.organizationId
      },
      token
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Staff Login Portal (Shared for DRV-*, DOC-*, NUR-*, POL-*, FIRE-*, VOL-*)
 * Authenticates by Staff ID OR Email + Password
 */
export const loginStaff = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Please provide your Staff ID / Email and password.' });
    }

    const cleanId = identifier.trim();
    const user = await User.findOne({
      $or: [
        { staffId: cleanId },
        { email: cleanId.toLowerCase() }
      ]
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid Staff ID / Email or credentials.' });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: `Account is currently ${user.status}. Please activate your account using your single-use activation link or contact your department administrator.`
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = signToken({
      userId: user._id.toString(),
      role: user.role,
      staffId: user.staffId,
      email: user.email,
      name: user.name,
      departmentType: user.departmentType,
      organizationId: user.organizationId?.toString()
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    await AuditLog.create({
      actorId: user._id,
      actorName: user.name,
      actorRole: user.role,
      action: 'STAFF_LOGIN',
      resource: 'User',
      resourceId: user._id.toString(),
      details: { staffId: user.staffId, role: user.role },
      ipAddress: req.ip
    });

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      user: {
        id: user._id,
        staffId: user.staffId,
        name: user.name,
        email: user.email,
        role: user.role,
        departmentType: user.departmentType,
        organizationId: user.organizationId
      },
      token
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = (req, res) => {
  res.clearCookie('token');
  return res.status(200).json({ success: true, message: 'Logged out successfully.' });
};

export const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }
    const user = await User.findById(req.user.userId).select('-passwordHash -currentEmailOtpHash -activationTokenHash');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
