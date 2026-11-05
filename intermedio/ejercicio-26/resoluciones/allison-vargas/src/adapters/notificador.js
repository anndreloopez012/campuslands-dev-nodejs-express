export function crearDestinoMemoria({ limite = 50, reloj = () => new Date() } = {}) {
  const eventos = [];
  return {
    async enviar(evento) {
      eventos.push({ ...evento, registradoEn: reloj().toISOString() });
      if (eventos.length > limite) eventos.shift();
    },
    recientes() {
      return [...eventos].reverse();
    },
  };
}

export function crearDestinoWebhook({ url, fetchFn = (...args) => globalThis.fetch(...args) }) {
  return {
    async enviar(evento) {
      const respuesta = await fetchFn(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(evento),
      });
      if (!respuesta.ok) throw new Error(`El webhook respondio ${respuesta.status}`);
    },
  };
}

export function crearNotificador({ destinos }) {
  return {
    destinos: destinos.length,
    async enviar(evento) {
      const resultados = await Promise.allSettled(destinos.map((destino) => destino.enviar(evento)));
      const fallidos = resultados.filter((resultado) => resultado.status === 'rejected').length;
      if (fallidos === destinos.length) throw new Error('Ningun destino recibio el evento');
      return { enviados: destinos.length - fallidos, fallidos };
    },
  };
}
