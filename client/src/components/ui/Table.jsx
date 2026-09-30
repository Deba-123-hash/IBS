import React from 'react';

export const Table = ({ children, className = '' }) => (
  <div className="overflow-x-auto w-full">
    <table className={`w-full text-left text-xs ${className}`}>
      {children}
    </table>
  </div>
);

export const Thead = ({ children, className = '' }) => (
  <thead className={`border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold ${className}`}>
    {children}
  </thead>
);

export const Tbody = ({ children, className = '' }) => (
  <tbody className={`divide-y divide-slate-100 ${className}`}>
    {children}
  </tbody>
);

export const Tr = ({ children, className = '', hover = true }) => (
  <tr className={`${hover ? 'hover:bg-slate-50/50 transition' : ''} ${className}`}>
    {children}
  </tr>
);

export const Th = ({ children, className = '' }) => (
  <th className={`py-3 px-4 font-semibold text-slate-600 ${className}`}>
    {children}
  </th>
);

export const Td = ({ children, className = '' }) => (
  <td className={`py-3 px-4 text-slate-800 ${className}`}>
    {children}
  </td>
);

export default Table;
