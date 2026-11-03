import { Router } from 'express';
import { createMotorcycle, listMotorcycles } from '../controllers/motorcyclesController.js';
import { createMaintenance, listMaintenance } from '../controllers/maintenanceController.js';

const router = Router();
router.get('/', listMotorcycles);
router.post('/', createMotorcycle);
router.get('/:id/maintenance', listMaintenance);
router.post('/:id/maintenance', createMaintenance);
export default router;
