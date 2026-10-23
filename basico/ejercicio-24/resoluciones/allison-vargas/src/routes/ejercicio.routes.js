import { Router } from 'express';
import {
  ejecutarEjercicio,
  obtenerFormulas,
  obtenerFormulaPorId,
  crearNuevaFormula,
  actualizarFormulaExistente,
  eliminarFormulaExistente,
} from '../controllers/ejercicio.controller.js';

const router = Router();

// GET /basico/ejercicio-24
router.get('/', ejecutarEjercicio);

// GET /basico/ejercicio-24/formulas
router.get('/formulas', obtenerFormulas);

// GET /basico/ejercicio-24/formulas/:id
router.get('/formulas/:id', obtenerFormulaPorId);

// POST /basico/ejercicio-24/formulas
router.post('/formulas', crearNuevaFormula);

// PUT /basico/ejercicio-24/formulas/:id
router.put('/formulas/:id', actualizarFormulaExistente);

// DELETE /basico/ejercicio-24/formulas/:id
router.delete('/formulas/:id', eliminarFormulaExistente);

export default router;
