import { usePermissions } from './usePermissions.js';

/**
 * Checks if the current authenticated user can perform an action.
 * Example: const canVerify = useCan('PAYMENT_VERIFY');
 */
export function useCan(permission, resource = null) {
  const { hasPermission, canAccessResource } = usePermissions();
  if (resource) {
    return canAccessResource(permission, resource);
  }
  return hasPermission(permission);
}

/**
 * Checks if the user has any of the specified permissions.
 * Example: const canManage = useCanAny(['ROOM_ASSIGN', 'ROOM_TRANSFER_APPROVE']);
 */
export function useCanAny(permissions = []) {
  const { hasAnyPermission } = usePermissions();
  return hasAnyPermission(permissions);
}

/**
 * Checks if the user has all of the specified permissions.
 */
export function useCanAll(permissions = []) {
  const { hasAllPermissions } = usePermissions();
  return hasAllPermissions(permissions);
}

export default useCan;
