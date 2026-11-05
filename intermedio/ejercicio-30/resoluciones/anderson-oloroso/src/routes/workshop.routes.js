import { Router } from 'express';
import {
  getHealth,
  listRecords,
  getRecord,
  registerRecord
} from '../controllers/workshop.controller.js';
import { validateServiceRecord } from '../middlewares/validator.middleware.js';

const router = Router();

router.get('/intermedio/ejercicio-30', getHealth);
router.get('/api/workshop/records', listRecords);
router.get('/api/workshop/records/:id', getRecord);
router.post('/api/workshop/records', validateServiceRecord, registerRecord);

export default router;
