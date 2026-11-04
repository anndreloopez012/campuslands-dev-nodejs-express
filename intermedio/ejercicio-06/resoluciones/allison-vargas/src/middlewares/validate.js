import { validar } from '../validators/engine.js';
import { AppError } from '../utils/AppError.js';

const ORIGENES = ['params', 'query', 'body'];

export const validate = (esquemas) => (req, res, next) => {
  const errores = [];

  for (const origen of ORIGENES) {
    if (!esquemas[origen]) continue;

    const resultado = validar(esquemas[origen], req[origen]);
    errores.push(...resultado.errores.map((e) => ({ origen, ...e })));
    if (!resultado.errores.length) req[origen] = resultado.datos;
  }

  if (errores.length) {
    return next(new AppError('Datos invalidos', 400, errores));
  }
  next();
};
