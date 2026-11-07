const { ValidationError } = require("../errors/app.error");
const { validate } = require("../validators/schema.validator");

/**
 * Middleware de validacion por schema para req.body.
 * Si el cuerpo no cumple el schema termina con un ValidationError
 * que lleva el detalle campo por campo.
 */
function validateBody(schema) {
  return (req, res, next) => {
    const result = validate(schema, req.body);
    if (!result.ok) {
      next(new ValidationError("El cuerpo de la peticion no cumple el schema", result.errors));
      return;
    }
    // El cuerpo saneado reemplaza el original: types corregidos,
    // campos prohibidos eliminados y defaults aplicados.
    req.body = result.value;
    next();
  };
}

module.exports = { validateBody };
