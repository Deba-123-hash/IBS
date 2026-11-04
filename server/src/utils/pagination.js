/**
 * Reusable query parser for pagination, search, sorting, and date filters
 */
export function parsePaginationQuery(query, defaultLimit = 20, defaultSortBy = 'createdAt') {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  const skip = (page - 1) * limit;

  const search = typeof query.search === 'string' ? query.search.trim() : '';
  const sortBy = query.sortBy || defaultSortBy;
  const sortOrder = query.sortOrder?.toLowerCase() === 'asc' ? 'asc' : 'desc';

  const status = query.status ? String(query.status).trim() : null;
  const dateFrom = query.dateFrom ? new Date(query.dateFrom) : null;
  const dateTo = query.dateTo ? new Date(query.dateTo) : null;

  return {
    page,
    limit,
    skip,
    search,
    sortBy,
    sortOrder,
    status,
    dateFrom,
    dateTo
  };
}

/**
 * Reusable paginated response helper
 */
export function paginatedResponse(res, { data, total, page, limit, message = 'Data retrieved successfully' }) {
  const totalPages = Math.ceil(total / limit) || 1;
  return res.status(200).json({
    success: true,
    message,
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  });
}

export default {
  parsePaginationQuery,
  paginatedResponse
};
