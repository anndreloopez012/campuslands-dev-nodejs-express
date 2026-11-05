import { NIVELES } from './logger.js';

export const destinoConsola = (salida = process.stdout) => (entrada) => {
  salida.write(`${JSON.stringify(entrada)}\n`);
};

export function crearMemoria({ capacidad = 500 } = {}) {
  if (!Number.isInteger(capacidad) || capacidad < 1) throw new TypeError('capacidad invalida');
  let entradas = [];
  let descartadas = 0;
  let recibidas = 0;

  function destino(entrada) {
    recibidas += 1;
    entradas.push(entrada);
    if (entradas.length > capacidad) {
      entradas.shift();
      descartadas += 1;
    }
  }

  return {
    destino,
    consultar({ nivel, requestId, mensaje, limite = 50 } = {}) {
      const minimo = nivel ? NIVELES[nivel] : 0;
      const encontradas = entradas.filter((e) => NIVELES[e.nivel] >= minimo
        && (!requestId || e.requestId === requestId)
        && (!mensaje || e.mensaje.includes(mensaje)));
      return { total: encontradas.length, data: encontradas.slice(-limite).reverse() };
    },
    estadisticas() {
      const porNivel = Object.fromEntries(Object.keys(NIVELES).map((n) => [n, 0]));
      for (const e of entradas) porNivel[e.nivel] += 1;
      return {
        capacidad, guardadas: entradas.length, recibidas, descartadas, porNivel,
      };
    },
    limpiar() {
      const borradas = entradas.length;
      entradas = [];
      return borradas;
    },
  };
}
