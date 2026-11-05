export function crearCache({ reloj, ttlMs = 5000, maxEntradas = 100 }) {
  const entradas = new Map();
  const enVuelo = new Map();
  const estadisticas = { aciertos: 0, fallos: 0, expiradas: 0, expulsadas: 0 };
  let generacion = 0;

  function leer(clave) {
    const entrada = entradas.get(clave);
    if (!entrada) return undefined;
    if (entrada.expira <= reloj().getTime()) {
      entradas.delete(clave);
      estadisticas.expiradas += 1;
      return undefined;
    }
    entradas.delete(clave);
    entradas.set(clave, entrada);
    return entrada;
  }

  function guardar(clave, valor, ttl = ttlMs) {
    entradas.delete(clave);
    entradas.set(clave, { valor, expira: reloj().getTime() + ttl });
    while (entradas.size > maxEntradas) {
      entradas.delete(entradas.keys().next().value);
      estadisticas.expulsadas += 1;
    }
  }

  async function consultar(clave, calcular, ttl = ttlMs) {
    const entrada = leer(clave);
    if (entrada) {
      estadisticas.aciertos += 1;
      return { valor: entrada.valor, acierto: true };
    }
    estadisticas.fallos += 1;
    if (enVuelo.has(clave)) return { valor: await enVuelo.get(clave), acierto: false };

    const desde = generacion;
    const promesa = Promise.resolve().then(calcular);
    enVuelo.set(clave, promesa);
    try {
      const valor = await promesa;
      if (desde === generacion) guardar(clave, valor, ttl);
      return { valor, acierto: false };
    } finally {
      enVuelo.delete(clave);
    }
  }

  function borrar(clave) {
    generacion += 1;
    return entradas.delete(clave);
  }

  function borrarPrefijo(prefijo) {
    generacion += 1;
    let borradas = 0;
    for (const clave of [...entradas.keys()]) {
      if (clave.startsWith(prefijo)) {
        entradas.delete(clave);
        borradas += 1;
      }
    }
    return borradas;
  }

  function limpiar() {
    generacion += 1;
    entradas.clear();
  }

  return {
    consultar,
    guardar,
    borrar,
    borrarPrefijo,
    limpiar,
    tamano: () => entradas.size,
    estadisticas: () => ({ ...estadisticas, entradas: entradas.size }),
  };
}
