export function crearBusEventos({ logger }) {
  const manejadores = new Map();

  function suscribir(evento, manejador) {
    if (typeof evento !== 'string' || !evento) throw new Error('El evento necesita un nombre');
    if (typeof manejador !== 'function') throw new Error(`El manejador de ${evento} debe ser una funcion`);
    const lista = manejadores.get(evento) ?? [];
    lista.push(manejador);
    manejadores.set(evento, lista);
    return () => {
      const actual = manejadores.get(evento) ?? [];
      manejadores.set(evento, actual.filter((m) => m !== manejador));
    };
  }

  async function emitir(evento, carga) {
    const lista = [...(manejadores.get(evento) ?? [])];
    const congelada = Object.freeze({ ...carga });
    const resultados = await Promise.allSettled(lista.map(async (manejador) => manejador(congelada)));
    let fallidos = 0;
    for (const resultado of resultados) {
      if (resultado.status === 'rejected') {
        fallidos += 1;
        logger.error('manejador_de_evento_fallido', { evento, error: resultado.reason?.message });
      }
    }
    return { entregados: lista.length - fallidos, fallidos };
  }

  function cantidad(evento) {
    return (manejadores.get(evento) ?? []).length;
  }

  return { suscribir, emitir, cantidad };
}
