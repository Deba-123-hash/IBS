import React from 'react';
import { DataTable } from './DataTable.jsx';
import Badge from '../ui/Badge.jsx';

export default {
  title: 'Organisms/DataTable',
  component: DataTable,
  tags: ['autodocs']
};

const sampleColumns = [
  {
    header: 'Ticket ID',
    accessor: 'id',
    isPrimary: true,
    render: (row) => <span className="font-bold text-slate-900">{row.id}</span>
  },
  {
    header: 'Subject',
    accessor: 'title'
  },
  {
    header: 'Category',
    accessor: 'category'
  },
  {
    header: 'Status',
    accessor: 'status',
    render: (row) => (
      <Badge variant={row.status === 'RESOLVED' ? 'success' : row.status === 'PENDING' ? 'warning' : 'default'}>
        {row.status}
      </Badge>
    )
  }
];

const sampleData = [
  { id: 'CMP-2026-001', title: 'Ceiling Fan Motor Humming', category: 'Electrical', status: 'IN_PROGRESS' },
  { id: 'CMP-2026-002', title: 'Water Pressure Drop Block A', category: 'Plumbing', status: 'RESOLVED' },
  { id: 'CMP-2026-003', title: 'Wi-Fi AP Signal Degraded', category: 'Network', status: 'PENDING' }
];

export const DefaultResponsive = {
  args: {
    columns: sampleColumns,
    data: sampleData,
    ariaLabel: 'Campus maintenance grievances'
  }
};

export const LoadingState = {
  args: {
    columns: sampleColumns,
    data: [],
    isLoading: true
  }
};

export const EmptyState = {
  args: {
    columns: sampleColumns,
    data: [],
    emptyTitle: 'No active tickets',
    emptyDescription: 'All grievances in this sector have been resolved.'
  }
};

