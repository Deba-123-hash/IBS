import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import {
  getUserPermissions,
  hasPermission as checkHasPermission,
  hasAnyPermission as checkHasAnyPermission,
  hasAllPermissions as checkHasAllPermissions,
  canAccessResource as checkCanAccessResource
} from '../permissions/permissionHelpers.js';

export function usePermissions() {
  const { user } = useAuth();

  const permissions = useMemo(() => getUserPermissions(user), [user]);

  const hasPermission = useMemo(
    () => (permission) => checkHasPermission(user, permission),
    [user]
  );

  const hasAnyPermission = useMemo(
    () => (perms) => checkHasAnyPermission(user, perms),
    [user]
  );

  const hasAllPermissions = useMemo(
    () => (perms) => checkHasAllPermissions(user, perms),
    [user]
  );

  const canAccessResource = useMemo(
    () => (permission, resource) => checkCanAccessResource(user, permission, resource),
    [user]
  );

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessResource
  };
}

export default usePermissions;
