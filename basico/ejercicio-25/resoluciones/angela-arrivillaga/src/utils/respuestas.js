export function exito(res, mensaje, data, status = 200) {
  res.status(status).json({ ok: true, message: mensaje, data: data });
}

export function fallo(res, status, mensaje) {
  res.status(status).json({ ok: false, message: mensaje, data: null });
}
