import { Router } from 'express';
import * as controller from '../controllers/motos.controller.js';
import { validate } from '../middlewares/validate.js';
import { idParams } from '../validators/schemas/common.schema.js';
import { motoBody, motoQuery } from '../validators/schemas/moto.schema.js';

const router = Router();

router.get('/', validate({ query: motoQuery }), controller.listar);
router.post('/', validate({ body: motoBody }), controller.crear);
router.get('/:id', validate({ params: idParams }), controller.obtener);
router.put('/:id', validate({ params: idParams, body: motoBody }), controller.actualizar);
router.delete('/:id', validate({ params: idParams }), controller.eliminar);

export default router;
