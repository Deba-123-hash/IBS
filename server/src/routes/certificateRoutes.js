import express from 'express';
import {
  getCertificates,
  getCertificateById,
  requestCertificate,
  approveCertificate,
  downloadCertificate
} from '../controllers/certificateController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getCertificates);
router.get('/me', authenticate, getCertificates);
router.get('/:id', authenticate, getCertificateById);
router.get('/:id/download', authenticate, downloadCertificate);
router.post('/', authenticate, requestCertificate);
router.post('/request', authenticate, requestCertificate);
router.patch('/:id/approve', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), approveCertificate);

export default router;
