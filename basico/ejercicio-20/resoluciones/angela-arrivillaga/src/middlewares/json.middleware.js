export function manejarJsonInvalido(error, req, res, next) {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ ok: false, message: 'El JSON enviado no es valido' });
  }

  console.log('Error:', error.message);
  res.status(500).json({ ok: false, message: 'Error interno del servidor' });
}
