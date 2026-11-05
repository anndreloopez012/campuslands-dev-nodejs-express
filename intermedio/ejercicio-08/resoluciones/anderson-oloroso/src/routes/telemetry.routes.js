import { Router } from 'express';
import {
  getHealth,
  listTelemetry,
  registerTelemetry
} from '../controllers/telemetry.controller.js';

const router = Router();

// Endpoint de verificación del README base
router.get('/intermedio/ejercicio-08', getHealth);

// Endpoints Telemetría Hiperdeportivos
router.get('/api/hypercars/telemetry', listTelemetry);
router.post('/api/hypercars/telemetry', registerTelemetry);

export default router;
