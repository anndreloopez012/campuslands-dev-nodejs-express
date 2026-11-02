// Envuelve un controlador async: cualquier error (throw o promesa rechazada) va a next(error).
// Asi no hace falta repetir try/catch en cada controlador.
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { asyncHandler };
