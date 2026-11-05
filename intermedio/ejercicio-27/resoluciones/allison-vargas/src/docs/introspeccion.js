const prefijoDe = (capa) => capa.regexp.source
  .replace('^', '')
  .replace('\\/?(?=\\/|$)', '')
  .replaceAll('\\/', '/');

function recorrer(pila, base, salida) {
  for (const capa of pila) {
    if (capa.route) {
      for (const metodo of Object.keys(capa.route.methods)) {
        if (metodo !== '_all') salida.push({ metodo: metodo.toUpperCase(), ruta: base + capa.route.path });
      }
    } else if (capa.name === 'router' && capa.handle.stack) {
      recorrer(capa.handle.stack, base + prefijoDe(capa), salida);
    }
  }
}

export function listarRutas(app, base = '') {
  const salida = [];
  recorrer(app._router.stack, '', salida);
  return salida.map(({ metodo, ruta }) => {
    const relativa = ruta.startsWith(base) ? ruta.slice(base.length) : ruta;
    const normalizada = relativa.length > 1 ? relativa.replace(/\/$/, '') : relativa;
    return { metodo, ruta: (normalizada || '/').replace(/:([A-Za-z0-9_]+)/g, '{$1}') };
  });
}
