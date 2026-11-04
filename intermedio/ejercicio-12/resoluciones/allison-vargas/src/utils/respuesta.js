export const enviar = (res, data, status = 200) =>
  res.status(status).json({ ok: true, data });

export function enviarListado(res, { data, paginacion }, contexto) {
  res.set('X-Total-Count', String(paginacion.total));
  const cuerpo = { ok: true };
  if (contexto) cuerpo.pelicula = contexto;
  res.status(200).json({ ...cuerpo, data, paginacion });
}
