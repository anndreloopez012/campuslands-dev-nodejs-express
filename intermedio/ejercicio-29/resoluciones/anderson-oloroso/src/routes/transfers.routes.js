import { Router } from 'express';
import {
  getHealth,
  listTransfers,
  postTransfer
} from '../controllers/transfers.controller.js';

const router = Router();

router.get('/intermedio/ejercicio-29', getHealth);
router.get('/api/football/transfers', listTransfers);
router.post('/api/football/transfers', postTransfer);

export default router;
