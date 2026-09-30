import React from 'react';
import { Table } from '../ui/Table.jsx';
import { EmptyState } from '../ui/EmptyState.jsx';
import { Spinner } from '../ui/Spinner.jsx';

export const DataTable = ({
  columns = [],
  data = [],
  isLoading = false,
  emptyTitle = 'No data available',
  emptyDescription = 'There are no records matching your criteria.'
}) => {
  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-slate-200 bg-white">
        <Spinner size="lg" text="Loading records..." />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8">
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </div>
    );
  }

  return (
    <Table>
      <thead>
        <tr>
          {columns.map((col, idx) => (
            <th key={idx} className="text-left font-semibold text-xs text-slate-600">
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIdx) => (
          <tr key={rowIdx} className="hover:bg-slate-50/80 transition-colors">
            {columns.map((col, colIdx) => (
              <td key={colIdx} className="text-xs text-slate-700">
                {col.render ? col.render(row) : row[col.accessor]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default DataTable;
