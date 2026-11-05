const ENTORNOS = ['development', 'production', 'test'];

export function cargarConfig(env = process.env) {
  const errores = [];

  const entero = (nombre, porDefecto, minimo, maximo) => {
    const crudo = env[nombre];
    if (crudo === undefined || crudo === '') return porDefecto;
    if (!/^\d+$/.test(crudo) || Number(crudo) < minimo || Number(crudo) > maximo) {
      errores.push(`${nombre} debe ser un entero entre ${minimo} y ${maximo}`);
      return porDefecto;
    }
    return Number(crudo);
  };

  let entorno = env.NODE_ENV || 'development';
  if (!ENTORNOS.includes(entorno)) {
    errores.push(`NODE_ENV debe ser uno de: ${ENTORNOS.join(', ')}`);
    entorno = 'development';
  }

  const config = {
    entorno,
    puerto: entero('PORT', 3000, 1, 65535),
    proxies: entero('PROXIES_CONFIABLES', 0, 0, 10),
    apagadoMs: entero('APAGADO_TIMEOUT_MS', 10000, 100, 120000),
    limite: Object.freeze({
      maximo: entero('LIMITE_PETICIONES', 100, 1, 100000),
      ventanaMs: entero('LIMITE_VENTANA_MS', 60000, 1000, 3600000),
    }),
    cache: Object.freeze({
      ttlMs: entero('CACHE_TTL_MS', 5000, 1, 3600000),
    }),
  };

  if (errores.length) throw new Error(`Configuracion invalida:\n- ${errores.join('\n- ')}`);
  return Object.freeze(config);
}
