const { aplicarReglas } = require('./reglas');
const { ValidationError } = require('../errors/app.error');

/**
 * Convierte una definicion de schema a un middleware de Express.
 *
 * Schema: { campo: [[regla1, regla2], opcional={parte:'body'}] }
 * Si algun campo del schema falla responde 400 con todos los errores juntos.
 */
function validar(schema) {
  return (req, res, next) => {
    const errores = [];

    for (const [campo, definicion] of Object.entries(schema)) {
      const [listaReglas, opciones = {}] = definicion;
      const fuente = opciones.fuente || req.body;
      const resultado = aplicarReglas(fuente[campo], listaReglas);
      if (resultado !== null) errores.push(`"${campo}" ${resultado}`);
    }

    if (errores.length > 0) {
      return next(new ValidationError(errores.join(' | ')));
    }

    return next();
  };
}

function camposValidos(req, res, next) {
  const camposPermitidos = req.schemaCampos || [];
  const sobrantes = Object.keys(req.body || {}).filter((campo) => !camposPermitidos.includes(campo));
  if (sobrantes.length > 0) {
    return next(new ValidationError(`Campos no permitidos: ${sobrantes.join(', ')}`));
  }
  return next();
}

module.exports = validar;
module.exports.camposValidos = camposValidos;
