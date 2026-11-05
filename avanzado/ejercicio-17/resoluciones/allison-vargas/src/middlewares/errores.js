import { crear, esErrorDeNegocio } from '../errores/index.js';

export function normalizar(err) {
  if (esErrorDeNegocio(err)) return err;
  if (err?.type === 'entity.parse.failed') return crear('JSON_INVALIDO', {}, { causa: err });
  if (err?.type === 'entity.too.large') return crear('PAYLOAD_GRANDE', {}, { causa: err });
  return null;
}

export const registroPorDefecto = (entrada) => {
  console.error(JSON.stringify(entrada));
};

export const manejadorDeErrores = ({ registro = registroPorDefecto } = {}) => (err, req, res, next) => {
  if (res.headersSent) return next(err);
  const error = normalizar(err);
  if (!error) {
    registro({
      nivel: 'error', metodo: req.method, ruta: req.originalUrl, mensaje: err?.message, pila: err?.stack,
    });
    const interno = crear('ERROR_INTERNO');
    return res.status(interno.status).json({ ok: false, message: interno.message, codigo: interno.codigo });
  }
  if (error.cabeceras) res.set(error.cabeceras);
  // RFC 6750: un 401 de una API con Bearer indica el esquema y, si aplica, el tipo de error
  if (error.status === 401) {
    const tipo = error.codigo.startsWith('TOKEN') || error.codigo === 'SESION_REVOCADA' ? ', error="invalid_token"' : '';
    res.set('WWW-Authenticate', `Bearer realm="viajes"${tipo}`);
  }
  // el motivo exacto de un token invalido no se devuelve: solo le serviria a quien intenta falsificarlo
  const cuerpo = { ok: false, message: error.message, codigo: error.codigo };
  if (Object.keys(error.contexto).length && error.status !== 401) cuerpo.contexto = { ...error.contexto };
  if (error.detalles) cuerpo.errores = error.detalles;
  return res.status(error.status).json(cuerpo);
};
