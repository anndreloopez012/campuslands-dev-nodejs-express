const escribirEnConsola = (linea) => process.stdout.write(`${linea}\n`);

export function crearLogger({ salida = escribirEnConsola, reloj = () => new Date(), base = {} } = {}) {
  const escribir = (nivel, msg, contexto) => {
    salida(JSON.stringify({ ts: reloj().toISOString(), nivel, msg, ...base, ...contexto }));
  };

  return {
    info: (msg, contexto) => escribir('info', msg, contexto),
    warn: (msg, contexto) => escribir('warn', msg, contexto),
    error: (msg, contexto) => escribir('error', msg, contexto),
    hijo: (extra) => crearLogger({ salida, reloj, base: { ...base, ...extra } }),
  };
}
