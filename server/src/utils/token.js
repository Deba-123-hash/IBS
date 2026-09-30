import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';

export const generateAccessToken = (payload) => {
  return jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN
  });
};

export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, ENV.REFRESH_TOKEN_SECRET, {
    expiresIn: ENV.REFRESH_TOKEN_EXPIRES_IN
  });
};

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, ENV.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, ENV.REFRESH_TOKEN_SECRET);
  } catch (error) {
    return null;
  }
};

// Aliases for backward compatibility
export const generateToken = generateAccessToken;
export const verifyToken = verifyAccessToken;

export default {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateToken,
  verifyToken
};
