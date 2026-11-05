// limita cuantas tareas usan un recurso al mismo tiempo; las demas esperan en orden de llegada
export function crearSemaforo(maximo) {
  if (!Number.isInteger(maximo) || maximo < 1) throw new TypeError('El maximo debe ser un entero positivo');
  let enUso = 0;
  const espera = [];

  function liberarUno() {
    enUso -= 1;
    const siguiente = espera.shift();
    if (siguiente) {
      enUso += 1;
      siguiente.resolver(crearLiberador());
    }
  }

  function crearLiberador() {
    let liberado = false;
    return () => {
      if (liberado) return;
      liberado = true;
      liberarUno();
    };
  }

  return {
    adquirir({ signal } = {}) {
      if (signal?.aborted) return Promise.reject(signal.reason);
      if (enUso < maximo) {
        enUso += 1;
        return Promise.resolve(crearLiberador());
      }
      return new Promise((resolver, rechazar) => {
        const turno = { resolver, rechazar };
        espera.push(turno);
        signal?.addEventListener('abort', () => {
          const indice = espera.indexOf(turno);
          if (indice !== -1) {
            espera.splice(indice, 1);
            rechazar(signal.reason);
          }
        }, { once: true });
      });
    },
    get enUso() { return enUso; },
    get enEspera() { return espera.length; },
    maximo,
  };
}

// varias peticiones iguales al mismo tiempo comparten un solo calculo
export function crearSingleFlight() {
  const enVuelo = new Map();
  return (clave, calcular) => {
    if (enVuelo.has(clave)) return enVuelo.get(clave);
    const promesa = Promise.resolve().then(calcular).finally(() => enVuelo.delete(clave));
    enVuelo.set(clave, promesa);
    return promesa;
  };
}
