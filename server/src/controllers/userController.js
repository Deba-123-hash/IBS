import prisma from '../config/database.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { logAuditEvent } from '../services/auditService.js';

export const getMyProfile = async (req, res) => {
  try {
    if (prisma && prisma.user && req.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          phoneNumber: true,
          avatarUrl: true,
          isActive: true,
          createdAt: true,
          studentProfile: {
            include: {
              batch: {
                include: {
                  program: {
                    include: { department: true }
                  }
                }
              },
              roomAllocation: {
                include: {
                  room: {
                    include: { block: { include: { hostel: true } } }
                  }
                }
              }
            }
          },
          staffProfile: {
            include: { department: true }
          }
        }
      });

      if (user) {
        return successResponse(res, user, 'Profile retrieved successfully');
      }
    }

    return successResponse(res, req.user, 'Profile retrieved successfully');
  } catch (error) {
    console.error('[User Profile Error]:', error);
    return errorResponse(res, 'Failed to fetch user profile', 'PROFILE_ERROR', 500);
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber } = req.body;

    // Security Rule: Regular users CANNOT modify role, permissions, or isActive
    if ('role' in req.body || 'isActive' in req.body || 'email' in req.body) {
      return errorResponse(
        res,
        'Modifying email, role, or active status is strictly restricted to administrators',
        'FORBIDDEN_FIELD_MODIFICATION',
        403
      );
    }

    if (prisma && prisma.user && req.user?.id) {
      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(phoneNumber !== undefined && { phoneNumber })
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          phoneNumber: true,
          avatarUrl: true
        }
      });

      await logAuditEvent({
        userId: req.user.id,
        action: 'USER_UPDATED_PROFILE',
        entity: 'USER',
        entityId: req.user.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      return successResponse(res, updatedUser, 'Profile updated successfully');
    }

    return successResponse(res, { ...req.user, firstName, lastName, phoneNumber }, 'Profile updated in session');
  } catch (error) {
    return errorResponse(res, 'Failed to update user profile', 'UPDATE_PROFILE_ERROR', 500);
  }
};

export const updateAvatar = async (req, res) => {
  try {
    const { avatarUrl } = req.body;
    if (!avatarUrl) {
      return errorResponse(res, 'Avatar URL is required', 'MISSING_AVATAR', 400);
    }

    if (prisma && prisma.user && req.user?.id) {
      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: { avatarUrl },
        select: { id: true, email: true, avatarUrl: true }
      });

      return successResponse(res, updatedUser, 'Avatar updated successfully');
    }

    return successResponse(res, { avatarUrl }, 'Avatar updated in session');
  } catch (error) {
    return errorResponse(res, 'Failed to update avatar', 'AVATAR_ERROR', 500);
  }
};

export default {
  getMyProfile,
  updateMyProfile,
  updateAvatar
};
