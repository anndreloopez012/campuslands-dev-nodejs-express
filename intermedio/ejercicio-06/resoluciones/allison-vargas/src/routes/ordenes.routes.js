import { Router } from 'express';
import * as controller from '../controllers/ordenes.controller.js';
import { validate } from '../middlewares/validate.js';
import { idParams } from '../validators/schemas/common.schema.js';
import { ordenBody, ordenEstadoBody, ordenQuery } from '../validators/schemas/orden.schema.js';

const router = Router();

router.get('/', validate({ query: ordenQuery }), controller.listar);
router.post('/', validate({ body: ordenBody }), controller.crear);
router.get('/:id', validate({ params: idParams }), controller.obtener);
router.patch('/:id/estado', validate({ params: idParams, body: ordenEstadoBody }), controller.cambiarEstado);

export default router;
