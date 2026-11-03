// destinos/populares DEBE declararse
// ANTES que /destinos/:id. Si se pusiera despues, Express interpretaria
// "populares" como el valor del parametro :id, y esta ruta nunca se
// alcanzaria a ejecutar.

import { Router } from 'express';
import {
  ejecutarEjercicio,
  obtenerDestinos,
  obtenerDestinosPopulares,
  obtenerDestinoPorId,
} from '../controllers/ejercicio.controller.js';

const router = Router();

// GET /basico/ejercicio-17
router.get('/', ejecutarEjercicio);

// GET /basico/ejercicio-17/destinos?pais=&precioMax=
router.get('/destinos', obtenerDestinos);

// GET /basico/ejercicio-17/destinos/populares (ruta estatica primero)
router.get('/destinos/populares', obtenerDestinosPopulares);

// GET /basico/ejercicio-17/destinos/:id (ruta dinamica despues)
router.get('/destinos/:id', obtenerDestinoPorId);

export default router;
