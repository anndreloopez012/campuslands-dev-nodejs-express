import { Router } from 'express';
import {
  ejecutarEjercicio,
  obtenerJugadores,
  obtenerJugadorPorId,
  crearNuevoJugador,
  obtenerColas,
  unirseACola,
  forzarErrorServidor,
} from '../controllers/ejercicio.controller.js';
import { verificarApiKey } from '../middlewares/verificarApiKey.js';

const router = Router();

router.get('/', ejecutarEjercicio);
router.get('/jugadores', obtenerJugadores);
router.get('/jugadores/:id', obtenerJugadorPorId);
router.post('/jugadores', crearNuevoJugador);
router.get('/colas', obtenerColas);
router.post('/colas/:id/unirse', verificarApiKey, unirseACola);
router.get('/forzar-error', forzarErrorServidor);

export default router;
