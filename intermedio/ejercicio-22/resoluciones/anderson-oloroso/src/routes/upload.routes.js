import { Router } from 'express';
import { getHealth, listUploads, handleUpload } from '../controllers/upload.controller.js';

const router = Router();
router.get('/intermedio/ejercicio-22', getHealth);
router.get('/api/arq3d/blueprints', listUploads);
router.post('/api/arq3d/blueprints/upload', handleUpload);

export default router;
