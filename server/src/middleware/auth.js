import { verifyAccessToken, verifyToken } from '../utils/token.js';
import prisma from '../config/database.js';
import { hasPermission } from '../constants/permissions.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Access token missing or invalid format'
        }
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token) || verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_INVALID',
          message: 'Session token has expired or is invalid'
        }
      });
    }

    req.user = decoded;

    // Optional database profile lookup if Prisma is connected
    if (prisma && prisma.user && decoded.id) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          include: {
            studentProfile: true,
            staffProfile: true
          }
        });
        if (user && user.isActive) {
          req.user = {
            ...decoded,
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            isActive: user.isActive,
            studentId: user.studentProfile?.id,
            staffId: user.staffProfile?.id,
            rollNumber: user.studentProfile?.rollNumber,
            employeeCode: user.staffProfile?.employeeCode
          };
        } else if (user && !user.isActive) {
          return res.status(403).json({
            success: false,
            error: {
              code: 'ACCOUNT_DISABLED',
              message: 'Your account has been deactivated. Please contact administration.'
            }
          });
        }
      } catch (err) {
        // Fallback to token decoded data
      }
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'AUTH_INTERNAL_ERROR',
        message: 'Internal authentication validation failed'
      }
    });
  }
};

export const requireAuth = authenticate;

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }

    if (!allowedRoles.includes(req.user.role) && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Requires one of the following roles: [${allowedRoles.join(', ')}]`
        }
      });
    }

    next();
  };
};

export const requireRole = authorize;

export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }

    if (!hasPermission(req.user.role, permission)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Required permission: '${permission}'`
        }
      });
    }

    next();
  };
};

export const requireOwnership = (ownershipResolver) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }

    // SUPER_ADMIN can bypass resource ownership where authorized
    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    try {
      const isOwner = await ownershipResolver(req);
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Resource ownership constraint violation: You can only access your own resources'
          }
        });
      }
      next();
    } catch (err) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Resource ownership verification failed'
        }
      });
    }
  };
};

export const preventSelfApproval = (creatorField = 'createdById') => {
  return (req, res, next) => {
    const creatorId = req.targetResource?.[creatorField] || req.body?.[creatorField];
    if (creatorId && req.user && req.user.id === creatorId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'SEPARATION_OF_DUTIES_VIOLATION',
          message: 'Separation of duties violation: Self-approval is strictly prohibited.'
        }
      });
    }
    next();
  };
};

export default {
  authenticate,
  requireAuth,
  authorize,
  requireRole,
  requirePermission,
  requireOwnership,
  preventSelfApproval
};
