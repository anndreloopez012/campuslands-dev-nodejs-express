export function manejarErrores(error, req, res, next) {
  let status = error.status || 500;
  let mensaje = error.message;

  if (status === 500) {
    console.log('Error interno:', error.message);
    mensaje = 'Error interno del servidor';
  }

  res.status(status).json({ ok: false, message: mensaje });
}
