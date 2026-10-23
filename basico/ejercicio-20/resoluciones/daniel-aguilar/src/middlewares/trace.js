// Registra por que middlewares pasa cada peticion, para ver el ORDEN de ejecucion.
const trace = (name) => (req, res, next) => {
  req.trail = req.trail || [];
  req.trail.push(name);
  next();
};

module.exports = { trace };
