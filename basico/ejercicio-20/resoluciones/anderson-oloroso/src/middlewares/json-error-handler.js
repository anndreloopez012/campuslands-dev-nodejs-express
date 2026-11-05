/**
 * Middleware de error que captura SyntaxError de JSON malformado
 * y devuelve una respuesta 400 en lugar del HTML por defecto de Express.
 */
const jsonErrorHandler = (err, _req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "JSON malformado en el body" });
  }
  next(err);
};

export default jsonErrorHandler;
