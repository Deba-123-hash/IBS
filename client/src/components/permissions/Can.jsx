import React from 'react';
import { useCan, useCanAny, useCanAll } from '../../hooks/useCan.js';

/**
 * Declarative component for permission-based rendering.
 * Usage:
 * <Can permission="PAYMENT_VERIFY" fallback={<NoAccess />}>
 *   <VerifyButton />
 * </Can>
 */
export function Can({
  permission,
  permissions,
  mode = 'any', // 'any' or 'all'
  resource = null,
  fallback = null,
  children
}) {
  const singleCan = useCan(permission, resource);
  const anyCan = useCanAny(permissions || []);
  const allCan = useCanAll(permissions || []);

  let isAllowed = false;

  if (permission) {
    isAllowed = singleCan;
  } else if (permissions) {
    isAllowed = mode === 'all' ? allCan : anyCan;
  }

  if (!isAllowed) {
    return fallback;
  }

  return <>{children}</>;
}

export default Can;
