import { ValidationError } from '../utils/errors.js';

export const validar = ({ parametros, consulta, cuerpo }) => (req, res, next) => {
  const partes = [
    ['parametros', parametros, req.params],
    ['consulta', consulta, req.query],
    ['cuerpo', cuerpo, req.body],
  ];
  const datos = {};
  const errores = [];

  for (const [en, esquema, entrada] of partes) {
    if (!esquema) continue;
    const resultado = esquema.validar(entrada, { en });
    if (resultado.exito) datos[en] = resultado.datos;
    else errores.push(...resultado.errores);
  }

  if (errores.length) return next(new ValidationError('Datos invalidos', errores));
  req.datos = datos;
  return next();
};
