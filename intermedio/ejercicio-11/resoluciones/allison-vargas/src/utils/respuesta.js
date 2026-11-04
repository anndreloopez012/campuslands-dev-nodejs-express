export function responderListado(res, { data, busqueda, paginacion }) {
  res.set('X-Total-Count', String(paginacion.total));
  res.status(200).json({ ok: true, data, busqueda, paginacion });
}
