export function responderListado(res, { data, orden, paginacion }) {
  res.set('X-Total-Count', String(paginacion.total));
  res.set('X-Orden', orden.aplicado.map((c) => `${c.campo}:${c.direccion}`).join(','));
  res.status(200).json({ ok: true, data, orden, paginacion });
}
