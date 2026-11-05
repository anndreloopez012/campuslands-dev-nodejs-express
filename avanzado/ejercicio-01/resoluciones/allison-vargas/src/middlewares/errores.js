import { AppError, PayloadTooLargeError, ValidationError } from '../utils/errors.js';

export function normalizar(err) {
  if (err instanceof AppError) return err;
  if (err.type === 'entity.parse.failed') {
    return new ValidationError('El body no es un JSON valido', undefined, 'JSON_INVALIDO');
  }
  if (err.type === 'entity.too.large') return new PayloadTooLargeError();
  const inesperado = new AppError('Error interno del servidor', 500, 'ERROR_INTERNO');
  inesperado.isOperational = false;
  inesperado.causa = err;
  return inesperado;
}

export const crearManejador = (formatear) => (err, req, res, next) => {
  if (res.headersSent) return next(err);
  const error = normalizar(err);
  if (!error.isOperational) console.error(error.causa);
  if (error.cabeceras) res.set(error.cabeceras);
  return formatear(error, req, res);
};

export function formatoClasico(error, req, res) {
  const cuerpo = { ok: false, message: error.message, codigo: error.codigo };
  if (error.detalles) cuerpo.errores = error.detalles;
  res.status(error.statusCode).json(cuerpo);
}

const TITULOS = {
  400: 'Solicitud invalida',
  401: 'No autenticado',
  403: 'Prohibido',
  404: 'No encontrado',
  405: 'Metodo no permitido',
  409: 'Conflicto',
  410: 'Recurso retirado',
  413: 'Body demasiado grande',
  415: 'Tipo de contenido no soportado',
  422: 'No se pudo procesar',
  500: 'Error interno',
};

export function formatoProblema(base) {
  return (error, req, res) => {
    const cuerpo = {
      type: `${base}/errores/${error.codigo.toLowerCase()}`,
      title: TITULOS[error.statusCode] ?? 'Error',
      status: error.statusCode,
      detail: error.message,
      instance: req.originalUrl,
      code: error.codigo,
    };
    if (error.detalles) {
      cuerpo.errors = error.detalles.map(({ campo, mensaje }) => ({ pointer: `/${campo}`, detail: mensaje }));
    }
    res.status(error.statusCode).type('application/problem+json').json(cuerpo);
  };
}
