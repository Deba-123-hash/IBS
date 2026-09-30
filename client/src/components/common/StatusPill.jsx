import React from 'react';
import { Badge } from '../ui/Badge.jsx';

export const StatusPill = ({ status, size = 'sm' }) => {
  const getVariant = (s) => {
    switch (s?.toUpperCase()) {
      case 'APPROVED':
      case 'RESOLVED':
      case 'PRESENT':
      case 'SUCCESS':
        return 'success';
      case 'PENDING':
      case 'IN_PROGRESS':
      case 'LATE':
        return 'warning';
      case 'REJECTED':
      case 'FAILED':
      case 'ABSENT':
      case 'EXPIRED':
        return 'danger';
      default:
        return 'default';
    }
  };

  return <Badge variant={getVariant(status)} size={size}>{status || 'Unknown'}</Badge>;
};

export default StatusPill;
