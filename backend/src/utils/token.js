import jwt from 'jsonwebtoken';

export const signToken = (payload) => {
  const secret = process.env.JWT_SECRET || 'resqone_ultra_secure_jwt_secret_key_2026_capstone_project';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
};

export const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET || 'resqone_ultra_secure_jwt_secret_key_2026_capstone_project';
  return jwt.verify(token, secret);
};

