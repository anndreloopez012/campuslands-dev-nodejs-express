import { crear, esErrorDeNegocio } from '../errores/index.js';

export function normalizar(err) {
  if (esErrorDeNegocio(err)) return err;
  if (err?.type === 'entity.parse.failed') return crear('JSON_INVALIDO', {}, { causa: err });
  if (err?.type === 'entity.too.large') return crear('PAYLOAD_GRANDE', {}, { causa: err });
  return null;
}

export const manejadorDeErrores = ({ logger }) => (err, req, res, next) => {
  if (res.headersSent) return next(err);
  const log = req.log ?? logger;
  const error = normalizar(err);
  if (!error) {
    log.error('error.no_controlado', { metodo: req.method, ruta: req.originalUrl, error: err });
    const interno = crear('ERROR_INTERNO');
    return res.status(interno.status).json({
      ok: false, message: interno.message, codigo: interno.codigo, requestId: req.id,
    });
  }
  log.debug('error.negocio', { codigo: error.codigo, status: error.status });
  if (error.cabeceras) res.set(error.cabeceras);
  const cuerpo = { ok: false, message: error.message, codigo: error.codigo };
  if (Object.keys(error.contexto).length) cuerpo.contexto = { ...error.contexto };
  if (error.detalles) cuerpo.errores = error.detalles;
  if (req.id) cuerpo.requestId = req.id;
  return res.status(error.status).json(cuerpo);
};
