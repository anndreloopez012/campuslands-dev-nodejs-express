import { Router } from 'express';
import { NotFoundError } from '../utils/errors.js';
import { metodoNoPermitido } from '../middlewares/metodoNoPermitido.js';
import { exigirJson } from '../middlewares/exigirJson.js';

export function crearSchemasRouter({ esquemas }) {
  const router = Router();

  const buscar = (nombre) => {
    if (!Object.hasOwn(esquemas, nombre)) {
      throw new NotFoundError(`No existe el schema ${nombre}. Disponibles: ${Object.keys(esquemas).join(', ')}`, 'SCHEMA_NO_ENCONTRADO');
    }
    return esquemas[nombre];
  };

  router.route('/')
    .get((req, res) => {
      res.status(200).json({ ok: true, data: Object.keys(esquemas) });
    })
    .all(metodoNoPermitido(['GET']));

  router.route('/:nombre')
    .get((req, res) => {
      const esquema = buscar(req.params.nombre);
      res.status(200).json({
        ok: true,
        data: { $schema: 'https://json-schema.org/draft/2020-12/schema', ...esquema.aJsonSchema() },
      });
    })
    .all(metodoNoPermitido(['GET']));

  router.route('/:nombre/validar')
    .post(exigirJson, (req, res) => {
      const resultado = buscar(req.params.nombre).validar(req.body, { en: 'cuerpo' });
      res.status(200).json({
        ok: true,
        data: resultado.exito
          ? { valido: true, datos: resultado.datos }
          : { valido: false, errores: resultado.errores },
      });
    })
    .all(metodoNoPermitido(['POST']));

  return router;
}
