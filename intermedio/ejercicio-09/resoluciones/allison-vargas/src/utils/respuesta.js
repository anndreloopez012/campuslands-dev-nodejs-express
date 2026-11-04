function enlace(req, pagina, rel) {
  const url = new URL(req.originalUrl, 'http://localhost');
  url.searchParams.set('pagina', pagina);
  return `<${url.pathname}${url.search}>; rel="${rel}"`;
}

export function responderListado(req, res, { data, paginacion, consulta }) {
  const enlaces = [];
  if (paginacion.hayAnterior) {
    enlaces.push(enlace(req, 1, 'first'), enlace(req, paginacion.pagina - 1, 'prev'));
  }
  if (paginacion.haySiguiente) {
    enlaces.push(enlace(req, paginacion.pagina + 1, 'next'), enlace(req, paginacion.totalPaginas, 'last'));
  }

  res.set('X-Total-Count', String(paginacion.total));
  if (enlaces.length) res.set('Link', enlaces.join(', '));

  res.status(200).json({ ok: true, data, paginacion, consulta });
}
