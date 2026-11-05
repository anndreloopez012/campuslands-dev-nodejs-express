import { Router } from 'express';
import { getHealth, getPackages, getDiscounts, getAuditLogs } from '../controllers/tourism.controller.js';
import { authorizeRoles } from '../middlewares/rbac.middleware.js';

const router = Router();
router.get('/intermedio/ejercicio-17', getHealth);
router.get('/api/tourism/packages', getPackages); // Público
router.get('/api/tourism/discounts', authorizeRoles('agente', 'admin'), getDiscounts); // Agente o Admin
router.get('/api/tourism/audit-logs', authorizeRoles('admin'), getAuditLogs); // Solo Admin

export default router;
