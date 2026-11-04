import React, { useState, useMemo } from 'react';
import { EmptyState } from '../ui/EmptyState.jsx';
import { Spinner } from '../ui/Spinner.jsx';
import { SearchInput } from '../ui/SearchInput.jsx';
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

/**
 * Enterprise DataTable Component with integrated search filtering,
 * interactive column sorting, pagination, row actions, and responsive card transforms.
 * Light theme design system.
 */
export const DataTable = ({
  columns = [],
  data = [],
  isLoading = false,
  emptyTitle = 'No data available',
  emptyDescription = 'There are no records matching your criteria.',
  renderMobileCard,
  pageSize = 10,
  enablePagination = true,
  enableSearch = false,
  searchPlaceholder = 'Search records...',
  filterComponent,
  ariaLabel = 'Data table'
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // 1. Search Filtering
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const val = row[col.accessor];
        return val !== undefined && val !== null && String(val).toLowerCase().includes(query);
      })
    );
  }, [data, searchQuery, columns]);

  // 2. Sorting
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal === bVal) return 0;
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;
      const compare = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return sortConfig.direction === 'asc' ? compare : -compare;
    });
  }, [filteredData, sortConfig]);

  // 3. Pagination
  const totalPages = enablePagination ? Math.max(1, Math.ceil(sortedData.length / pageSize)) : 1;
  const displayedData = enablePagination
    ? sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : sortedData;

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-xs">
        <Spinner size="lg" text="Loading records..." />
      </div>
    );
  }

  const primaryCol = columns.find((c) => c.isPrimary) || columns[0];
  const secondaryCols = columns.filter((c) => c !== primaryCol && !c.hideOnMobile);

  return (
    <div className="w-full space-y-4">
      {/* Search & Filter Toolbar */}
      {(enableSearch || filterComponent) && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {enableSearch && (
            <div className="w-full sm:w-72">
              <SearchInput
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                onClear={() => setSearchQuery('')}
              />
            </div>
          )}
          {filterComponent && <div className="flex items-center gap-2">{filterComponent}</div>}
        </div>
      )}

      {sortedData.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
          <EmptyState title={emptyTitle} description={emptyDescription} />
        </div>
      ) : (
        <>
          {/* 1. Desktop & Tablet Table View (>= 768px) */}
          <div className="hidden md:block rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs" aria-label={ariaLabel}>
                <thead className="border-b border-slate-100 bg-slate-50/70 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    {columns.map((col, idx) => {
                      const isSortable = col.sortable !== false && col.accessor;
                      const isSorted = sortConfig.key === col.accessor;

                      return (
                        <th
                          key={idx}
                          scope="col"
                          onClick={() => isSortable && handleSort(col.accessor)}
                          className={`py-3.5 px-4 font-semibold ${
                            col.align === 'right'
                              ? 'text-right'
                              : col.align === 'center'
                              ? 'text-center'
                              : 'text-left'
                          } ${isSortable ? 'cursor-pointer hover:text-slate-900 select-none' : ''} ${
                            col.className || ''
                          }`}
                        >
                          <div className={`inline-flex items-center gap-1.5 ${col.align === 'right' ? 'justify-end' : ''}`}>
                            <span>{col.header}</span>
                            {isSortable && (
                              <span className="text-slate-400">
                                {isSorted ? (
                                  sortConfig.direction === 'asc' ? (
                                    <ArrowUp className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                                  ) : (
                                    <ArrowDown className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                                  )
                                ) : (
                                  <ArrowUpDown className="w-3.5 h-3.5 opacity-60 hover:opacity-100" aria-hidden="true" />
                                )}
                              </span>
                            )}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedData.map((row, rowIdx) => (
                    <tr
                      key={row.id || rowIdx}
                      className="hover:bg-slate-50/70"
                    >
                      {columns.map((col, colIdx) => (
                        <td
                          key={colIdx}
                          className={`py-3.5 px-4 text-slate-700 ${
                            col.align === 'right'
                              ? 'text-right'
                              : col.align === 'center'
                              ? 'text-center'
                              : 'text-left'
                          } ${col.className || ''}`}
                        >
                          {col.render ? col.render(row) : row[col.accessor]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. Mobile Responsive Card List View (< 768px) */}
          <div className="block md:hidden space-y-3">
            {displayedData.map((row, rowIdx) => (
              <div
                key={row.id || rowIdx}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-2.5"
              >
                {renderMobileCard ? (
                  renderMobileCard(row)
                ) : (
                  <>
                    {primaryCol && (
                      <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
                        <span className="font-bold text-slate-900 text-sm">
                          {primaryCol.render ? primaryCol.render(row) : row[primaryCol.accessor]}
                        </span>
                        {columns.find((c) => c.isBadge) && (
                          <div>
                            {columns.find((c) => c.isBadge).render(row)}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {secondaryCols.map((col, idx) => (
                        <div key={idx} className="space-y-0.5">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                            {col.header}
                          </span>
                          <span className="text-slate-700 font-medium">
                            {col.render ? col.render(row) : row[col.accessor] || '—'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* 3. Pagination Controls */}
          {enablePagination && totalPages > 1 && (
            <div className="flex items-center justify-between text-xs text-slate-500 px-2 pt-2">
              <span>
                Showing <strong className="text-slate-700">{(currentPage - 1) * pageSize + 1}</strong> to{' '}
                <strong className="text-slate-700">
                  {Math.min(currentPage * pageSize, sortedData.length)}
                </strong>{' '}
                of <strong className="text-slate-700">{sortedData.length}</strong> records
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                </button>
                <span className="px-2 font-medium">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                  aria-label="Next Page"
                >
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DataTable;
