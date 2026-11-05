import { Router } from 'express';
import {
  getHealth,
  listOrders,
  registerOrder
} from '../controllers/mechanic.controller.js';
import { validateOrderPayload } from '../middlewares/validateOrder.middleware.js';

const router = Router();

// Endpoint de verificación del README base
router.get('/intermedio/ejercicio-06', getHealth);

// Endpoints de Motos y Mecánica
router.get('/api/mechanic/orders', listOrders);
// Aplica validación centralizada como middleware antes de entrar al controller
router.post('/api/mechanic/orders', validateOrderPayload, registerOrder);

export default router;
