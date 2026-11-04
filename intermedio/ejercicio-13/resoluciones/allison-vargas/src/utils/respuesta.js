export const enviar = (res, data, status = 200) =>
  res.status(status).json({ ok: true, data });

export function enviarListado(res, { data, paginacion }) {
  res.set('X-Total-Count', String(paginacion.total));
  res.status(200).json({ ok: true, data, paginacion });
}
