import { aProblema } from '../http/problemas.js';

export const registroPorDefecto = (entrada) => {
  console.error(JSON.stringify(entrada));
};

export const manejadorDeErrores = ({ registro = registroPorDefecto } = {}) => (err, req, res, next) => {
  if (res.headersSent) return next(err);
  const { status, cuerpo, cabeceras, inesperado } = aProblema(err, {
    instance: req.originalUrl,
    idPeticion: req.idPeticion,
  });
  if (inesperado) {
    registro({
      nivel: 'error',
      idPeticion: req.idPeticion,
      metodo: req.method,
      ruta: req.originalUrl,
      mensaje: err?.message,
      pila: err?.stack,
    });
  }
  res.set(cabeceras);
  res.status(status).type('application/problem+json').json(cuerpo);
  return undefined;
};
