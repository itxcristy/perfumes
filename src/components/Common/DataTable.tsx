import React, { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  onRowClick?: (item: T) => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
  };
  emptyMessage?: string;
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  loading = false,
  onRowClick,
  pagination,
  emptyMessage = 'No data available'
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortColumn) return data;

    return [...data].sort((a, b) => {
      const aValue = (a as any)[sortColumn];
      const bValue = (b as any)[sortColumn];

      if (aValue === bValue) return 0;

      const comparison = aValue > bValue ? 1 : -1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortColumn, sortDirection]);

  const renderSortIcon = (columnKey: string) => {
    if (sortColumn !== columnKey) {
      return <ChevronsUpDown className="h-4 w-4 text-gray-400" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4 text-amber-600" />
    ) : (
      <ChevronDown className="h-4 w-4 text-amber-600" />
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    style={{ width: column.width }}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[...Array(5)].map((_, index) => (
                <tr key={index}>
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer select-none hover:bg-gray-100' : ''
                  }`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && renderSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((item) => (
              <tr
                key={item.id}
                className={`${
                  onRowClick
                    ? 'cursor-pointer hover:bg-gray-50 transition-colors'
                    : ''
                }`}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {column.render
                      ? column.render(item)
                      : (item as any)[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing{' '}
            <span className="font-medium">
              {(pagination.currentPage - 1) * pagination.pageSize + 1}
            </span>{' '}
            to{' '}
            <span className="font-medium">
              {Math.min(
                pagination.currentPage * pagination.pageSize,
                pagination.totalItems
              )}
            </span>{' '}
            of <span className="font-medium">{pagination.totalItems}</span> results
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center space-x-1">
              {[...Array(pagination.totalPages)].map((_, index) => {
                const page = index + 1;
                // Show first page, last page, current page, and pages around current
                if (
                  page === 1 ||
                  page === pagination.totalPages ||
                  (page >= pagination.currentPage - 1 &&
                    page <= pagination.currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => pagination.onPageChange(page)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        page === pagination.currentPage
                          ? 'bg-amber-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (
                  page === pagination.currentPage - 2 ||
                  page === pagination.currentPage + 2
                ) {
                  return (
                    <span key={page} className="px-2 text-gray-400">
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>

            <button
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

