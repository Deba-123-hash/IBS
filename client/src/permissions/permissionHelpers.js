import { ROLE_PERMISSIONS } from './rolePermissions.js';

/**
 * Resolves the active permissions array for a user.
 * Prioritizes backend-provided user.permissions, falls back to role matrix.
 */
export function getUserPermissions(user) {
  if (!user) return [];
  if (Array.isArray(user.permissions) && user.permissions.length > 0) {
    return user.permissions;
  }
  const role = user.role;
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Checks if the user possesses a specific granular permission code.
 */
export function hasPermission(user, permission) {
  if (!user || !permission) return false;
  if (user.role === 'SUPER_ADMIN') return true;

  const userPerms = getUserPermissions(user);
  return userPerms.includes(permission);
}

/**
 * Checks if the user has AT LEAST ONE of the specified permissions.
 */
export function hasAnyPermission(user, permissions = []) {
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN') return true;
  if (!permissions || permissions.length === 0) return true;

  const userPerms = getUserPermissions(user);
  return permissions.some(p => userPerms.includes(p));
}

/**
 * Checks if the user has ALL of the specified permissions.
 */
export function hasAllPermissions(user, permissions = []) {
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN') return true;
  if (!permissions || permissions.length === 0) return true;

  const userPerms = getUserPermissions(user);
  return permissions.every(p => userPerms.includes(p));
}

/**
 * Checks resource ownership for permissions that have an _OWN scope.
 * Prevents viewing/mutating other users' resources even on the client.
 */
export function canAccessResource(user, permission, resource) {
  if (!hasPermission(user, permission)) return false;
  if (user.role === 'SUPER_ADMIN') return true;

  // If permission requires ownership
  if (permission.endsWith('_OWN')) {
    if (!resource) return false;
    const studentId = user.studentId || user.id;
    const resourceOwner = resource.studentId || resource.userId || resource.id;
    return studentId === resourceOwner;
  }

  return true;
}
