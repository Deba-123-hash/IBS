import { checkHealth } from '../services/healthService.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getHealth = async (req, res) => {
  try {
    const healthData = await checkHealth();
    if (healthData.database !== 'healthy') {
      return res.status(503).json({
        success: false,
        data: healthData,
        message: 'Campus Life API running with database issues'
      });
    }
    return successResponse(res, healthData, 'Campus Life API is running');
  } catch (error) {
    return errorResponse(res, 'Health check diagnosis failed', 'HEALTH_CHECK_ERROR', 500);
  }
};

export default { getHealth };
