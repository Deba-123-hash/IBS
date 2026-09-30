import { successResponse, errorResponse } from '../utils/response.js';

export const getMyFees = async (req, res) => {
  try {
    const feeData = {
      academicYear: '2026-2027',
      semester: 5,
      components: [
        { name: 'Academic Tuition Fee', amount: 65000, status: 'PAID' },
        { name: 'Hostel Accommodation & Electricity', amount: 18000, status: 'PAID' },
        { name: 'Mess Dietary Advance', amount: 12000, status: 'PAID' },
        { name: 'Library & Laboratory Deposit', amount: 2000, status: 'PAID' }
      ],
      totalBilled: 97000,
      totalPaid: 97000,
      totalDue: 0,
      paymentStatus: 'CLEARED',
      paymentHistory: [
        { id: 'pay_01', ref: 'TXN-2026-09124', date: '2026-08-15', amount: 97000, mode: 'HDFC NetBanking', status: 'VERIFIED' }
      ]
    };

    return successResponse(res, feeData, 'Fee ledger records retrieved');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch fee details', 'FEE_ERROR', 500);
  }
};

export const submitFeeQuery = async (req, res) => {
  try {
    const { subject, message } = req.body;
    return successResponse(res, { queryId: `fq_${Date.now()}`, subject, message, status: 'PENDING_REVIEW' }, 'Fee query submitted to Accounts desk');
  } catch (error) {
    return errorResponse(res, 'Failed to submit query', 'QUERY_ERROR', 500);
  }
};
