import { successResponse, errorResponse } from '../utils/response.js';

let memoryCertificates = [
  {
    id: 'cert_req_01',
    requestNumber: 'CRT-2026-0012',
    certificateType: 'BONAFIDE',
    title: 'Bonafide Certificate',
    studentName: 'Aarav Sharma',
    rollNumber: 'CS2023048',
    purpose: 'SBI Education Loan Verification',
    status: 'AVAILABLE',
    requestedAt: '2026-09-26T10:00:00Z',
    approvedAt: '2026-09-27T14:30:00Z',
    documentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    id: 'cert_req_02',
    requestNumber: 'CRT-2026-0019',
    certificateType: 'FEE_ESTIMATE',
    title: 'Fee Estimate Certificate',
    studentName: 'Aarav Sharma',
    rollNumber: 'CS2023048',
    purpose: 'State Post-Matric Scholarship Portal',
    status: 'UNDER_REVIEW',
    requestedAt: '2026-09-28T09:15:00Z',
    approvedAt: null,
    documentUrl: null
  }
];

export const getCertificates = async (req, res) => {
  return successResponse(res, { requests: memoryCertificates }, 'Certificate requests fetched');
};

export const requestCertificate = async (req, res) => {
  try {
    const { certificateType, purpose } = req.body;

    if (!certificateType || !purpose) {
      return errorResponse(res, 'Certificate type and purpose are required', 'MISSING_FIELDS', 400);
    }

    const typeTitles = {
      BONAFIDE: 'Bonafide Certificate',
      STUDY: 'Study / Medium of Instruction Certificate',
      CHARACTER: 'Character & Conduct Certificate',
      FEE_ESTIMATE: 'Institutional Fee Estimate Certificate'
    };

    const newReq = {
      id: `cert_${Date.now()}`,
      requestNumber: `CRT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      certificateType,
      title: typeTitles[certificateType] || 'Institutional Certificate',
      studentName: req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Aarav Sharma',
      rollNumber: req.user?.rollNumber || 'CS2023048',
      purpose,
      status: 'UNDER_REVIEW',
      requestedAt: new Date().toISOString(),
      approvedAt: null,
      documentUrl: null
    };

    memoryCertificates.unshift(newReq);

    return successResponse(res, { request: newReq }, 'Certificate application lodged with Academic Section', 201);
  } catch (error) {
    return errorResponse(res, 'Failed to request certificate', 'CERT_REQ_ERROR', 500);
  }
};

export const approveCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const { documentUrl, remarks } = req.body;

    const cert = memoryCertificates.find(c => c.id === id || c.requestNumber === id);
    if (!cert) return errorResponse(res, 'Certificate request not found', 'NOT_FOUND', 404);

    cert.status = 'AVAILABLE';
    cert.approvedAt = new Date().toISOString();
    cert.documentUrl = documentUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    cert.remarks = remarks || 'Approved & Signed by Academic Section';

    return successResponse(res, { request: cert }, 'Certificate approved and issued to student');
  } catch (error) {
    return errorResponse(res, 'Failed to approve certificate', 'CERT_APPROVE_ERROR', 500);
  }
};

export const getCertificateById = async (req, res) => {
  try {
    const { id } = req.params;
    const cert = memoryCertificates.find(c => c.id === id || c.requestNumber === id);
    if (!cert) return errorResponse(res, 'Certificate not found', 'NOT_FOUND', 404);
    return successResponse(res, cert, 'Certificate details retrieved');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch certificate', 'FETCH_ERROR', 500);
  }
};

export const downloadCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const cert = memoryCertificates.find(c => c.id === id || c.requestNumber === id);
    if (!cert) return errorResponse(res, 'Certificate not found', 'NOT_FOUND', 404);
    if (cert.status !== 'AVAILABLE') {
      return errorResponse(res, 'Certificate is still under processing and not yet available for download', 'NOT_READY', 400);
    }
    return successResponse(res, {
      downloadUrl: cert.documentUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileName: `${cert.certificateType}_${cert.requestNumber}.pdf`
    }, 'Certificate download URL generated');
  } catch (error) {
    return errorResponse(res, 'Failed to generate download link', 'DOWNLOAD_ERROR', 500);
  }
};
