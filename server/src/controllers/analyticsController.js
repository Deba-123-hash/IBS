import { successResponse, errorResponse } from '../utils/response.js';

export const getOverview = async (req, res) => {
  try {
    const kpiData = {
      totalStudents: 2450,
      staffOnDuty: 148,
      pendingRequests: 18,
      openComplaints: 12,
      overdueComplaints: 2,
      avgResolutionHours: 4.2,
      todayGatePasses: 45,
      messSatisfactionScore: 4.1
    };

    const complaintsByCategory = [
      { category: 'Plumbing', count: 18, percentage: 38 },
      { category: 'Electrical', count: 12, percentage: 25 },
      { category: 'Internet', count: 8, percentage: 17 },
      { category: 'Cleaning', count: 6, percentage: 12 },
      { category: 'Furniture', count: 4, percentage: 8 }
    ];

    const complaintAgeing = [
      { range: '0 - 12 Hours', count: 7, status: 'HEALTHY' },
      { range: '12 - 24 Hours', count: 3, status: 'NORMAL' },
      { range: '24 - 48 Hours', count: 2, status: 'WARNING' },
      { range: '> 48 Hours', count: 0, status: 'BREACH' }
    ];

    const weeklyGatePasses = [
      { day: 'Mon', count: 35 },
      { day: 'Tue', count: 45 },
      { day: 'Wed', count: 28 },
      { day: 'Thu', count: 52 },
      { day: 'Fri', count: 85 },
      { day: 'Sat', count: 140 },
      { day: 'Sun', count: 110 }
    ];

    return successResponse(res, {
      kpi: kpiData,
      complaintsByCategory,
      complaintAgeing,
      weeklyGatePasses
    }, 'Admin command center analytics loaded');
  } catch (error) {
    return errorResponse(res, 'Failed to compute analytics', 'ANALYTICS_ERROR', 500);
  }
};
