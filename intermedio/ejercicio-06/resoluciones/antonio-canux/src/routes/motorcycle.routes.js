import { Router } from 'express';
import { listMotorcycles, registerMotorcycle } from '../controllers/motorcycle.controller.js';
import { validateBody } from '../middlewares/validator.middleware.js';
import { createMotorcycleRules } from '../schemas/motorcycle.schema.js';

const router = Router();

router.get('/', listMotorcycles);
// Aplicación del middleware centralizado de validación
router.post('/', validateBody(createMotorcycleRules), registerMotorcycle);

export default router;