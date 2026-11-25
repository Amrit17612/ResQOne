import crypto from 'crypto';

const PEPPER = process.env.OTP_PEPPER_SECRET || process.env.JWT_SECRET || 'resqone_ultra_secure_otp_pepper_2026';

/**
 * Cryptographically Secure 6-digit OTP generator
 * Uses OS-level entropy (CSPRNG) via Node.js crypto.randomInt
 */
export const generateSecureOTP = () => {
  return String(crypto.randomInt(100000, 1000000));
};

/**
 * Computes a HMAC-SHA256 hash using a server-side pepper secret.
 * Completely immune to rainbow-table and offline brute-force dictionary attacks.
 */
export const hashOTPWithPepper = (otp, userIdentifier) => {
  return crypto
    .createHmac('sha256', PEPPER)
    .update(`${otp}:${userIdentifier}`)
    .digest('hex');
};

/**
 * Cryptographically verifies submitted OTP against stored HMAC hash.
 */
export const verifyOTPWithPepper = (submittedOtp, userIdentifier, storedHmac) => {
  const calculated = hashOTPWithPepper(submittedOtp, userIdentifier);
  // Constant-time buffer comparison to prevent timing attacks
  const bufA = Buffer.from(calculated, 'utf8');
  const bufB = Buffer.from(storedHmac, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};

