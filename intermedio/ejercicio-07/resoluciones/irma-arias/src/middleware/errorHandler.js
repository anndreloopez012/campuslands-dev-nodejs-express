export function errorHandler(error, _request, response, _next) {
  const status = error.status || 500;
  response.status(status).json({ error: error.message || 'Error interno del servidor.' });
}
